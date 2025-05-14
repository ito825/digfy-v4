import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

function ArtistVisualizer() {
  const [artist, setArtist] = useState("oasis");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const fgRef = useRef<any>(null); // グラフのref

  // 検索ハンドラー
  const handleSubmit = async (
    e?: React.FormEvent | undefined,
    centerOverride?: string
  ): Promise<void> => {
    if (e) e.preventDefault();
    const targetArtist = centerOverride || artist;

    try {
      const response = await fetch("http://localhost:8000/api/graph-json/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ artist: targetArtist, level: 2 }),
      });

      const data = await response.json();
      if (response.ok) {
        setArtist(targetArtist);
        setGraphData(data);
      } else {
        alert(data.error || "エラーが発生しました");
      }
    } catch (err) {
      console.error("通信エラー", err);
      alert("通信に失敗しました");
    }
  };

  // グラフ表示後にズーム調整
  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400);
      }, 300); // レンダリング安定後にズーム
    }
  }, [graphData]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      {/* ナビゲーション */}
      <nav className="text-sm text-blue-400 space-x-4 mb-4">
        <a href="/" className="hover:underline">
          可視化
        </a>
        <a href="/login" className="hover:underline">
          ログイン
        </a>
        <a href="/signup" className="hover:underline">
          サインアップ
        </a>
        <a href="/MyNetworks" className="hover:underline">
          保存一覧
        </a>
      </nav>

      {/* タイトル */}
      <h1 className="text-3xl font-bold mb-6">関連アーティストを可視化</h1>

      {/* 検索フォーム */}
      <form onSubmit={handleSubmit} className="flex space-x-2 mb-6">
        <input
          type="text"
          placeholder="アーティスト名"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="px-3 py-1 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-1 bg-blue-600 rounded text-white hover:bg-blue-700"
        >
          検索
        </button>
      </form>

      {/* グラフ */}
      <div className="w-full max-w-6xl h-[600px] border border-gray-700 rounded overflow-hidden">
        <ForceGraph2D
          ref={fgRef}
          width={1000}
          height={600}
          backgroundColor="#1a202c"
          graphData={graphData}
          nodeLabel={(node: any) => node.id}
          nodeAutoColorBy="id"
          linkColor={() => "rgba(255,255,255,0.15)"}
          nodeCanvasObject={(
            node: any,
            ctx: CanvasRenderingContext2D,
            globalScale: number
          ) => {
            const label = node.id;
            const fontSize = 10 / globalScale;
            const radius = 15;

            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color || "gray";
            ctx.fill();

            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.lineWidth = 4;
            ctx.strokeStyle = "black";
            ctx.strokeText(label, node.x, node.y);
            ctx.fillStyle = "white";
            ctx.fillText(label, node.x, node.y);
          }}
          onNodeClick={(node: any) => {
            setArtist(node.id);
            handleSubmit(undefined, node.id);
          }}
        />
      </div>
    </div>
  );
}

export default ArtistVisualizer;

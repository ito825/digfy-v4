import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

function ArtistVisualizer() {
  const [artist, setArtist] = useState("oasis");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hoveredNodeInfo, setHoveredNodeInfo] = useState<{
    node: any;
    x: number;
    y: number;
  } | null>(null);
  const fgRef = useRef<any>(null);

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
        fetchDeezerPreview(targetArtist); // ついでに再生
      } else {
        alert(data.error || "エラーが発生しました");
      }
    } catch (err) {
      console.error("通信エラー", err);
      alert("通信に失敗しました");
    }
  };

  const fetchDeezerPreview = async (artistName: string) => {
    try {
      const res1 = await fetch(
        `http://localhost:8000/api/deezer/?q=${encodeURIComponent(artistName)}`
      );
      const data1 = await res1.json();

      if (!data1.data || data1.data.length === 0) {
        console.warn("アーティストが見つかりません");
        return;
      }

      const artistId = data1.data[0].id;

      const res2 = await fetch(
        `http://localhost:8000/api/deezer/top/?id=${artistId}`
      );
      const data2 = await res2.json();

      if (!data2.data || data2.data.length === 0) {
        console.warn("音源が見つかりません");
        return;
      }

      const previewUrl = data2.data[0].preview;
      setPreviewUrl(previewUrl);
    } catch (error) {
      console.error("Deezer fetch error", error);
    }
  };

  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => fgRef.current.zoomToFit(400), 300);
    }
  }, [graphData]);

  const playButtonRadius = 10;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-6">関連アーティストを可視化</h1>

      <form
        onSubmit={handleSubmit}
        className="flex space-x-2 mb-6 items-center"
      >
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="px-3 py-1 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="アーティスト名"
        />
        <button
          type="submit"
          className="px-4 py-1 bg-blue-600 rounded text-white hover:bg-blue-700"
        >
          検索
        </button>
      </form>

      <div className="w-full max-w-6xl h-[600px] border border-gray-700 rounded overflow-hidden mb-4">
        <ForceGraph2D
          ref={fgRef}
          width={1000}
          height={600}
          backgroundColor="#1a202c"
          graphData={graphData}
          nodeLabel={(node: any) => node.id}
          nodeAutoColorBy="id"
          onNodeHover={(node, event) => {
            if (node && event && fgRef.current) {
              const coords = fgRef.current.screen2GraphCoords(
                event.clientX,
                event.clientY
              );
              setHoveredNodeInfo({ node, x: coords.x, y: coords.y });
            } else {
              setHoveredNodeInfo(null);
            }
          }}
          nodeCanvasObject={(
            node: any,
            ctx: CanvasRenderingContext2D,
            globalScale: number
          ) => {
            const fontSize = 10 / globalScale;
            const label = node.id;
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

            if (hoveredNodeInfo && hoveredNodeInfo.node.id === node.id) {
              const px = node.x + 20;
              const py = node.y - 20;

              ctx.beginPath();
              ctx.arc(px, py, playButtonRadius, 0, 2 * Math.PI);
              ctx.fillStyle = "lightgreen";
              ctx.fill();

              ctx.beginPath();
              ctx.fillStyle = "black";
              ctx.moveTo(px - 3, py - 5);
              ctx.lineTo(px - 3, py + 5);
              ctx.lineTo(px + 5, py);
              ctx.closePath();
              ctx.fill();
            }
          }}
          onNodeClick={(node, event?: MouseEvent) => {
            if (!node || !event) return;

            if (hoveredNodeInfo && hoveredNodeInfo.node.id === node.id) {
              const dx = hoveredNodeInfo.x - (node.x + 20);
              const dy = hoveredNodeInfo.y - (node.y - 20);
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist <= playButtonRadius) {
                fetchDeezerPreview(node.id);
                return;
              }
            }

            setArtist(node.id);
            handleSubmit(undefined, node.id);
          }}
        />
      </div>

      {previewUrl && (
        <div className="my-4">
          <audio
            controls
            autoPlay
            src={previewUrl}
            className="w-full max-w-md"
          />
        </div>
      )}
    </div>
  );
}

export default ArtistVisualizer;

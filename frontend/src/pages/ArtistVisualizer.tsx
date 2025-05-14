import React, { useState, useRef, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { forceCollide } from "d3-force";

function ArtistVisualizer() {
  const [artist, setArtist] = useState("");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const fgRef = useRef<any>(null);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force("charge")?.strength(-150);
      fgRef.current.d3Force("link")?.distance(120);
      fgRef.current.d3Force("collide", forceCollide(30)); // 半径30の衝突防止
    }
  }, [graphData]); // グラフ更新時に反映

  const handleSubmit = async (
    e?: React.FormEvent,
    centerOverride?: string
  ): Promise<void> => {
    if (e) e.preventDefault();
    const targetArtist = centerOverride || artist;

    try {
      const response = await fetch("http://localhost:8000/api/graph-json/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      alert("通信に失敗しました");
    }
  };

  return (
    <>
      <h1>関連アーティストを可視化</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="アーティスト名"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
        <button type="submit">検索</button>
      </form>

      <ForceGraph2D
        ref={fgRef as any}
        width={1000}
        height={600}
        graphData={graphData}
        nodeLabel={(node: any) => node.id}
        nodeAutoColorBy="id"
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
          ctx.strokeStyle = "white";
          ctx.strokeText(label, node.x, node.y);
          ctx.fillStyle = "black";
          ctx.fillText(label, node.x, node.y);
        }}
        onNodeClick={(node: any) => {
          setArtist(node.id);
          handleSubmit(undefined, node.id);
        }}
      />
    </>
  );
}

export default ArtistVisualizer;

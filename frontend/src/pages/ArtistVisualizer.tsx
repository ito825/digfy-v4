import React, { useState } from "react";

function ArtistVisualizer() {
  const [artist, setArtist] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [image, setImage] = useState("");
  const username = localStorage.getItem("username"); // ログイン済みのユーザー名を取得

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8000/api/related-artists/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ artist, level: 2 }),
    });

    const data = await response.json();
    if (response.ok) {
      setHtmlContent(data.html); // HTML形式のグラフを表示
      setImage(data.img); // PNG画像のBase64を保存（ダウンロード用）
    } else {
      alert(data.error || "エラーが発生しました");
    }
  };

  return (
    <div>
      <h1>関連アーティストを可視化</h1>

      {username && <p>こんにちは、{username}さん！</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="アーティスト名"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
        <button type="submit">検索</button>
      </form>

      {htmlContent && (
        <div
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{ marginTop: "30px" }}
        />
      )}

      {image && (
        <div style={{ marginTop: "30px" }}>
          <a
            href={`data:image/png;base64,${image}`}
            download={`${artist}_network.png`}
            style={{ display: "block", marginTop: "10px" }}
          >
            📷 この画像をダウンロード
          </a>
        </div>
      )}
    </div>
  );
}

export default ArtistVisualizer;

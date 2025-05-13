import React, { useEffect, useState } from "react";

function SavedNetworks() {
  const [networks, setNetworks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access"); // JWTトークンを取得
      const response = await fetch("http://localhost:8000/api/my-networks/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNetworks(data);
      } else {
        console.error("取得に失敗しました");
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>保存されたネットワーク一覧</h1>
      {networks.length === 0 ? (
        <p>保存データがありません</p>
      ) : (
        networks.map((item: any, index: number) => (
          <div key={index} style={{ marginBottom: "40px" }}>
            <h3>
              {item.artist_name}（{new Date(item.created_at).toLocaleString()}）
            </h3>
            <div
              dangerouslySetInnerHTML={{ __html: item.html_content }}
              style={{ border: "1px solid #ccc", padding: "10px" }}
            />
          </div>
        ))
      )}
    </div>
  );
}

export default SavedNetworks;

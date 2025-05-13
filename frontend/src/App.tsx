// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ArtistVisualizer from "./pages/ArtistVisualizer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SavedList from "./pages/MyNetworks";

function App() {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/">可視化</Link> | <Link to="/login">ログイン</Link> |{" "}
          <Link to="/signup">サインアップ</Link> |{" "}
          <Link to="/MyNetworks">保存一覧</Link>
        </nav>

        <Routes>
          <Route path="/" element={<ArtistVisualizer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/MyNetworks" element={<SavedList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

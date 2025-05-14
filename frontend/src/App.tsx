import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ArtistVisualizer from "./pages/ArtistVisualizer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SavedList from "./pages/MyNetworks";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white p-4">
        {/* ナビゲーションバー */}
        <nav className="mb-6 flex gap-4 text-lg font-medium">
          <Link to="/" className="hover:text-blue-400">
            可視化
          </Link>
          <Link to="/login" className="hover:text-blue-400">
            ログイン
          </Link>
          <Link to="/signup" className="hover:text-blue-400">
            サインアップ
          </Link>
          <Link to="/MyNetworks" className="hover:text-blue-400">
            保存一覧
          </Link>
        </nav>

        {/* ページルーティング */}
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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const signupRes = await fetch("http://localhost:8000/api/signup/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (signupRes.ok) {
      // サインアップ成功後、自動ログインする
      const loginRes = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        localStorage.setItem("access", loginData.access);
        localStorage.setItem("refresh", loginData.refresh);

        // カスタムJWTに username が含まれている場合はこちらで保存
        const payload = JSON.parse(atob(loginData.access.split(".")[1]));
        localStorage.setItem("username", payload.username);

        navigate("/");
      } else {
        setError("サインアップ後のログインに失敗しました");
      }
    } else {
      const data = await signupRes.json();
      setError(data.error || "サインアップに失敗しました");
    }
  };

  return (
    <div>
      <h2>サインアップ</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">登録</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Signup;

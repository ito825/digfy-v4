// src/utils/auth.ts
export const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = localStorage.getItem("refresh");

  if (!refresh) return null;

  const response = await fetch("http://localhost:8000/api/token/refresh/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("access", data.access);
    return data.access;
  } else {
    // refreshが無効な場合
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    return null;
  }
};

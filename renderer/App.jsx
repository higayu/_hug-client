import React, { useState } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const result = await window.hugAPI.login(username, password);
    if (result.success) {
      alert("ログイン成功！");
    } else {
      alert("ログイン失敗: " + result.error);
    }
  };

  return (
    <div>
      <h1>Hug ログイン</h1>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ID" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleLogin}>ログイン</button>
    </div>
  );
}

export default App;

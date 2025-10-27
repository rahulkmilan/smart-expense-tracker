import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = "http://localhost:8000/api";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    const data = new URLSearchParams();
    data.append("username", email);
    data.append("password", password);

    const res = await fetch(`${API}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: data.toString(),
    });

    if (!res.ok) {
      const err = await res.json();
      return alert(err.detail || "Login failed");
    }

    const body = await res.json();
    localStorage.setItem("token", body.access_token);
    onLogin();
    navigate("/dashboard", { replace: true });
  };

  const inputStyle = {
    width: "100%",
    height: "44px",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    ...inputStyle,
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        margin: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 20,
          borderRadius: 8,
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: 20 }}>Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={login} style={buttonStyle}>
          Login
        </button>

        <p style={{ marginTop: 15 }}>
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = "http://localhost:8000/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    if (!name || !email || !password) return alert("Please fill all fields");

    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      return alert(err.detail || "Register failed");
    }

    alert("Registration successful! Please log in.");
    navigate("/login");
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
          maxWidth: 400,
          width: "100%",
          padding: 20,
          borderRadius: 8,
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <h2>Register</h2>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 12,
            padding: "10px",
            borderRadius: 4,
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 12,
            padding: "10px",
            borderRadius: 4,
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 16,
            padding: "10px",
            borderRadius: 4,
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={register}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 4,
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Register
        </button>
        <p style={{ marginTop: 12 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

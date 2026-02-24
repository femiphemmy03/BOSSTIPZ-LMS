import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import { loginUser } from "../services/api"; // ✅ add login API function

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });
      if (res.error) {
        setMessage(res.error);
        return;
      }

      // Save user + token in sessionStorage
      sessionStorage.setItem("user", JSON.stringify(res.user));
      sessionStorage.setItem("token", res.token);

      // Navigate based on role
      if (res.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setMessage("Login failed. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          backgroundColor: "#FFE0CC",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "420px",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "1.25rem", color: "#FF7A00" }}>Login</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "0.9rem",
              marginBottom: "1rem",
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "0.9rem",
              marginBottom: "1rem",
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
            required
          />

          <button
            type="submit"
            style={{
              backgroundColor: "#FF7A00",
              color: "#fff",
              padding: "0.9rem",
              border: "none",
              borderRadius: 8,
              width: "100%",
              fontWeight: "bold",
            }}
          >
            Login
          </button>

          {message && (
            <p style={{ marginTop: "1rem", color: "red" }}>{message}</p>
          )}

          <p style={{ marginTop: "1rem" }}>
            Don’t have an account?{" "}
            <a href="/signup" style={{ color: "#FF7A00" }}>
              Sign up
            </a>
          </p>

          {/* TRCN access button */}
          <button
            type="button"
            onClick={() => navigate("/trcn-login")}
            style={{
              backgroundColor: "#FF5500",
              color: "#fff",
              padding: "0.9rem",
              border: "none",
              borderRadius: 8,
              width: "100%",
              fontWeight: "bold",
              marginTop: "1rem",
            }}
          >
            TRCN Practice (Reg No or Matric No)
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

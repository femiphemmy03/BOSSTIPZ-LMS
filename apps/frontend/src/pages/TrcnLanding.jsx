import React, { useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

export default function TrcnLanding() {
  const trcnSession = JSON.parse(sessionStorage.getItem("trcnSession")) || null;
  const [count, setCount] = useState(50);
  const [timer, setTimer] = useState(60); // minutes

  if (!trcnSession) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Session expired. Please re-authenticate via TRCN login.</p>
      </div>
    );
  }

  const handleStart = (e) => {
    e.preventDefault();
    sessionStorage.setItem("trcnConfig", JSON.stringify({ count, timer }));
    window.location.href = "/trcn";
  };

  const handleStandardMode = () => {
    // Standard mode: 50 questions, 30 minutes
    sessionStorage.setItem("trcnConfig", JSON.stringify({ count: 50, timer: 30 }));
    window.location.href = "/trcn";
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ✅ Header reads trcnSession directly from sessionStorage */}
      <Header />
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
        }}
      >
        <form
          onSubmit={handleStart}
          style={{
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "480px",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "1rem", color: "#FF7A00" }}>
            TRCN Practice Setup
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            Welcome {trcnSession.name}. Choose your number of questions and timer, or use Standard Mode.
          </p>

          {/* Standard Mode Button */}
          <button
            type="button"
            onClick={handleStandardMode}
            style={{
              backgroundColor: "#FF5500",
              color: "#fff",
              padding: "0.9rem",
              border: "none",
              borderRadius: 8,
              width: "100%",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Standard Mode (50 Questions / 30 mins)
          </button>

          {/* Custom Mode */}
          <label style={{ display: "block", textAlign: "left", marginBottom: "0.75rem" }}>
            Number of Questions (10–100)
            <input
              type="number"
              min="10"
              max="100"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 50)}
              style={{
                width: "100%",
                padding: "0.9rem",
                borderRadius: 8,
                border: "1px solid #ccc",
                marginTop: "0.3rem",
              }}
              required
            />
          </label>

          <label style={{ display: "block", textAlign: "left", marginBottom: "0.75rem" }}>
            Timer (minutes)
            <input
              type="number"
              min="10"
              max="180"
              value={timer}
              onChange={(e) => setTimer(parseInt(e.target.value) || 60)}
              style={{
                width: "100%",
                padding: "0.9rem",
                borderRadius: 8,
                border: "1px solid #ccc",
                marginTop: "0.3rem",
              }}
              required
            />
          </label>

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
              marginTop: "0.5rem",
            }}
          >
            Start Custom Practice
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

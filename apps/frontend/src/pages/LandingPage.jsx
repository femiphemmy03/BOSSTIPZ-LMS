import React from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { COLORS } from "../constants.js";

function LandingPage() {
  return (
    <div
      style={{
        backgroundColor: COLORS.background,
        color: COLORS.text,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header user={null} />

      <main style={{ flex: 1, padding: "2rem", textAlign: "center" }}>
        <h1 style={{ color: COLORS.primary }}>Welcome to BOSSTIPZ LMS</h1>
        <p>Access TRCN practice questions below — no login required.</p>

        <button
          style={{
            backgroundColor: COLORS.primary,
            color: "#FFFFFF",
            padding: "12px 24px",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
            marginTop: "20px",
          }}
          onClick={() => (window.location.href = "/trcn")}
        >
          Go to TRCN Practice
        </button>
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;

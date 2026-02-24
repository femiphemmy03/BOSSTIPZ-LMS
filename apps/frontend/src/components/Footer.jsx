// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        backgroundColor: "#FFE0CC",
        color: "#000",
        padding: "1rem",
        textAlign: "center",
        fontSize: "14px",
        fontWeight: "500",
        marginTop: "auto",
      }}
    >
      Support:{" "}
      <a href="mailto:Sunmolatechnologiesng@gmail.com" style={{ color: "#000", textDecoration: "underline" }}>
        Sunmolatechnologiesng@gmail.com
      </a>{" "}
      &nbsp;||&nbsp; © {year} &nbsp;||&nbsp; Powered by Oluwafemi Sunmola Technologies LTD
    </footer>
  );
}


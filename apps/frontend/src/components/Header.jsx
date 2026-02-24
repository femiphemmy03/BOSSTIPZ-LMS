import React from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  // Fetch LMS user or TRCN session globally
  const lmsUser = JSON.parse(sessionStorage.getItem("user")) || null;
  const trcnSession = JSON.parse(sessionStorage.getItem("trcnSession")) || null;

  // Determine active user and name
  let activeUser = lmsUser || trcnSession;
  let displayName = "";

  if (lmsUser) {
    displayName = lmsUser.full_name || lmsUser.email || "User";
  } else if (trcnSession && trcnSession.user) {
    displayName = trcnSession.user.full_name || trcnSession.user.email || "TRCN User";
  }

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("trcnSession");
    sessionStorage.removeItem("trcnConfig");
    navigate("/login");
  };

  return (
    <header
      style={{
        backgroundColor: "#FF7A00",
        color: "#fff",
        padding: "1rem",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(1rem, 4vw, 1.5rem)",
          margin: 0,
          flex: "1 1 auto",
          wordBreak: "break-word",
        }}
      >
        Bosstipz LMS
      </h1>

      {activeUser && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flex: "1 1 auto",
            justifyContent: "flex-end",
          }}
        >
          <p
            style={{
              fontSize: "clamp(0.9rem, 3vw, 1.2rem)",
              margin: 0,
              wordBreak: "break-word",
            }}
          >
            Welcome {displayName}{" "}
            {lmsUser ? `(${lmsUser.role})` : "(TRCN Practice)"}
          </p>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#fff",
              color: "#FF7A00",
              border: "1px solid #fff",
              borderRadius: "6px",
              padding: "0.4rem 0.8rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
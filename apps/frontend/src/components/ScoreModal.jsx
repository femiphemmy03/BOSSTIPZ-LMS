// components/ScoreModal.jsx
import React from "react";
import Modal from "./Modal";
import Button from "./Button"; // Using your Button component
import { useNavigate } from "react-router-dom";

export default function ScoreModal({ isOpen, score, total, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  let message = "Keep practicing!";
  let color = "#dc3545"; // red

  if (percentage >= 70) {
    message = "Excellent! You're ready for more.";
    color = "#28a745"; // green
  } else if (percentage >= 50) {
    message = "Good effort — a little more practice will help.";
    color = "#f39c12"; // orange
  }

  return (
    <Modal title="TRCN Practice Result" onClose={onClose}>
      <div style={{ textAlign: "center", padding: "1rem 0" }}>
        <h3 style={{ 
          color: "#FF7A00", 
          marginBottom: "1rem",
          fontSize: "clamp(1.4rem, 5vw, 1.8rem)"
        }}>
          {score} / {total} ({percentage}%)
        </h3>

        <p style={{ 
          fontSize: "clamp(1rem, 4vw, 1.2rem)", 
          marginBottom: "1.5rem", 
          color,
          fontWeight: "bold"
        }}>
          {message}
        </p>

        <Button onClick={() => {
          onClose();
          navigate("/dashboard");
        }}>
          Back to Dashboard
        </Button>
      </div>
    </Modal>
  );
}
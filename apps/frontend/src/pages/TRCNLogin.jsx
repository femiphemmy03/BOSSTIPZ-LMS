import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import { trcnLogin } from "../services/api";
import PaymentPromptModal from "../components/PaymentPromptModal";

export default function TRCNLogin() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const navigate = useNavigate();

  const handleAccess = async (e) => {
    e.preventDefault();
    setMessage("");
    setShowPaymentModal(false);
    setPaymentError("");

    try {
      const res = await trcnLogin({ identifier });
      console.log("TRCN access response:", res); // Keep for debugging

      // Handle different error shapes from backend
      if (res.error) {
        // Case 1: Direct error (e.g. no user found, invalid input)
        if (res.error.includes("payment") || res.error.includes("Access denied")) {
          // Treat payment-related errors as modal trigger
          setPaymentError(res.error);
          setShowPaymentModal(true);
        } else {
          // Other errors → show red message
          setMessage(res.error);
        }
        return;
      }

      // Case 2: Success with paid check
      if (res.paid === false) {
        setPaymentError(res.error || "Please complete payment to continue.");
        setShowPaymentModal(true);
        return;
      }

      // Full success
      if (res.paid === true) {
        sessionStorage.setItem("trcnSession", JSON.stringify(res));
        navigate("/trcn-landing");
      } else {
        setMessage("Unexpected response from server.");
      }
    } catch (err) {
      console.error("TRCN login error:", err);
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
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
          onSubmit={handleAccess}
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
          <h2 style={{ marginBottom: "1rem", color: "#FF7A00" }}>
            TRCN Practice Access
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            Enter your <strong>TRCN Reg No</strong> (external) or <strong>Matric No</strong> (LMS).
          </p>

          <input
            type="text"
            placeholder="TRCN Reg No or Matric No"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
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
            Continue
          </button>

          {message && <p style={{ marginTop: "1rem", color: "red" }}>{message}</p>}
        </form>
      </main>

      <PaymentPromptModal
        isOpen={showPaymentModal}
        message={paymentError}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentError("");
        }}
        identifier={identifier}
      />

      <Footer />
    </div>
  );
}
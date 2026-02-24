// components/PaymentPromptModal.jsx
import React from "react";
import Modal from "./Modal"; // Adjust path if needed
import { useNavigate } from "react-router-dom";

export default function PaymentPromptModal({ isOpen, message, onClose, identifier }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleProceedToPayment = () => {
    const flutterwaveConfig = {
      public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
      tx_ref: `trcn:${identifier}:${Date.now()}`,
      amount: 2000,
      currency: "NGN",
      payment_options: "card, banktransfer, ussd",
      redirect_url: `${window.location.origin}/trcn-login?payment_success=true`,
      customer: {
        email: "user@example.com", // ← you can make this dynamic later
        name: "TRCN User",
      },
      customizations: {
        title: "TRCN Practice Access Payment",
        description: "Unlock TRCN practice questions",
        // logo: "..." // optional
      },
    };

    if (window.FlutterwaveCheckout) {
      window.FlutterwaveCheckout(flutterwaveConfig);
    } else {
      alert("Flutterwave not loaded. Please refresh and try again.");
    }

    onClose();
  };

  const handleCancel = () => {
    onClose();
    navigate("/login");
  };

  return (
    <Modal 
      title="Payment Required" 
      onClose={onClose}
      // Pass custom styles if you want to override Modal's defaults (optional)
      modalStyleOverride={{
        width: "90%",                    // ← responsive width
        maxWidth: "420px",               // ← cap at desktop size
        padding: "1.5rem",               // slightly smaller padding on mobile
      }}
    >
      <p 
        style={{ 
          marginBottom: "1.5rem", 
          textAlign: "center", 
          color: "#333",
          fontSize: "clamp(0.95rem, 3.5vw, 1.1rem)", // ← responsive font
          lineHeight: "1.5"
        }}
      >
        {message || "Access denied. Please complete payment to unlock TRCN practice."}
      </p>

      <div 
        style={{ 
          display: "flex", 
          flexDirection: "column",      // ← stack buttons vertically on very small screens
          gap: "1rem", 
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <button
          onClick={handleCancel}
          style={{
            backgroundColor: "#ccc",
            color: "#333",
            padding: "0.8rem 1.5rem",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            cursor: "pointer",
            width: "100%",               // full width on mobile
            maxWidth: "220px",           // cap on larger screens
          }}
        >
          Cancel
        </button>

        <button
          onClick={handleProceedToPayment}
          style={{
            backgroundColor: "#FF7A00",
            color: "#fff",
            padding: "0.8rem 1.5rem",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            cursor: "pointer",
            width: "100%",
            maxWidth: "220px",
          }}
        >
          Proceed to Payment
        </button>
      </div>

      <p 
        style={{ 
          marginTop: "1.5rem", 
          fontSize: "clamp(0.85rem, 3vw, 0.95rem)", 
          textAlign: "center", 
          color: "#666" 
        }}
      >
        Amount: ₦2,000 (TRCN Practice Access)
      </p>
    </Modal>
  );
}
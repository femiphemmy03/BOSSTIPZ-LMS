import React from "react";

function Modal({ title, children, onClose }) {
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 999,
  };

  const modalStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    zIndex: 1000,
    width: "60%",                    // ← Add this
  maxWidth: "420px", 
  };

  const closeStyle = {
    position: "absolute",
    top: "10px",
    right: "15px",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: "bold",
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        <span style={closeStyle} onClick={onClose}>×</span>
        <h3>{title}</h3>
        {children}
      </div>
    </>
  );
}

export default Modal;

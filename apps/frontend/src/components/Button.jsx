import React from "react";
import { COLORS } from "../constants.js";

function Button({ children, onClick, type = "button", style = {} }) {
  const baseStyle = {
    backgroundColor: COLORS.primary,
    color: "#fff",
    padding: "1rem",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0.5rem",
    width: "100%",
    ...style,
  };

  return (
    <button type={type} style={baseStyle} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;

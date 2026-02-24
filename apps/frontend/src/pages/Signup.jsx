import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import { signupUser } from "../services/api";

export default function Signup() {
  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState(""); // ← NEW
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [year, setYear] = useState("");
  const [matric, setMatric] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const isStudent = role === "student";
  const isLecturer = role === "lecturer";

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("Passwords do not match");
      return;
    }
    if (!fullName.trim()) {
      setMessage("Full name is required");
      return;
    }

    const payload = {
      full_name: fullName.trim(),          // ← Added
      role,
      email,
      password,
      school_name: school,
      matric_number: isStudent ? matric : null,
      level: isStudent ? year : null,
    };

    try {
      const res = await signupUser(payload);
      if (res.error) {
        setMessage(res.error);
        return;
      }
      setMessage(res.message || "Account created successfully!");
      navigate("/login");
    } catch (err) {
      setMessage("Signup failed. Please try again.");
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
          onSubmit={handleSignup}
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
          <h2 style={{ marginBottom: "1rem", color: "#FF7A00" }}>Sign Up</h2>

          {/* Role + Email + Full Name */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ textAlign: "left", display: "block" }}>
              Role <span style={{ color: "red" }}>*</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  marginTop: "0.3rem",
                }}
                required
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
              </select>
            </label>

            <label style={{ textAlign: "left", display: "block", marginTop: "0.75rem" }}>
              Full Name <span style={{ color: "red" }}>*</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  marginTop: "0.3rem",
                }}
                required
              />
            </label>

            <label style={{ textAlign: "left", display: "block", marginTop: "0.75rem" }}>
              Email <span style={{ color: "red" }}>*</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  marginTop: "0.3rem",
                }}
                required
              />
            </label>
          </div>

          {/* School */}
          <label style={{ textAlign: "left", display: "block", marginBottom: "0.75rem" }}>
            School <span style={{ color: "red" }}>*</span>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              style={{
                width: "100%",
                padding: "0.8rem",
                borderRadius: 8,
                border: "1px solid #ccc",
                marginTop: "0.3rem",
              }}
              required
            />
          </label>

          {/* Student-specific: Year + Matric */}
          {isStudent && (
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ textAlign: "left", display: "block" }}>
                Year <span style={{ color: "red" }}>*</span>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    marginTop: "0.3rem",
                  }}
                  required
                />
              </label>

              <label style={{ textAlign: "left", display: "block", marginTop: "0.75rem" }}>
                Matric Number <span style={{ color: "red" }}>*</span>
                <input
                  type="text"
                  value={matric}
                  onChange={(e) => setMatric(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    borderRadius: 8,
                    border: "1px solid #ccc",
                    marginTop: "0.3rem",
                  }}
                  required
                />
              </label>
            </div>
          )}

          {/* Passwords */}
          <div>
            <label style={{ textAlign: "left", display: "block", marginBottom: "0.75rem" }}>
              Password <span style={{ color: "red" }}>*</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  marginTop: "0.3rem",
                }}
                required
              />
            </label>

            <label style={{ textAlign: "left", display: "block", marginBottom: "0.75rem" }}>
              Confirm Password <span style={{ color: "red" }}>*</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  marginTop: "0.3rem",
                }}
                required
              />
            </label>
          </div>

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
              marginTop: "1rem",
            }}
          >
            Create account
          </button>

          {message && <p style={{ marginTop: "1rem", color: "red" }}>{message}</p>}

          <p style={{ marginTop: "1rem" }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: "#FF7A00" }}>
              Login
            </a>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
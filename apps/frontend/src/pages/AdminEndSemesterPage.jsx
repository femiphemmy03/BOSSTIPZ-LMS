import React, { useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";

function AdminEndSemesterPage() {
  const user = JSON.parse(sessionStorage.getItem("user")) || null;
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  // State for confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) return <p>Please log in to view this page.</p>;

  const handleEndSemester = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || "http://localhost:4000"}/end-semester`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error || "Failed to end semester");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const renderEndSemester = () => {
    switch (user.role) {
      // ========================= ADMIN =========================
      case "admin":
        return (
          <div>
            <h2>🚨 End Semester</h2>
            <p>
              This action will clear all student submissions, reset assignments,
              and prepare the system for a new semester.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Button
                style={{
                  backgroundColor: "#FF5500",
                  color: "#fff",
                  padding: "1rem",
                  borderRadius: "8px",
                }}
                onClick={() => setShowConfirm(true)}
              >
                End Semester (Clear All Submissions)
              </Button>
              <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
              <Modal title="Confirm End Semester" onClose={() => setShowConfirm(false)}>
                <p>
                  Are you sure you want to end the semester? This will permanently clear
                  all student submissions and reset assignments.
                </p>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <Button
                    style={{ backgroundColor: "#FF5500", color: "#fff" }}
                    onClick={handleEndSemester}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Yes, End Semester"}
                  </Button>
                  <Button onClick={() => setShowConfirm(false)}>Cancel</Button>
                </div>
              </Modal>
            )}

            {message && <p style={{ marginTop: "1rem", color: "#FF5500" }}>{message}</p>}
          </div>
        );

      // ========================= LECTURER =========================
      case "lecturer":
        return (
          <div>
            <h2>🚨 Access Restricted</h2>
            <p>Lecturers cannot end the semester. Please return to your dashboard.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        );

      // ========================= STUDENT =========================
      case "student":
        return (
          <div>
            <h2>🚨 Access Restricted</h2>
            <p>Students cannot end the semester. Please return to your dashboard.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        );

      default:
        return <p>Unknown role.</p>;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1, padding: "2rem" }}>{renderEndSemester()}</main>
      <Footer />
    </div>
  );
}

export default AdminEndSemesterPage;

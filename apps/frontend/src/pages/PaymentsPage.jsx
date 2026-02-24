import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { getPayments } from "../services/api";

function PaymentsPage() {
  const user = JSON.parse(sessionStorage.getItem("user")) || null;
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPayments() {
      if (!user) return;

      try {
        if (user.role === "student") {
          const data = await getPayments(token, user.id); // fetch student’s payments
          setPayments(data.payments || []);
        }
        if (user.role === "admin") {
          const data = await getPayments(token); // fetch all payments
          setPayments(data.payments || []);
        }
      } catch (err) {
        setMessage("Failed to load payments.");
      }
    }
    loadPayments();
  }, [user, token]);

  if (!user) return <p>Please log in to view payments.</p>;

  const renderPayments = () => {
    switch (user.role) {
      // ========================= STUDENT =========================
      case "student":
        return (
          <div>
            <h2>💳 My Payment History</h2>
            <p>View your past transactions and receipts.</p>
            <ul>
              {payments.map((p) => (
                <li key={p.id}>
                  {p.course_id ? "Course" : p.topic_id ? "Topic" : "TRCN"} — ₦{p.amount} — {p.status}
                  <Button onClick={() => alert(`Receipt for transaction ${p.id}`)}>
                    Download Receipt
                  </Button>
                </li>
              ))}
            </ul>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        );

      // ========================= LECTURER =========================
      case "lecturer":
        return (
          <div>
            <h2>💳 Lecturer Payments</h2>
            <p>Currently no payment functions for lecturers.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        );

      // ========================= ADMIN =========================
      case "admin":
        return (
          <div>
            <h2>💳 Monitor Payments</h2>
            <p>Track all student and lecturer transactions.</p>
            <ul>
              {payments.map((p) => (
                <li key={p.id}>
                  Student {p.student_id} — ₦{p.amount} — {p.status}
                </li>
              ))}
            </ul>
            <Button onClick={() => alert("Generate Payment Report clicked")}>
              Generate Payment Report
            </Button>
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
      <main style={{ flex: 1, padding: "2rem" }}>
        {renderPayments()}
        {message && <p style={{ marginTop: "1rem", color: "red" }}>{message}</p>}
      </main>
      <Footer />
    </div>
  );
}

export default PaymentsPage;

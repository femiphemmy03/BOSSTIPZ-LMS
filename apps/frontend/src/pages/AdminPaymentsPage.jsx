import React, { useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import { getPayments, recordPayment } from "../services/api";

function AdminPaymentsPage() {
  const user = JSON.parse(sessionStorage.getItem("user")) || null;
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  // State for modals
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [showPaymentReport, setShowPaymentReport] = useState(false);
  const [showRefund, setShowRefund] = useState(false);

  // Data state
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState("");

  if (!user) return <p>Please log in to view this page.</p>;

  const buttonGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  };

  const renderPaymentsManagement = () => {
    switch (user.role) {
      case "admin":
        return (
          <div>
            <h2>💳 Monitor Payments</h2>
            <p>Track and manage all transactions across the system.</p>

            <div style={buttonGridStyle}>
              <Button onClick={() => setShowAllPayments(true)}>View All Payments</Button>
              <Button onClick={() => setShowPaymentReport(true)}>Generate Payment Report</Button>
              <Button onClick={() => setShowRefund(true)}>Refund Payment</Button>
              <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
            </div>

            {/* View All Payments Modal */}
            {showAllPayments && (
              <Modal title="All Payments" onClose={() => setShowAllPayments(false)}>
                <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  <p>Here you can view all transactions.</p>
                  <Button
                    onClick={async () => {
                      const data = await getPayments(token);
                      setPayments(data.payments || []);
                    }}
                  >
                    Load Payments
                  </Button>
                  <ul>
                    {payments.map((p) => (
                      <li key={p.id}>
                        {p.student_id} — ₦{p.amount} — {p.course_id ? "Course" : p.topic_id ? "Topic" : "TRCN"} — {p.status}
                      </li>
                    ))}
                  </ul>
                </div>
              </Modal>
            )}

            {/* Generate Payment Report Modal */}
            {showPaymentReport && (
              <Modal title="Generate Payment Report" onClose={() => setShowPaymentReport(false)}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setMessage("Payment report generated!");
                    setShowPaymentReport(false);
                  }}
                >
                  <select required style={{ width: "100%", marginBottom: "1rem" }}>
                    <option value="">Select Report Type</option>
                    <option value="daily">Daily Report</option>
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                  </select>
                  <input type="date" required style={{ width: "100%", marginBottom: "1rem" }} />
                  <input type="date" required style={{ width: "100%", marginBottom: "1rem" }} />
                  <Button type="submit">Generate</Button>
                </form>
              </Modal>
            )}

            {/* Refund Payment Modal */}
            {showRefund && (
              <Modal title="Refund Payment" onClose={() => setShowRefund(false)}>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    // For now, just simulate refund until backend route exists
                    setMessage("Refund processed (placeholder). Add backend route for real refunds.");
                    setShowRefund(false);
                  }}
                >
                  <input
                    type="text"
                    placeholder="Transaction ID"
                    required
                    style={{ width: "100%", marginBottom: "1rem" }}
                  />
                  <input
                    type="text"
                    placeholder="Student ID"
                    required
                    style={{ width: "100%", marginBottom: "1rem" }}
                  />
                  <input
                    type="number"
                    placeholder="Amount to Refund"
                    required
                    style={{ width: "100%", marginBottom: "1rem" }}
                  />
                  <Button type="submit">Process Refund</Button>
                </form>
              </Modal>
            )}

            {message && <p style={{ marginTop: "1rem", color: "#FF5500" }}>{message}</p>}
          </div>
        );

      default:
        return (
          <div>
            <h2>💳 Access Restricted</h2>
            <p>You do not have permission to view this page.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        );
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1, padding: "2rem" }}>{renderPaymentsManagement()}</main>
      <Footer />
    </div>
  );
}

export default AdminPaymentsPage;

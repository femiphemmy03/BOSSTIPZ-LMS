import React, { useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import { getCourses, getPayments, getAssignments } from "../services/api";

function AdminReportsPage() {
  const user = JSON.parse(sessionStorage.getItem("user")) || null;
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  // State for modals
  const [showViewReports, setShowViewReports] = useState(false);
  const [showGenerateReport, setShowGenerateReport] = useState(false);
  const [showExportReport, setShowExportReport] = useState(false);

  // Data states
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [message, setMessage] = useState("");

  if (!user) return <p>Please log in to view this page.</p>;

  const buttonGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  };

  const renderReportsManagement = () => {
    switch (user.role) {
      case "admin":
        return (
          <div>
            <h2>📊 Reports Management</h2>
            <p>View and generate system‑wide reports.</p>

            <div style={buttonGridStyle}>
              <Button onClick={() => setShowViewReports(true)}>View Reports</Button>
              <Button onClick={() => setShowGenerateReport(true)}>Generate New Report</Button>
              <Button onClick={() => setShowExportReport(true)}>Export Report</Button>
              <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
            </div>

            {/* View Reports Modal */}
            {showViewReports && (
              <Modal title="View Reports" onClose={() => setShowViewReports(false)}>
                <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  <p>Here you can view existing reports.</p>
                  <div style={buttonGridStyle}>
                    <Button
                      onClick={async () => {
                        const data = await getCourses(token);
                        setCourses(data.courses || []);
                      }}
                    >
                      Load Courses Report
                    </Button>
                    <Button
                      onClick={async () => {
                        const data = await getPayments(token);
                        setPayments(data.payments || []);
                      }}
                    >
                      Load Payments Report
                    </Button>
                  </div>
                  <h4>Courses</h4>
                  <ul>
                    {courses.map((c) => (
                      <li key={c.id}>{c.title} — {c.description}</li>
                    ))}
                  </ul>
                  <h4>Payments</h4>
                  <ul>
                    {payments.map((p) => (
                      <li key={p.id}>
                        {p.student_id} — ₦{p.amount} — {p.status}
                      </li>
                    ))}
                  </ul>
                </div>
              </Modal>
            )}

            {/* Generate Report Modal */}
            {showGenerateReport && (
              <Modal title="Generate New Report" onClose={() => setShowGenerateReport(false)}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setMessage("New report generated!");
                    setShowGenerateReport(false);
                  }}
                >
                  <select required style={{ width: "100%", marginBottom: "1rem" }}>
                    <option value="">Select Report Type</option>
                    <option value="courses">Courses Report</option>
                    <option value="payments">Payments Report</option>
                    <option value="assignments">Assignments Report</option>
                  </select>
                  <input type="date" required style={{ width: "100%", marginBottom: "1rem" }} />
                  <input type="date" required style={{ width: "100%", marginBottom: "1rem" }} />
                  <Button type="submit">Generate</Button>
                </form>
              </Modal>
            )}

            {/* Export Report Modal */}
            {showExportReport && (
              <Modal title="Export Report" onClose={() => setShowExportReport(false)}>
                <p>Select format to export:</p>
                <div style={buttonGridStyle}>
                  <Button onClick={() => setMessage("Exported as PDF")}>Export as PDF</Button>
                  <Button onClick={() => setMessage("Exported as Excel")}>Export as Excel</Button>
                </div>
              </Modal>
            )}

            {message && <p style={{ marginTop: "1rem", color: "#FF5500" }}>{message}</p>}
          </div>
        );

      case "lecturer":
        return (
          <div>
            <h2>📊 Access Restricted</h2>
            <p>Lecturers cannot view system‑wide reports. Please return to your dashboard.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        );

      case "student":
        return (
          <div>
            <h2>📊 Access Restricted</h2>
            <p>Students cannot view system‑wide reports. Please return to your dashboard.</p>
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
      <main style={{ flex: 1, padding: "2rem" }}>{renderReportsManagement()}</main>
      <Footer />
    </div>
  );
}

export default AdminReportsPage;

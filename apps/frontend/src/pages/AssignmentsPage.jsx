import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import { getAssignments, createAssignment, submitAssignment } from "../services/api";

function AssignmentsPage() {
  const user = JSON.parse(sessionStorage.getItem("user")) || null;
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [message, setMessage] = useState("");

  if (!user) return <p>Please log in to view assignments.</p>;

  // Example: load assignments for a topic (replace with actual topicId from context)
  const topicId = 1;

  useEffect(() => {
    async function loadAssignments() {
      if (user.role === "student" || user.role === "lecturer" || user.role === "admin") {
        const data = await getAssignments(token, topicId);
        setAssignments(data.assignments || []);
      }
    }
    loadAssignments();
  }, [user.role, token]);

  const renderAssignments = () => {
    switch (user.role) {
      // ========================= STUDENT =========================
      case "student":
        return (
          <div>
            <h2>📝 My Assignments</h2>
            <p>You can view and submit your assignments here.</p>

            <ul>
              {assignments.map((a) => (
                <li key={a.id}>
                  {a.title} — due {a.due_date}
                </li>
              ))}
            </ul>

            <Button onClick={() => setShowForm(true)}>Submit Assignment</Button>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>

            {showForm && (
              <Modal title="Submit Assignment" onClose={() => setShowForm(false)}>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const payload = {
                      comments: formData.get("comments"),
                      file_url: "uploaded-file-placeholder", // integrate file upload later
                    };
                    const res = await submitAssignment(token, assignments[0]?.id, payload);
                    setMessage(res.message || res.error);
                    setShowForm(false);
                  }}
                >
                  <textarea name="comments" placeholder="Comments" style={{ width: "100%", marginBottom: "1rem" }} />
                  <input type="file" style={{ marginBottom: "1rem" }} />
                  <Button type="submit">Submit</Button>
                </form>
              </Modal>
            )}
          </div>
        );

      // ========================= LECTURER =========================
      case "lecturer":
        return (
          <div>
            <h2>📝 Manage Assignments</h2>
            <p>Create, edit, and review student submissions.</p>

            <ul>
              {assignments.map((a) => (
                <li key={a.id}>
                  {a.title} — due {a.due_date}
                </li>
              ))}
            </ul>

            <Button onClick={() => setShowForm(true)}>Create Assignment</Button>
            <Button onClick={() => alert("View Submissions clicked")}>View Submissions</Button>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>

            {showForm && (
              <Modal title="Create Assignment" onClose={() => setShowForm(false)}>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const payload = {
                      title: formData.get("title"),
                      description: formData.get("description"),
                      due_date: formData.get("due_date"),
                    };
                    const res = await createAssignment(token, topicId, payload);
                    setMessage(res.message || res.error);
                    setShowForm(false);
                  }}
                >
                  <input name="title" type="text" placeholder="Title" required style={{ width: "100%", marginBottom: "1rem" }} />
                  <textarea name="description" placeholder="Description" required style={{ width: "100%", marginBottom: "1rem" }} />
                  <input name="due_date" type="date" required style={{ width: "100%", marginBottom: "1rem" }} />
                  <Button type="submit">Create</Button>
                </form>
              </Modal>
            )}
          </div>
        );

      // ========================= ADMIN =========================
      case "admin":
        return (
          <div>
            <h2>📝 Assignment Overview</h2>
            <p>Monitor all assignments across the system.</p>
            <ul>
              {assignments.map((a) => (
                <li key={a.id}>
                  {a.title} — {a.description} — due {a.due_date}
                </li>
              ))}
            </ul>
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
        {renderAssignments()}
        {message && <p style={{ marginTop: "1rem", color: "#FF5500" }}>{message}</p>}
      </main>
      <Footer />
    </div>
  );
}

export default AssignmentsPage;

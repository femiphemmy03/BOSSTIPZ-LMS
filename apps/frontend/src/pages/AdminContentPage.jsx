import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import {
  getCourses,
  deleteCourse,
  getTopics,
  getVideos,
  getAssignments,
} from "../services/api";

function AdminContentPage() {
  const user = JSON.parse(sessionStorage.getItem("user")) || null;
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  // State for modals
  const [showCourses, setShowCourses] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const [showAssignments, setShowAssignments] = useState(false);

  // Data states
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [videos, setVideos] = useState([]);
  const [assignments, setAssignments] = useState([]);

  if (!user) return <p>Please log in to view this page.</p>;

  // Layout style for internal buttons
  const buttonGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  };

  const renderContentManagement = () => {
    switch (user.role) {
      // ========================= ADMIN =========================
      case "admin":
        return (
          <div>
            <h2>📘 Manage Content</h2>
            <p>Oversee courses, topics, videos, and assignments across the system.</p>

            <div style={buttonGridStyle}>
              <Button onClick={() => setShowCourses(true)}>Manage Courses</Button>
              <Button onClick={() => setShowTopics(true)}>Manage Topics</Button>
              <Button onClick={() => setShowVideos(true)}>Manage Videos</Button>
              <Button onClick={() => setShowAssignments(true)}>Manage Assignments</Button>
              <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
            </div>

            {/* Courses Modal */}
            {showCourses && (
              <Modal title="Manage Courses" onClose={() => setShowCourses(false)}>
                <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  <p>Here you can view, edit, or delete courses created by lecturers.</p>
                  <div style={buttonGridStyle}>
                    <Button
                      onClick={async () => {
                        const data = await getCourses(token);
                        setCourses(data.courses || []);
                      }}
                    >
                      View Courses
                    </Button>
                  </div>
                  <ul>
                    {courses.map((c) => (
                      <li key={c.id} style={{ marginBottom: "0.5rem" }}>
                        {c.title} — {c.description}
                        <Button
                          style={{ backgroundColor: "#FF5500", color: "#fff", marginLeft: "1rem" }}
                          onClick={async () => {
                            await deleteCourse(token, c.id);
                            setCourses(courses.filter((x) => x.id !== c.id));
                          }}
                        >
                          Delete
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </Modal>
            )}

            {/* Topics Modal */}
            {showTopics && (
              <Modal title="Manage Topics" onClose={() => setShowTopics(false)}>
                <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  <p>Here you can oversee topics across all courses.</p>
                  <div style={buttonGridStyle}>
                    <Button
                      onClick={async () => {
                        const data = await getTopics(token, courses[0]?.id || 1);
                        setTopics(data.topics || []);
                      }}
                    >
                      View Topics
                    </Button>
                  </div>
                  <ul>
                    {topics.map((t) => (
                      <li key={t.id}>{t.title}</li>
                    ))}
                  </ul>
                </div>
              </Modal>
            )}

            {/* Videos Modal */}
            {showVideos && (
              <Modal title="Manage Videos" onClose={() => setShowVideos(false)}>
                <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  <p>Here you can manage course/topic videos.</p>
                  <div style={buttonGridStyle}>
                    <Button
                      onClick={async () => {
                        const data = await getVideos(token, topics[0]?.id || 1);
                        setVideos(data.videos || []);
                      }}
                    >
                      View Videos
                    </Button>
                  </div>
                  <ul>
                    {videos.map((v) => (
                      <li key={v.id}>{v.title} — {v.duration_minutes} mins</li>
                    ))}
                  </ul>
                </div>
              </Modal>
            )}

            {/* Assignments Modal */}
            {showAssignments && (
              <Modal title="Manage Assignments" onClose={() => setShowAssignments(false)}>
                <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  <p>Here you can monitor and manage assignments across the system.</p>
                  <div style={buttonGridStyle}>
                    <Button
                      onClick={async () => {
                        const data = await getAssignments(token, topics[0]?.id || 1);
                        setAssignments(data.assignments || []);
                      }}
                    >
                      View Assignments
                    </Button>
                  </div>
                  <ul>
                    {assignments.map((a) => (
                      <li key={a.id}>{a.title} — due {a.due_date}</li>
                    ))}
                  </ul>
                </div>
              </Modal>
            )}
          </div>
        );

      // ========================= LECTURER =========================
      case "lecturer":
        return (
          <div>
            <h2>📘 Access Restricted</h2>
            <p>Lecturers cannot manage system‑wide content. Please return to your dashboard.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        );

      // ========================= STUDENT =========================
      case "student":
        return (
          <div>
            <h2>📘 Access Restricted</h2>
            <p>Students cannot manage system‑wide content. Please return to your dashboard.</p>
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
      <main style={{ flex: 1, padding: "2rem" }}>{renderContentManagement()}</main>
      <Footer />
    </div>
  );
}

export default AdminContentPage;

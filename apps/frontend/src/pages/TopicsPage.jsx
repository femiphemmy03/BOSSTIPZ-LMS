import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { getTopics, createTopic } from "../services/api";

function TopicsPage() {
  const user = JSON.parse(sessionStorage.getItem("user")) || null;
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function loadTopics() {
      if (!user) return;
      try {
        // Example: load topics for courseId=1 (replace with actual courseId context)
        const data = await getTopics(token, 1);
        setTopics(data.topics || []);
      } catch (err) {
        setMessage("Failed to load topics.");
      }
    }
    loadTopics();
  }, [user, token]);

  if (!user) return <p>Please log in to view topics.</p>;

  const renderTopics = () => {
    switch (user.role) {
      // ========================= STUDENT =========================
      case "student":
        return (
          <div>
            <h2>📖 My Topics</h2>
            <p>View unlocked topics and continue your learning journey.</p>
            <ul>
              {topics.map((t) => (
                <li key={t.id}>
                  <strong>{t.title}</strong> — {t.explanation}
                  <Button onClick={() => alert(`Expand ${t.title}`)}>Expand</Button>
                  <Button onClick={() => alert(`Start ${t.title}`)}>Start</Button>
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
            <h2>📖 Manage Topics</h2>
            <p>Create and edit topics for your courses.</p>
            <ul>
              {topics.map((t) => (
                <li key={t.id}>
                  <strong>{t.title}</strong> — {t.explanation}
                  <Button onClick={() => alert(`Edit ${t.title}`)}>Edit</Button>
                  <Button onClick={() => alert(`Delete ${t.title}`)}>Delete</Button>
                </li>
              ))}
            </ul>
            <Button onClick={() => setShowForm(true)}>Add Topic</Button>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>

            {showForm && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const payload = {
                    title: formData.get("title"),
                    explanation: formData.get("explanation"),
                    video_url: "video-placeholder", // integrate upload later
                  };
                  const res = await createTopic(token, 1, payload); // courseId=1 example
                  setMessage(res.message || res.error);
                  setShowForm(false);
                }}
              >
                <input name="title" type="text" placeholder="Topic Title" required />
                <textarea name="explanation" placeholder="Explanation" required />
                <Button type="submit">Create Topic</Button>
              </form>
            )}
          </div>
        );

      // ========================= ADMIN =========================
      case "admin":
        return (
          <div>
            <h2>📖 System Topics Management</h2>
            <p>Oversee all topics across courses.</p>
            <ul>
              {topics.map((t) => (
                <li key={t.id}>
                  <strong>{t.title}</strong> — {t.explanation} — Course {t.course_id}
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
        {renderTopics()}
        {message && <p style={{ marginTop: "1rem", color: "red" }}>{message}</p>}
      </main>
      <Footer />
    </div>
  );
}

export default TopicsPage;

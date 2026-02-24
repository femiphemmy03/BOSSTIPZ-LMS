import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import { getCourses, getTopics, createCourse } from "../services/api";

function CoursesPages() {
  const user = JSON.parse(sessionStorage.getItem("user")) || null;
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  // State hooks
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showTopics, setShowTopics] = useState(false);

  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCourses() {
      if (user && user.role === "student") {
        const data = await getCourses(token);
        setCourses(data.courses || []);
      }
    }
    loadCourses();
  }, [user, token]);

  const updateTopic = (index, newTopic) => {
    const updated = [...topics];
    updated[index] = newTopic;
    setTopics(updated);
  };

  if (!user) return <p>Please log in to view courses.</p>;

  const renderCourses = () => {
    switch (user.role) {
      // ========================= STUDENT =========================
      case "student":
        return (
          <div>
            <h2>📘 My Courses</h2>
            <p>View your enrolled courses and expand topics.</p>
            <ul>
              {courses.map((c) => (
                <li key={c.id}>
                  {c.title} — {c.description}
                  <Button
                    onClick={async () => {
                      const data = await getTopics(token, c.id);
                      setTopics(data.topics || []);
                      setShowTopics(true);
                    }}
                  >
                    Expand Topics
                  </Button>
                </li>
              ))}
            </ul>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>

            {showTopics && (
              <Modal title="Course Topics" onClose={() => setShowTopics(false)}>
                <ul>
                  {topics.map((topic, i) => {
                    const hasFullCourseAccess = user.paidFullCourse;
                    const hasTopicAccess = user.paidTopics?.includes(topic.id);

                    return (
                      <li key={topic.id} style={{ marginBottom: "1rem" }}>
                        <strong>{topic.title}</strong>
                        <p>{topic.explanation}</p>

                        {hasFullCourseAccess || hasTopicAccess ? (
                          <Button onClick={() => alert(`Play video for ${topic.title}`)}>
                            Watch Video
                          </Button>
                        ) : (
                          <p style={{ color: "red" }}>
                            🔒 Locked — pay ₦500 to unlock this topic or ₦5000 for full course
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Modal>
            )}
          </div>
        );

      // ========================= LECTURER =========================
      case "lecturer":
        return (
          <div>
            <h2>📘 Manage Courses & Topics</h2>
            <p>Create and edit courses, manage topics.</p>
            <Button onClick={() => setShowCourseForm(true)}>Add Course</Button>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>

            {showCourseForm && (
              <Modal title="Add Course" onClose={() => setShowCourseForm(false)}>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (topics.length < 10) {
                      setMessage("You must add at least 10 topics.");
                      return;
                    }
                    const formData = new FormData(e.target);
                    const payload = {
                      title: formData.get("title"),
                      description: formData.get("description"),
                      topics: topics.map((t) => ({
                        title: t.title,
                        explanation: t.explanation,
                        video_url: "video-placeholder", // integrate upload later
                      })),
                    };
                    const res = await createCourse(token, payload);
                    setMessage(res.message || res.error);
                    setShowCourseForm(false);
                  }}
                >
                  <input
                    name="title"
                    type="text"
                    placeholder="Course Title"
                    required
                    style={{ width: "100%", marginBottom: "1rem" }}
                  />
                  <textarea
                    name="description"
                    placeholder="Course Description"
                    required
                    style={{ width: "100%", marginBottom: "1rem" }}
                  />

                  <h4>Topics (min 10, max 20)</h4>
                  {topics.map((topic, i) => (
                    <div key={i} style={{ marginBottom: "1rem" }}>
                      <input
                        type="text"
                        placeholder={`Topic ${i + 1} Title`}
                        value={topic.title}
                        onChange={(e) =>
                          updateTopic(i, { ...topic, title: e.target.value })
                        }
                        required
                        style={{ width: "100%", marginBottom: "0.5rem" }}
                      />
                      <textarea
                        placeholder={`Topic ${i + 1} Explanation`}
                        value={topic.explanation}
                        onChange={(e) =>
                          updateTopic(i, { ...topic, explanation: e.target.value })
                        }
                        required
                        style={{ width: "100%", marginBottom: "0.5rem" }}
                      />
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          updateTopic(i, { ...topic, video: e.target.files[0] })
                        }
                      />
                    </div>
                  ))}

                  <Button
                    type="button"
                    onClick={() =>
                      topics.length < 20
                        ? setTopics([...topics, { title: "", explanation: "", video: null }])
                        : setMessage("Maximum 20 topics reached")
                    }
                  >
                    Add Topic
                  </Button>

                  <Button type="submit">Create Course</Button>
                </form>
              </Modal>
            )}
          </div>
        );

      // ========================= ADMIN =========================
      case "admin":
        return (
          <div>
            <h2>📘 Manage Content</h2>
            <p>Manage courses, videos, topics, and assignments.</p>
            <Button onClick={() => navigate("/admin/content")}>Manage Courses</Button>
            <Button onClick={() => navigate("/admin/content")}>Manage Videos</Button>
            <Button onClick={() => navigate("/admin/content")}>Manage Assignments</Button>
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
        {renderCourses()}
        {message && <p style={{ marginTop: "1rem", color: "#FF5500" }}>{message}</p>}
      </main>
      <Footer />
    </div>
  );
}

export default CoursesPages;

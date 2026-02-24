import React, { useEffect, useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { getTrcnQuestions, saveTrcnResult } from "../services/api";
import ScoreModal from "../components/ScoreModal";

export default function TRCNPage() {
  const trcnSession = JSON.parse(sessionStorage.getItem("trcnSession")) || null;
  const trcnConfig = JSON.parse(sessionStorage.getItem("trcnConfig")) || { count: 50, timer: 60 };
  const [remaining, setRemaining] = useState(trcnConfig.timer * 60);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreData, setScoreData] = useState({ score: 0, total: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const data = await getTrcnQuestions(trcnConfig.count);
        if (data.error) {
          setMessage(data.error);
        } else {
          setQuestions(data.questions || []);
        }
      } catch (err) {
        setMessage("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [trcnConfig.count]);

  // Check if all questions are answered
  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id] !== undefined);

  if (!trcnSession) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Session expired. Please re-authenticate via TRCN login.</p>
      </div>
    );
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const submitResults = async () => {
    if (!allAnswered) {
      setMessage("Please answer all questions before submitting.");
      return;
    }

    // Prepare answers in format backend expects
    const answerPayload = questions.map(q => ({
      question_id: q.id,
      selected_option: answers[q.id]
    }));

    try {
      const result = await saveTrcnResult({ answers: answerPayload });

      if (result.error) {
        setMessage(result.error);
        return;
      }

      // Use server-returned score
      setScoreData({ 
        score: result.score, 
        total: result.total 
      });
      setShowScoreModal(true);

      // Optional: save session cleanup
      sessionStorage.removeItem("trcnConfig");
    } catch (err) {
      setMessage("Failed to submit. Please try again.");
    }
  };

  useEffect(() => {
    if (remaining === 0) submitResults();
  }, [remaining]);

  const isStandardMode = trcnConfig.count === 50 && trcnConfig.timer === 30;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <div style={{ textAlign: "right", padding: "0.5rem 2rem", fontWeight: "bold", color: "#FF7A00" }}>
        {isStandardMode ? "Standard Mode | " : ""}
        Time left: {formatTime(remaining)}
      </div>

      <main style={{ flex: 1, padding: "2rem" }}>
        <h2 style={{ color: "#FF7A00", textAlign: "center" }}>TRCN Practice</h2>
        <p style={{ textAlign: "center" }}>
          Welcome {trcnSession.user?.full_name || trcnSession.user?.email || 'User'}. {isStandardMode ? "You are in Standard Mode (50 Questions / 30 mins)." : ""}
        </p>
        <p style={{ textAlign: "center" }}>
          Questions: {trcnConfig.count} | Timer: {trcnConfig.timer} minutes
        </p>

        <div style={{ marginTop: "2rem" }}>
          {loading ? (
            <p style={{ textAlign: "center" }}>Loading questions... Please wait</p>
          ) : questions.length === 0 ? (
            <p style={{ textAlign: "center", color: "red" }}>No questions available. Try a different count or contact support.</p>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} style={{ marginBottom: "1.5rem" }}>
                <p>
                  <strong>Q{idx + 1}:</strong> {q.question}
                </p>
                {q.options.map((opt, i) => (
                  <label key={i} style={{ display: "block", marginBottom: "0.5rem" }}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                    />{" "}
                    {opt}
                  </label>
                ))}
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <button
            onClick={submitResults}
            disabled={!allAnswered || loading}
            style={{
              backgroundColor: allAnswered ? "#FF7A00" : "#ccc",
              color: "#fff",
              padding: "0.9rem 1.2rem",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              cursor: allAnswered ? "pointer" : "not-allowed",
              opacity: allAnswered ? 1 : 0.6,
            }}
          >
            Submit {allAnswered ? "" : "(Answer all questions)"}
          </button>
        </div>

        {message && <p style={{ marginTop: "1rem", color: "red", textAlign: "center" }}>{message}</p>}
      </main>

      <ScoreModal
        isOpen={showScoreModal}
        score={scoreData.score}
        total={scoreData.total}
        onClose={() => setShowScoreModal(false)}
      />

      <Footer />
    </div>
  );
}
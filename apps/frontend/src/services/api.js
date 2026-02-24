// src/services/api.js
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";


// Helper: attach JWT token
function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ========= AUTH =========
export async function signupUser(payload) {
  const res = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function loginUser(payload) {
  const res = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ========= PROFILES =========
export async function getProfiles(token) {
  const res = await fetch(`${BACKEND_URL}/profiles-secure`, {
    headers: authHeaders(token),
  });
  return res.json();
}

// ========= COURSES =========
export async function getCourses(token) {
  const res = await fetch(`${BACKEND_URL}/courses`, {
    headers: authHeaders(token),
  });
  return res.json();
}

export async function createCourse(token, payload) {
  const res = await fetch(`${BACKEND_URL}/courses`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateCourse(token, courseId, payload) {
  const res = await fetch(`${BACKEND_URL}/courses/${courseId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteCourse(token, courseId) {
  const res = await fetch(`${BACKEND_URL}/courses/${courseId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return res.json();
}

export async function getTopics(token, courseId) {
  const res = await fetch(`${BACKEND_URL}/courses/${courseId}/topics`, {
    headers: authHeaders(token),
  });
  return res.json();
}

export async function createTopic(token, courseId, payload) {
  const res = await fetch(`${BACKEND_URL}/courses/${courseId}/topics`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ========= VIDEOS =========
export async function getVideos(token, topicId) {
  const res = await fetch(`${BACKEND_URL}/topics/${topicId}/videos`, {
    headers: authHeaders(token),
  });
  return res.json();
}

export async function addVideo(token, topicId, payload) {
  const res = await fetch(`${BACKEND_URL}/topics/${topicId}/videos`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ========= ASSIGNMENTS =========
export async function getAssignments(token, topicId) {
  const res = await fetch(`${BACKEND_URL}/topics/${topicId}/assignments`, {
    headers: authHeaders(token),
  });
  return res.json();
}

export async function createAssignment(token, topicId, payload) {
  const res = await fetch(`${BACKEND_URL}/topics/${topicId}/assignments`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function submitAssignment(token, assignmentId, payload) {
  const res = await fetch(`${BACKEND_URL}/assignments/${assignmentId}/submissions`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ========= PAYMENTS =========
export async function getPayments(token) {
  const res = await fetch(`${BACKEND_URL}/payments`, {
    headers: authHeaders(token),
  });
  return res.json();
}

export async function recordPayment(token, payload) {
  const res = await fetch(`${BACKEND_URL}/payments`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return res.json();
}
export async function trcnLogin(payload) {
  try {
    const res = await fetch(`${BACKEND_URL}/trcn/access`, { // ← New path
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Error ${res.status}: Network issue`);
    }

    return await res.json();
  } catch (err) {
    return { error: err.message || "Network error - check console" };
  }
}
export async function getTrcnQuestions(count) {
  try {
    const trcnSession = JSON.parse(sessionStorage.getItem("trcnSession")) || null;
    const token = trcnSession?.token || '';
    if (!token) throw new Error("No TRCN access token found");

    const res = await fetch(`${BACKEND_URL}/trcn/questions?count=${count}`, { // ← changed to /trcn/questions
      headers: authHeaders(token),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("getTrcnQuestions error:", err);
    return { error: err.message || "Failed to load questions" };
  }
}
export async function saveTrcnResult(payload) {
  try {
    const trcnSession = JSON.parse(sessionStorage.getItem("trcnSession")) || null;
    const token = trcnSession?.token || '';

    console.log("saveTrcnResult - Token:", token ? "present" : "MISSING");
    console.log("Sending payload:", JSON.stringify(payload, null, 2)); // DEBUG payload

    if (!token) throw new Error("No TRCN token – re-login required");

    const res = await fetch(`${BACKEND_URL}/trcn/results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    console.log("Submit status:", res.status); // e.g. 401, 403, 500
    const responseText = await res.text(); // get raw text first
    console.log("Submit raw response:", responseText);

    let errData = {};
    try {
      errData = JSON.parse(responseText);
    } catch (e) {
      errData = { raw: responseText };
    }

    if (!res.ok) {
      console.log("Submit failed – parsed:", errData);
      throw new Error(errData.error || `HTTP ${res.status}`);
    }

    return JSON.parse(responseText);
  } catch (err) {
    console.error("saveTrcnResult error:", err);
    return { error: err.message || "Failed to submit" };
  }
}
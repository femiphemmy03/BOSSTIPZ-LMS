require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PRICING, validateMatricNumber } = require('./utils/constants');

const app = express();
const port = process.env.PORT || 4000;

// CORS – clean and working (from test-server.js)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or ANON KEY in .env');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// ========= JWT AUTH (with logging) =========
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log(`[${req.method} ${req.path}] Auth header:`, authHeader);

  const token = authHeader && authHeader.split(' ')[1];
  console.log(`[${req.method} ${req.path}] Token:`, token ? token.substring(0, 10) + '...' : 'MISSING');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      console.log(`[${req.method} ${req.path}] Token invalid:`, err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    console.log(`[${req.method} ${req.path}] Token valid, user:`, payload);
    req.user = {
      id: payload.id || payload.user_id,
      role: payload.role
    };
    next();
  });
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

// ========= HELPERS =========
async function isLecturerOwnerOfCourse(courseId, lecturerProfileId) {
  const { data, error } = await supabase
    .from('courses')
    .select('id, lecturer_id')
    .eq('id', courseId)
    .single();
  if (error || !data) return false;
  return data.lecturer_id === lecturerProfileId;
}

async function isLecturerOwnerOfTopic(topicId, lecturerProfileId) {
  const { data, error } = await supabase
    .from('topics')
    .select('id, course_id')
    .eq('id', topicId)
    .single();
  if (error || !data) return false;
  return isLecturerOwnerOfCourse(data.course_id, lecturerProfileId);
}

async function isLecturerOwnerOfAssignment(assignmentId, lecturerProfileId) {
  const { data, error } = await supabase
    .from('assignments')
    .select('id, topic_id')
    .eq('id', assignmentId)
    .single();
  if (error || !data) return false;
  return isLecturerOwnerOfTopic(data.topic_id, lecturerProfileId);
}

async function hasStudentPaidForCourse(courseId, studentProfileId) {
  const { data, error } = await supabase
    .from('payments')
    .select('id, status')
    .eq('course_id', courseId)
    .eq('student_id', studentProfileId)
    .eq('status', 'paid')
    .maybeSingle();
  if (error) return false;
  return !!data;
}

async function hasStudentPaidForTopic(topicId, studentProfileId) {
  const { data, error } = await supabase
    .from('payments')
    .select('id, status')
    .eq('topic_id', topicId)
    .eq('student_id', studentProfileId)
    .eq('status', 'paid')
    .maybeSingle();
  if (error) return false;
  return !!data;
}

// ========= ROOT =========
app.get('/', (req, res) => {
  res.send(`BOSSTIPZ Backend running on port ${port} - Auth & RBAC ready 🚀`);
});

// ========= AUTH =========
app.post('/auth/signup', async (req, res) => {
  try {
    const { full_name, email, password, role, matric_number, school_name, level } = req.body;

    if (!['admin', 'lecturer', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (role === 'student' && !validateMatricNumber(matric_number)) {
      return res.status(400).json({ error: 'Invalid matric number format' });
    }

    const { data: existingEmail } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    if (role === 'student' && matric_number) {
      const { data: existingMatric } = await supabase
        .from('profiles')
        .select('id')
        .eq('matric_number', matric_number)
        .maybeSingle();
      if (existingMatric) {
        return res.status(400).json({ error: 'Matric number already registered' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = crypto.randomUUID();

    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        user_id: newUserId,
        full_name,
        email,
        password: hashedPassword,
        role,
        matric_number: role === 'student' ? matric_number : null,
        school_name,
        level
      }])
      .select();

    if (error) throw error;

    const token = jwt.sign(
      { id: data[0].id, role: data[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Signup successful', user: data[0], token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login successful', user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========= PROFILES (SECURE LISTING) =========
app.get('/profiles-secure', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return res.json({ message: 'Admin access: all profiles', profiles: data, accessedBy: req.user.role });
    }

    if (req.user.role === 'lecturer') {
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('lecturer_id', req.user.id);

      const courseIds = (courses || []).map(c => c.id);
      if (courseIds.length === 0) return res.json({ message: 'No courses owned', profiles: [], accessedBy: req.user.role });

      const { data: paidStudentsCourse } = await supabase
        .from('payments')
        .select('student_id')
        .in('course_id', courseIds)
        .eq('status', 'paid');

      const { data: courseTopics } = await supabase
        .from('topics')
        .select('id')
        .in('course_id', courseIds);

      const topicIds = (courseTopics || []).map(t => t.id);
      let paidStudentsTopic = [];
      if (topicIds.length) {
        const { data: pst } = await supabase
          .from('payments')
          .select('student_id')
          .in('topic_id', topicIds)
          .eq('status', 'paid');
        paidStudentsTopic = pst || [];
      }

      const studentIds = [...new Set([
        ...(paidStudentsCourse || []).map(p => p.student_id),
        ...paidStudentsTopic.map(p => p.student_id)
      ])];

      const { data: studentProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, matric_number')
        .in('id', studentIds)
        .eq('role', 'student');

      return res.json({ message: 'Lecturer access: subscribed students only', profiles: studentProfiles || [], accessedBy: req.user.role });
    }

    if (req.user.role === 'student') {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', req.user.id)
        .single();
      if (error) throw error;
      return res.json({ message: 'Student access: own profile only', profile: data, accessedBy: req.user.role });
    }

    return res.status(403).json({ error: 'Role not authorized' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profiles', details: error.message });
  }
});

// ========= COURSES =========
app.post('/courses', authenticateToken, authorizeRoles('admin', 'lecturer'), async (req, res) => {
  try {
    const { title, description, lecturer_id } = req.body;

    let assignedLecturerId = lecturer_id;
    if (req.user.role === 'lecturer') {
      assignedLecturerId = req.user.id;
    }

    const { data, error } = await supabase
      .from('courses')
      .insert([{ title, description, lecturer_id: assignedLecturerId, published: false }])
      .select();

    if (error) throw error;
    res.json({ message: 'Course created', course: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ... (add back your other routes: edit/delete/list courses, topics, videos, assignments, payments, lecturer accounts, students per course/topic, end-semester, etc.)

// ========= TRCN ACCESS =========
app.post('/trcn/access', async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier?.trim()) {
      return res.status(400).json({ error: 'Please enter a valid TRCN Reg No or Matric Number' });
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, email, matric_number, role')
      .eq('matric_number', identifier)
      .eq('role', 'student')
      .maybeSingle();

    if (profileError) throw profileError;
    if (!userProfile) {
      return res.status(404).json({ error: 'No user found with this Matric Number or TRCN Reg No' });
    }

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, status, created_at')
      .eq('student_id', userProfile.id)
      .eq('trcn', true)
      .eq('status', 'paid')
      .maybeSingle();

    if (paymentError) throw paymentError;
    if (!payment) {
      return res.status(403).json({ 
        paid: false,
        error: 'Access denied. Please complete payment for TRCN practice.'
      });
    }

    const trcnToken = jwt.sign(
      { user_id: userProfile.user_id, role: 'student', trcnAccess: true },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      paid: true,
      message: 'TRCN access granted',
      user: userProfile,
      token: trcnToken,
    });
  } catch (err) {
    console.error('TRCN access error:', err.message);
    res.status(500).json({ error: 'Server error - please try again' });
  }
});

// ========= TRCN QUESTIONS GET =========
app.get('/trcn/questions', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 20;
    if (count % 10 !== 0 || count < 20 || count > 100) {
      return res.status(400).json({ error: 'Count must be 20–100 in increments of 10' });
    }

    const { data, error } = await supabase
      .from('trcn_questions')
      .select('id, question, options')
      .limit(count);
    if (error) throw error;
    res.json({ message: `TRCN questions fetched (${count})`, questions: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========= TRCN SUBMISSION & GRADING =========
app.post('/trcn/results', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Answers must be a non-empty array' });
    }

    const questionIds = answers.map(a => a.question_id);
    const { data: questions, error: qErr } = await supabase
      .from('trcn_questions')
      .select('id, correct_option')
      .in('id', questionIds);

    if (qErr) throw qErr;
    if (questions.length !== answers.length) {
      return res.status(400).json({ error: 'One or more questions not found' });
    }

    const correctMap = new Map(questions.map(q => [q.id, q.correct_option]));
    let correctCount = 0;
    for (const ans of answers) {
      if (correctMap.get(ans.question_id) === ans.selected_option) correctCount++;
    }

    const score = correctCount;
    const total = answers.length;

    const { data: result, error: saveErr } = await supabase
      .from('trcn_tests_results')
      .upsert(
        { 
          student_id: req.user.id,
          score,
          total_questions: total,
          attempts_count: supabase.raw('COALESCE(attempts_count, 0) + 1'),
          last_attempt: new Date().toISOString()
        },
        { onConflict: 'student_id' }
      )
      .select('*, attempts_count');

    if (saveErr) throw saveErr;

    res.json({ 
      message: 'TRCN test graded and attempt recorded', 
      score,
      total,
      percentage: total > 0 ? Math.round((score / total) * 100) : 0,
      attempts_count: result[0]?.attempts_count || 1,
      result: result[0]
    });
  } catch (err) {
    console.error('TRCN submission error:', err.message);
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

// ========= PAYMENTS =========
app.post('/payments', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { student_id, course_id, topic_id, status } = req.body;
    if (!student_id) return res.status(400).json({ error: 'student_id is required' });

    let baseAmount;
    if (course_id) baseAmount = PRICING.COURSE;
    else if (topic_id) baseAmount = PRICING.TOPIC;
    else baseAmount = PRICING.TRCN;

    const serviceFee = Math.round(baseAmount * PRICING.DEVELOPER_FEE);
    const totalAmount = baseAmount + serviceFee;

    const { data, error } = await supabase
      .from('payments')
      .insert([{
        student_id,
        course_id: course_id || null,
        topic_id: topic_id || null,
        trcn: !course_id && !topic_id ? true : false,
        status: status || 'paid',
        amount: totalAmount,
        service_fee: serviceFee
      }])
      .select();
    if (error) throw error;

    res.json({ message: 'Payment recorded', payment: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========= FLUTTERWAVE WEBHOOK =========
app.post('/flutterwave/webhook', async (req, res) => {
  try {
    const secret = process.env.FLW_SECRET_KEY;
    const signature = req.headers['verif-hash'];
    if (!signature || signature !== secret) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = req.body;
    const { status, tx_ref } = payload.data;

    if (status === 'successful') {
      const parts = tx_ref.split(':');
      const type = parts[0];
      const targetId = parts[1];
      const studentId = parts[2];

      let baseAmount;
      if (type === 'course') baseAmount = PRICING.COURSE;
      else if (type === 'topic') baseAmount = PRICING.TOPIC;
      else if (type === 'trcn') baseAmount = PRICING.TRCN;

      const serviceFee = Math.round(baseAmount * PRICING.DEVELOPER_FEE);
      const totalAmount = baseAmount + serviceFee;

      let insertData = {
        student_id: studentId || null,
        status: 'paid',
        amount: totalAmount,
        service_fee: serviceFee,
        tx_ref,
      };

      if (type === 'course') insertData.course_id = targetId;
      else if (type === 'topic') insertData.topic_id = targetId;
      else if (type === 'trcn') insertData.trcn = true;

      const { data: existing, error: checkError } = await supabase
        .from('payments')
        .select('id')
        .eq('tx_ref', tx_ref)
        .limit(1);

      if (checkError) console.error("Webhook check error:", checkError.message);

      if (!existing || existing.length === 0) {
        const { error: insertError } = await supabase.from('payments').insert([insertData]);
        if (insertError) throw insertError;
        console.log("Webhook payment recorded:", insertData);
      }
    }

    res.json({ message: 'Webhook processed' });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========= SERVER START =========
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
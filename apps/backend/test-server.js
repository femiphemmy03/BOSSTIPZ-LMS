require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const port = 4000;

// CORS block – copy-paste exactly
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(port, () => {
  console.log(`Test server running on http://localhost:${port}`);
});
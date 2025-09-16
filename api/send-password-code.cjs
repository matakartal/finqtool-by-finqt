// Simple Node.js Express API for sending password reset code via email
// (For local/dev use only! Use environment variables for production secrets)

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configure your email credentials here (use environment variables in production)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your SMTP provider
  auth: {
    user: process.env.EMAIL_USER || 'your.email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_app_password',
  },
});

// In-memory store for demo (use Redis or DB for production)
const codeStore = {};

app.post('/api/send-password-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codeStore[email] = { code, timestamp: Date.now() };
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your.email@gmail.com',
      to: email,
      subject: 'Your Password Reset Code',
      text: `Your password reset code is: ${code}`,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.post('/api/verify-password-code', (req, res) => {
  const { email, code } = req.body;
  const entry = codeStore[email];
  if (!entry || entry.code !== code) return res.status(400).json({ error: 'Invalid code' });
  // Optionally: check expiry (e.g., 10 min)
  delete codeStore[email];
  res.json({ success: true });
});

const port = process.env.PORT || 5174;
app.listen(port, () => console.log(`Password code API running on port ${port}`));

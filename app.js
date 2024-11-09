// Import required libraries
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config({ path: './app.env' });

console.log('Secret Key:', process.env.ACCESS_TOKEN_SECRET);
app.use(express.json());

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Public Endpoint - Login
app.post('/login', (req, res) => {
  const username = req.body.username;
  const user = { name: username };

  // Generate JWT
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  res.json({ accessToken });
});

// Protected Endpoint - Example
app.get('/dashboard', authenticateToken, (req, res) => {
  // Correct string interpolation with backticks
  res.json({ message: `Welcome ${req.user.name}` });
});

// Protected Endpoint - Admin Only
app.get('/admin', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  res.json({ message: 'Admin content' });
});

app.listen(3000, () => console.log('Server running on port 3000'));

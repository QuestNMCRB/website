// filepath: /C:/Users/Daniel Babin/OneDrive/Documents/GitHub/website/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Use CORS middleware with specific options
app.use(cors({
    origin: 'https://questnmark.com', // Replace with your actual domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Mock data for active users
let activeUsers = 42; // Replace this with actual logic to track active users

// Endpoint to get the number of active users
app.get('/api/active-users', (req, res) => {
    res.json({ activeUsers });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
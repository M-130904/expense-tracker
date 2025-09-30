// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import config, routes, and middleware
const connectDB = require('./backend/config/db');
const authRoutes = require('./backend/routes/authRoutes'); // NEW
const expenseRoutes = require('./backend/routes/expenseRoutes');
const errorHandler = require('./backend/middleware/errorHandler');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Connect to Database
connectDB();

// ------------------------------------
// Core Middleware
// ------------------------------------
app.use(cors()); 
app.use(express.json()); // Body parser

// Serve static frontend files (from the 'public' folder)
app.use(express.static('public')); 

// ------------------------------------
// API Routes
// ------------------------------------
app.use('/api/auth', authRoutes); // New Auth Routes
app.use('/api/expenses', expenseRoutes); // Protected Expense Routes

// ------------------------------------
// Error Handling Middleware (must be last)
// ------------------------------------
app.use(errorHandler);

// ------------------------------------
// Server Start
// ------------------------------------
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Frontend is available at http://localhost:${port}/`);
});
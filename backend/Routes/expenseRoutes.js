// backend/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { protect } = require('../middleware/auth'); // Import the JWT middleware

// Apply 'protect' middleware to ALL expense routes
router.use(protect); 

// CRUD Routes for Expenses (now protected)
router.route('/')
    .get(expenseController.getExpenses)  // READ (List & Filter/Sort)
    .post(expenseController.addExpense); // CREATE

router.route('/:id')
    .put(expenseController.updateExpense)    // UPDATE
    .delete(expenseController.deleteExpense); // DELETE

// Summary Route (now protected)
router.get('/summary', expenseController.getSummary);

module.exports = router;
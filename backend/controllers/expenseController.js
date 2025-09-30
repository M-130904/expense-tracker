// backend/controllers/expenseController.js
const ExpenseManager = require('../managers/ExpenseManager');

// CREATE: Uses req.userId
exports.addExpense = async (req, res, next) => {
    try {
        // Add userId to the data payload
        const expenseData = { ...req.body, userId: req.userId };
        const newExpense = await ExpenseManager.createExpense(expenseData);
        res.status(201).json(newExpense);
    } catch (err) {
        next(err);
    }
};

// READ: Uses req.userId for filtering
exports.getExpenses = async (req, res, next) => {
    try {
        const { category, sortBy } = req.query;
        let filter = {};
        let sort = {};

        // Filtering Logic
        if (category) {
            filter.category = category;
        }

        // Sorting Logic (Unchanged)
        if (sortBy === 'date_desc') {
            sort.date = -1;
        } else if (sortBy === 'amount_desc') {
            sort.amount = -1;
        } else {
            sort.date = -1;
        }

        const expenses = await ExpenseManager.getExpenses(req.userId, filter, sort);
        res.json(expenses);
    } catch (err) {
        next(err);
    }
};

// UPDATE: Uses req.userId and expense ID
exports.updateExpense = async (req, res, next) => {
    try {
        const updatedExpense = await ExpenseManager.updateExpense(req.userId, req.params.id, req.body);
        if (!updatedExpense) {
            return res.status(404).json({ message: 'Expense not found or user unauthorized' });
        }
        res.json(updatedExpense);
    } catch (err) {
        next(err);
    }
};

// DELETE: Uses req.userId and expense ID
exports.deleteExpense = async (req, res, next) => {
    try {
        const result = await ExpenseManager.deleteExpense(req.userId, req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Expense not found or user unauthorized' });
        }
        res.json({ message: 'Expense deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// SUMMARY: Uses req.userId for aggregation scope
exports.getSummary = async (req, res, next) => {
    try {
        const summary = await ExpenseManager.getSummary(req.userId);
        res.json(summary);
    } catch (err) {
        next(err);
    }
};
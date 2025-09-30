// backend/models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    // Link expense to User model
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be positive']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Food', 'Rent', 'Transport', 'Groceries', 'Entertainment', 'Other']
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
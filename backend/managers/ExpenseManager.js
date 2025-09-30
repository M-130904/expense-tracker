// backend/managers/ExpenseManager.js
const Expense = require('../models/Expense');
const mongoose = require('mongoose');

class ExpenseManager {
    // READ (Find all user-specific expenses with filter/sort)
    static async getExpenses(userId, filter, sort) {
        // Combine user filter with category filter
        const userFilter = { userId: new mongoose.Types.ObjectId(userId), ...filter };
        return Expense.find(userFilter).sort(sort);
    }

    // CREATE (Save new expense) - includes userId
    static async createExpense(data) {
        const newExpense = new Expense(data);
        return newExpense.save();
    }

    // UPDATE - scopes update to user and ID
    static async updateExpense(userId, expenseId, data) {
        return Expense.findOneAndUpdate(
            { _id: expenseId, userId: userId },
            data,
            { new: true, runValidators: true }
        );
    }

    // DELETE - scopes deletion to user and ID
    static async deleteExpense(userId, expenseId) {
        return Expense.findOneAndDelete({ _id: expenseId, userId: userId });
    }

    // AGGREGATION for Summary - scopes aggregation to user
    static async getSummary(userId) {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        const categoryBreakdown = await Expense.aggregate([
            { $match: { userId: userObjectId } }, // Filter by user first
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' }
                }
            },
            {
                $sort: { totalAmount: -1 }
            }
        ]);
        
        const totalExpenses = await Expense.aggregate([
            { $match: { userId: userObjectId } }, // Filter by user first
            {
                $group: {
                    _id: null,
                    grandTotal: { $sum: '$amount' }
                }
            }
        ]);

        const grandTotal = totalExpenses.length > 0 ? totalExpenses[0].grandTotal : 0;
        
        return { categoryBreakdown, grandTotal };
    }
}

module.exports = ExpenseManager;
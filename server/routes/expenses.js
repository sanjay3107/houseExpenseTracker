const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth'); // Import auth middleware

// All routes require authentication
router.use(auth);

// GET all expenses
router.get('/', expenseController.getExpenses);

// GET expenses by category (must be before /:id route)
router.get('/summary/by-category', expenseController.getExpensesByCategory);

// GET expense by ID
router.get('/:id', expenseController.getExpenseById);

// POST create new expense
router.post('/', expenseController.createExpense);

// PUT update expense
router.put('/:id', expenseController.updateExpense);

// DELETE expense
router.delete('/:id', expenseController.deleteExpense);

// GET total expenses
router.get('/summary/total', expenseController.getTotalExpenses);

module.exports = router;

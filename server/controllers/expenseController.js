const supabase = require('../config/supabase');

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    // Filter by authenticated user
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    // Include user_id check for authorization
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expense', error: error.message });
  }
};

// Create a new expense
exports.createExpense = async (req, res) => {
  try {
    // Add user_id from authenticated user
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('expenses')
      .insert([
        { 
          category: req.body.category,
          amount: req.body.amount,
          description: req.body.description,
          date: req.body.date || new Date().toISOString(),
          payment_method: req.body.paymentMethod,
          receipt: req.body.receipt,
          user_id: userId
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: 'Error creating expense', error: error.message });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // First check if the expense exists and belongs to the user
    const { data: existingExpense, error: findError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();
    
    if (findError) throw findError;
    
    if (!existingExpense) {
      return res.status(404).json({ message: 'Expense not found or access denied' });
    }
    
    // Update the expense
    const { data, error } = await supabase
      .from('expenses')
      .update({ 
        category: req.body.category,
        amount: req.body.amount,
        description: req.body.description,
        date: req.body.date,
        payment_method: req.body.paymentMethod,
        receipt: req.body.receipt
      })
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: 'Error updating expense', error: error.message });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // First check if the expense exists and belongs to the user
    const { data: existingExpense, error: findError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single();
    
    if (findError) throw findError;
    
    if (!existingExpense) {
      return res.status(404).json({ message: 'Expense not found or access denied' });
    }
    
    // Delete the expense
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
};

// Get expenses by category
exports.getExpensesByCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch all expenses for the authenticated user
    const { data, error } = await supabase
      .from('expenses')
      .select('category, amount')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Group by category and calculate totals
    const categoryTotals = data.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount;
      return acc;
    }, {});
    
    // Format the response similar to MongoDB's aggregate result
    const result = Object.keys(categoryTotals).map(category => ({
      _id: category,
      total: categoryTotals[category]
    }));
    
    // Sort by total in descending order
    result.sort((a, b) => b.total - a.total);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses by category', error: error.message });
  }
};

// Get total expenses
exports.getTotalExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch all expenses for the authenticated user
    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Calculate total
    const total = data.reduce((sum, expense) => sum + expense.amount, 0);
    
    res.status(200).json({ total });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating total expenses', error: error.message });
  }
};

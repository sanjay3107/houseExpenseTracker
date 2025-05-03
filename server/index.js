const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const supabase = require('./config/supabase');

// Import routes
const expenseRoutes = require('./routes/expenses');
const houseDetailsRoutes = require('./routes/houseDetails');
const loanCalculatorRoutes = require('./routes/loanCalculator');
const authRoutes = require('./routes/authRoutes');

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://house-expense-tracker.vercel.app', 'https://house-expense-app.netlify.app']
    : 'http://localhost:5178',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/house-details', houseDetailsRoutes);
app.use('/api/loan-calculator', loanCalculatorRoutes);
app.use('/api/auth', authRoutes);

// Test Supabase connection
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('expenses').select('count');
    if (error) throw error;
    console.log('Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('Supabase connection error:', err);
    console.log('Continuing with limited functionality. API endpoints will still work but may not be able to connect to Supabase.');
    return false;
  }
};

// We'll still start the server even if Supabase connection fails
testSupabaseConnection().then(connected => {
  if (!connected) {
    console.log('Application running in limited mode. Some features may not work properly.');
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('House Expense Tracker API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

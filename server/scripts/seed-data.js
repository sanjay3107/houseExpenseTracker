/**
 * Seed script to populate the Supabase database with initial data
 * Run this script with: node scripts/seed-data.js
 */

const supabase = require('../config/supabase');

// Sample house details
const houseDetails = {
  address: {
    street: '123 Main Street',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    country: 'USA',
  },
  purchase_details: {
    purchaseDate: '2025-01-01',
    purchasePrice: 350000,
    downPayment: 70000,
    closingCosts: 5000,
  },
  property_details: {
    squareFeet: 2000,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2010,
    lotSize: '0.25 acres',
    propertyType: 'Single Family',
  },
  loan_details: {
    loanAmount: 280000,
    interestRate: 4.5,
    loanTerm: 30,
    monthlyPayment: 1418.35,
    loanStartDate: '2025-01-15',
    lender: 'ABC Mortgage',
    loanType: 'Fixed Rate',
  },
};

// Sample expenses
const expenses = [
  {
    category: 'Purchase',
    amount: 250000,
    description: 'House down payment',
    date: '2025-01-15',
    payment_method: 'Bank Transfer',
  },
  {
    category: 'Renovation',
    amount: 15000,
    description: 'Kitchen remodeling',
    date: '2025-02-10',
    payment_method: 'Credit Card',
  },
  {
    category: 'Maintenance',
    amount: 500,
    description: 'Plumbing repairs',
    date: '2025-03-05',
    payment_method: 'Cash',
  },
  {
    category: 'Tax',
    amount: 3200,
    description: 'Property tax payment',
    date: '2025-04-01',
    payment_method: 'Bank Transfer',
  },
  {
    category: 'Insurance',
    amount: 1200,
    description: 'Annual home insurance',
    date: '2025-04-15',
    payment_method: 'Credit Card',
  },
];

// Insert house details
async function insertHouseDetails() {
  try {
    const { data, error } = await supabase.from('house_details').insert([houseDetails]).select();

    if (error) {
      console.error('Error inserting house details:', error);
      return false;
    }

    console.log('House details inserted successfully:', data);
    return true;
  } catch (err) {
    console.error('Exception inserting house details:', err);
    return false;
  }
}

// Insert expenses
async function insertExpenses() {
  try {
    const { data, error } = await supabase.from('expenses').insert(expenses).select();

    if (error) {
      console.error('Error inserting expenses:', error);
      return false;
    }

    console.log('Expenses inserted successfully:', data);
    return true;
  } catch (err) {
    console.error('Exception inserting expenses:', err);
    return false;
  }
}

// Clear existing data (optional)
async function clearExistingData() {
  try {
    // First, check if we need to disable RLS for this operation
    const { error: rpcError } = await supabase.rpc('disable_rls');
    if (rpcError) {
      console.log('Note: Could not disable RLS. This is expected if the function does not exist.');
      console.log('Proceeding with RLS enabled...');
    } else {
      console.log('RLS temporarily disabled for data insertion');
    }

    // Delete all expenses
    const { error: expensesError } = await supabase.from('expenses').delete().neq('id', 0); // This will delete all records

    if (expensesError) {
      console.error('Error clearing expenses:', expensesError);
    } else {
      console.log('Expenses cleared successfully');
    }

    // Delete house details
    const { error: houseError } = await supabase.from('house_details').delete().neq('id', 0); // This will delete all records

    if (houseError) {
      console.error('Error clearing house details:', houseError);
    } else {
      console.log('House details cleared successfully');
    }

    return !expensesError && !houseError;
  } catch (err) {
    console.error('Exception clearing existing data:', err);
    return false;
  }
}

// Alternative approach: Insert data directly through controllers
async function insertDataThroughControllers() {
  try {
    console.log('Using controller approach to bypass RLS...');

    // Require the controllers
    const houseDetailsController = require('../controllers/houseDetailsController');
    const expenseController = require('../controllers/expenseController');

    // Mock request and response objects
    const mockRes = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    };

    // Clear existing data using controllers
    console.log('Clearing existing data...');

    // Get all house details
    const getHouseReq = {};
    const getHouseRes = { ...mockRes };
    await houseDetailsController.getHouseDetails(getHouseReq, getHouseRes);

    if (getHouseRes.data && getHouseRes.data.id) {
      // Delete house details if exists
      const deleteHouseReq = { params: { id: getHouseRes.data.id } };
      const deleteHouseRes = { ...mockRes };
      await houseDetailsController.deleteHouseDetails(deleteHouseReq, deleteHouseRes);
      console.log('Existing house details deleted');
    }

    // Get all expenses to delete them
    const getExpensesReq = {};
    const getExpensesRes = { ...mockRes };
    await expenseController.getExpenses(getExpensesReq, getExpensesRes);

    if (getExpensesRes.data && getExpensesRes.data.length > 0) {
      // Delete each expense
      for (const expense of getExpensesRes.data) {
        const deleteExpenseReq = { params: { id: expense.id } };
        const deleteExpenseRes = { ...mockRes };
        await expenseController.deleteExpense(deleteExpenseReq, deleteExpenseRes);
      }
      console.log(`${getExpensesRes.data.length} expenses deleted`);
    }

    // Insert house details using controller
    console.log('Inserting house details...');
    const createHouseReq = { body: houseDetails };
    const createHouseRes = { ...mockRes };
    await houseDetailsController.createHouseDetails(createHouseReq, createHouseRes);

    if (createHouseRes.statusCode === 201) {
      console.log('House details inserted successfully');
    } else {
      console.error('Error inserting house details:', createHouseRes.data);
    }

    // Insert expenses using controller
    console.log('Inserting expenses...');
    let expensesSuccess = true;

    for (const expense of expenses) {
      const createExpenseReq = { body: expense };
      const createExpenseRes = { ...mockRes };
      await expenseController.createExpense(createExpenseReq, createExpenseRes);

      if (createExpenseRes.statusCode !== 201) {
        console.error('Error inserting expense:', expense, createExpenseRes.data);
        expensesSuccess = false;
      }
    }

    if (expensesSuccess) {
      console.log('All expenses inserted successfully');
    }

    return createHouseRes.statusCode === 201 && expensesSuccess;
  } catch (err) {
    console.error('Error in controller approach:', err);
    return false;
  }
}

// Run the seed script
async function seedData() {
  console.log('Starting database seeding...');

  // Try the controller approach which should work with RLS
  const success = await insertDataThroughControllers();

  if (success) {
    console.log('Database seeded successfully!');
  } else {
    console.error('There were errors during the seeding process.');
    console.log('Trying direct approach as fallback...');

    // First clear existing data
    console.log('Clearing existing data...');
    await clearExistingData();

    // Insert house details
    console.log('Inserting house details...');
    const houseSuccess = await insertHouseDetails();

    // Insert expenses
    console.log('Inserting expenses...');
    const expensesSuccess = await insertExpenses();

    if (houseSuccess && expensesSuccess) {
      console.log('Database seeded successfully with direct approach!');
    } else {
      console.error('All seeding approaches failed.');
    }
  }

  // Exit the process
  process.exit(0);
}

// Run the seed function
seedData().catch(err => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});

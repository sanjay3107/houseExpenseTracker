# House Expense Tracker

A comprehensive web application to track house expenses, manage property details, and calculate loan repayment options including prepayment scenarios.

## Features

- **Dashboard**: Overview of house expenses, loan details, and expense distribution
- **House Details**: Store and manage property information, purchase details, and loan information
- **Expense Tracking**: Add, edit, and categorize all house-related expenses
- **Loan Calculator**: Calculate monthly payments and view amortization schedules
- **Prepayment Calculator**: Analyze the impact of making additional payments on your mortgage

## Tech Stack

- **Frontend**: React.js with Vite, React Router, Bootstrap, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **API**: RESTful API architecture

## Installation

### Prerequisites

- Node.js (v14 or higher)
- Supabase account (free tier is sufficient)

### Setup Instructions

1. Clone the repository:

```bash
git clone <repository-url>
cd house-expense-tracker
```

2. Install backend dependencies:

```bash
cd server
npm install
```

3. Install frontend dependencies:

```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory with the following variables:

```
PORT=5000
NODE_ENV=development
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

5. Create a `.env` file in the client directory with the following variables:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

6. Set up the Supabase database schema:

   a. Log in to your Supabase account and open the project
   
   b. Navigate to the SQL Editor in the Supabase dashboard
   
   c. Copy the contents of `server/config/supabase-schema.sql` and execute it in the SQL Editor
   
   This will create the necessary tables and security policies for the application.

## Running the Application

1. Start the backend server:

```bash
cd server
npm run dev
```

3. Start the frontend development server:

```bash
cd ../client
npm run dev
```

4. Access the application at `http://localhost:5173`

## Usage Guide

### Adding House Details

1. Navigate to the "House Details" page
2. Fill in your property information, purchase details, and loan information
3. Click "Save Details"

### Tracking Expenses

1. Go to the "Expenses" page
2. Click "Add New Expense"
3. Enter expense details including category, amount, and date
4. Click "Add Expense"

### Using the Loan Calculator

1. Navigate to the "Loan Calculator" page
2. Enter your loan amount, interest rate, and loan term
3. Click "Calculate" to see your monthly payment and amortization schedule

### Analyzing Prepayment Options

1. Go to the "Prepayment Calculator" page
2. Enter your loan details and prepayment amount
3. Select the prepayment frequency (monthly, quarterly, or annually)
4. Click "Calculate" to see how much time and interest you can save

## License

MIT

## Author

[Sanjay Yadav]

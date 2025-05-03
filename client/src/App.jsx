import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/enterprise-theme.css';
import './App.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Dashboard from './components/Dashboard';
import HouseDetails from './components/house/HouseDetails';
import ExpenseList from './components/expenses/ExpenseList';
import AddExpense from './components/expenses/AddExpense';
import EditExpense from './components/expenses/EditExpense';
import LoanCalculator from './components/loan/LoanCalculator';
import PrepaymentCalculator from './components/loan/PrepaymentCalculator';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ResetPassword from './components/auth/ResetPassword';
import ResetPasswordConfirm from './components/auth/ResetPasswordConfirm';
import ConfirmEmail from './components/auth/ConfirmEmail';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App d-flex flex-column" style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
          <Header />
          <div className="flex-grow-1 w-100">
            <Container fluid className="py-4 px-0">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
                <Route path="/auth/confirm" element={<ConfirmEmail />} />
                
                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/house-details" element={<HouseDetails />} />
                  <Route path="/expenses" element={<ExpenseList />} />
                  <Route path="/expenses/add" element={<AddExpense />} />
                  <Route path="/expenses/edit/:id" element={<EditExpense />} />
                  <Route path="/loan-calculator" element={<LoanCalculator />} />
                  <Route path="/prepayment-calculator" element={<PrepaymentCalculator />} />
                </Route>
              </Routes>
            </Container>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

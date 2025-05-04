import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import API_ENDPOINTS from '../config/api';
import { formatIndianCurrency } from '../utils/currencyFormatter';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [houseDetails, setHouseDetails] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        let houseData = null;
        let expensesData = [];
        let expensesByCategoryData = [];
        let totalExpensesAmount = 0;

        try {
          // Fetch house details with cache-busting parameter
          const houseResponse = await axios.get(
            `${API_ENDPOINTS.HOUSE.DETAILS}?_t=${new Date().getTime()}`
          );
          houseData = houseResponse.data;
        } catch (error) {
          console.log('No house details found for user. This is normal for new users.');
          // Continue with other requests - we'll show an empty state for house details
        }

        try {
          // Fetch expenses
          const expensesResponse = await axios.get(API_ENDPOINTS.EXPENSES.ALL);
          expensesData = expensesResponse.data;

          // Fetch expenses by category
          const expensesByCategoryResponse = await axios.get(
            `${API_ENDPOINTS.EXPENSES.ALL}/summary/by-category`
          );
          expensesByCategoryData = expensesByCategoryResponse.data;

          // Fetch total expenses
          const totalExpensesResponse = await axios.get(
            `${API_ENDPOINTS.EXPENSES.ALL}/summary/total`
          );
          totalExpensesAmount = totalExpensesResponse.data.total;
        } catch (error) {
          console.log('No expense data found for user. This is normal for new users.');
          // Continue with rendering - we'll show empty states for expenses
        }

        // Set all the state variables with whatever data we were able to fetch
        setHouseDetails(houseData);
        setExpenses(expensesData);
        setExpensesByCategory(expensesByCategoryData);
        setTotalExpenses(totalExpensesAmount);

        setLoading(false);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        // Even with individual error handling above, we'll show a generic error if everything fails
        setError('Error fetching dashboard data. New users may need to add data first.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare chart data for expenses by category
  const categoryChartData = {
    labels:
      expensesByCategory.length > 0
        ? expensesByCategory.map(item => item._id || item.category || 'Unknown')
        : ['No Data'],
    datasets: [
      {
        label: 'Expenses by Category',
        data:
          expensesByCategory.length > 0
            ? expensesByCategory.map(item => item.total || item.amount || 0)
            : [0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Expenses by Category',
      },
    },
  };

  // Function to determine badge color based on category
  const getCategoryColor = category => {
    const colorMap = {
      Mortgage: 'danger',
      Utilities: 'warning',
      Maintenance: 'success',
      Insurance: 'info',
      'Property Tax': 'primary',
      Renovation: 'warning',
      Furnishing: 'success',
      Other: 'secondary',
    };

    return colorMap[category] || 'primary';
  };

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: '60vh' }}
      >
        <div
          className="spinner-grow text-primary mb-4"
          role="status"
          style={{ width: '3rem', height: '3rem' }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="text-primary mb-2">Loading Dashboard</h4>
        <p className="text-muted">Preparing your financial overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-light rounded-3 p-4 shadow-sm border-start border-5 border-danger">
        <div className="d-flex align-items-center">
          <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
            <i className="bi bi-exclamation-triangle-fill text-danger fs-3"></i>
          </div>
          <div className="flex-grow-1">
            <h3 className="text-danger mb-2">Dashboard Error</h3>
            <p className="mb-3">{error}</p>
            <div>
              <Link to="/house-details" className="btn btn-outline-primary me-2">
                <i className="bi bi-house-add me-2"></i>Add House Details
              </Link>
              <Link to="/expenses/add" className="btn btn-outline-success">
                <i className="bi bi-plus-circle me-2"></i>Add Expenses
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <h1 className="mb-0">
          <i className="bi bi-speedometer2 me-2 text-primary"></i>Dashboard
        </h1>
        <div>
          <Link to="/expenses/add" className="btn btn-sm btn-primary me-2">
            <i className="bi bi-plus-circle me-1"></i> Add Expense
          </Link>
          <Link to="/house-details" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-house-gear me-1"></i> House Settings
          </Link>
        </div>
      </div>

      {!houseDetails && (
        <Alert variant="info" className="mb-4 border-start border-4 border-primary shadow-sm">
          <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
              <i className="bi bi-house-door text-primary" style={{ fontSize: '28px' }}></i>
            </div>
            <div>
              <h4 className="mb-1">Welcome to your expense tracker!</h4>
              <p className="mb-2 text-secondary">
                Start by adding details about your house to set up your personalized dashboard.
              </p>
              <div>
                <Link to="/house-details" className="btn btn-primary">
                  <i className="bi bi-house-add me-2"></i>Add House Details
                </Link>
              </div>
            </div>
          </div>
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card
            className="h-100 shadow-sm border-0 bg-gradient"
            style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0 text-dark">Total Expenses</Card.Title>
                <div className="rounded-circle bg-primary bg-opacity-10 p-2">
                  <i className="bi bi-cash-coin text-primary fs-4"></i>
                </div>
              </div>
              <h3 className="display-6 fw-bold text-primary mb-1">
                {formatIndianCurrency(totalExpenses || 0)}
              </h3>
              <Card.Text className="text-muted">Total amount spent on your house</Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent border-top-0 pt-0">
              <Link to="/expenses" className="btn btn-sm btn-outline-primary w-100">
                <i className="bi bi-list-ul me-1"></i> View all expenses
              </Link>
            </Card.Footer>
          </Card>
        </Col>

        {/* House & Loan Details Cards - Always show, with placeholders for missing data */}
        <Col md={6} lg={3} className="mb-3">
          <Card
            className="h-100 shadow-sm border-0 bg-gradient"
            style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9f7ef)' }}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0 text-dark">Purchase Price</Card.Title>
                <div className="rounded-circle bg-success bg-opacity-10 p-2">
                  <i className="bi bi-house text-success fs-4"></i>
                </div>
              </div>
              {houseDetails && houseDetails.purchase_details?.purchase_price ? (
                <h3 className="display-6 fw-bold text-success mb-1">
                  {formatIndianCurrency(houseDetails.purchase_details.purchase_price)}
                </h3>
              ) : (
                <h3 className="display-6 fw-bold text-muted mb-1">Not set</h3>
              )}
              <Card.Text className="text-muted">Your house purchase price</Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent border-top-0 pt-0">
              <Link to="/house-details" className="btn btn-sm btn-outline-success w-100">
                <i className="bi bi-house-gear me-1"></i>{' '}
                {houseDetails ? 'View house details' : 'Add house details'}
              </Link>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card
            className="h-100 shadow-sm border-0 bg-gradient"
            style={{ background: 'linear-gradient(135deg, #f8f9fa, #ffecef)' }}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0 text-dark">Loan Balance</Card.Title>
                <div className="rounded-circle bg-danger bg-opacity-10 p-2">
                  <i className="bi bi-bank text-danger fs-4"></i>
                </div>
              </div>
              {houseDetails && houseDetails.loan_details?.loan_amount ? (
                <h3 className="display-6 fw-bold text-danger mb-1">
                  {formatIndianCurrency(houseDetails.loan_details.loan_amount)}
                </h3>
              ) : (
                <h3 className="display-6 fw-bold text-muted mb-1">Not set</h3>
              )}
              <Card.Text className="text-muted">Current loan balance</Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent border-top-0 pt-0">
              <Link to="/loan-calculator" className="btn btn-sm btn-outline-danger w-100">
                <i className="bi bi-calculator me-1"></i> Loan calculator
              </Link>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card
            className="h-100 shadow-sm border-0 bg-gradient"
            style={{ background: 'linear-gradient(135deg, #f8f9fa, #fff9e6)' }}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0 text-dark">Monthly Payment</Card.Title>
                <div className="rounded-circle bg-warning bg-opacity-10 p-2">
                  <i className="bi bi-calendar-check text-warning fs-4"></i>
                </div>
              </div>
              {houseDetails && houseDetails.loan_details?.monthly_payment ? (
                <h3 className="display-6 fw-bold text-warning mb-1">
                  {formatIndianCurrency(houseDetails.loan_details.monthly_payment)}
                </h3>
              ) : (
                <h3 className="display-6 fw-bold text-muted mb-1">Not set</h3>
              )}
              <Card.Text className="text-muted">Your monthly loan payment</Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent border-top-0 pt-0">
              <Link to="/prepayment-calculator" className="btn btn-sm btn-outline-warning w-100">
                <i className="bi bi-graph-down-arrow me-1"></i> Prepayment calculator
              </Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Expense Charts Section */}
      {expensesByCategory.length > 0 ? (
        <Row className="mb-4">
          <Col md={6} className="mb-3">
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-bar-chart-fill text-primary me-2"></i>Expenses by Category
                </h5>
                <div className="dropdown">
                  <button className="btn btn-sm btn-light" type="button">
                    <i className="bi bi-three-dots-vertical"></i>
                  </button>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div style={{ height: '300px' }}>
                  <Bar data={categoryChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-3">
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-pie-chart-fill text-primary me-2"></i>Expense Distribution
                </h5>
                <div className="dropdown">
                  <button className="btn btn-sm btn-light" type="button">
                    <i className="bi bi-three-dots-vertical"></i>
                  </button>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div style={{ height: '300px' }}>
                  <Pie data={categoryChartData} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <div className="mb-4 bg-light rounded-3 p-4 shadow-sm border-start border-4 border-info position-relative overflow-hidden">
          <div
            className="position-absolute"
            style={{ right: '-30px', top: '-20px', opacity: 0.1, transform: 'rotate(30deg)' }}
          >
            <i className="bi bi-graph-up" style={{ fontSize: '180px' }}></i>
          </div>
          <div className="row align-items-center">
            <div className="col-auto pe-0">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                <i className="bi bi-graph-up-arrow text-info" style={{ fontSize: '32px' }}></i>
              </div>
            </div>
            <div className="col">
              <h3 className="mb-2">No expense data yet!</h3>
              <p className="mb-3 text-secondary">
                Add your first expense to visualize your spending with charts and analytics.
              </p>
              <Link to="/expenses/add" className="btn btn-info text-white">
                <i className="bi bi-plus-circle me-2"></i>Add Your First Expense
              </Link>
            </div>
          </div>
        </div>
      )}

      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-receipt text-primary me-2"></i>Recent Expenses
              </h5>
              {expenses.length > 0 && (
                <Link to="/expenses/add" className="btn btn-primary">
                  <i className="bi bi-plus-lg me-1"></i>Add New
                </Link>
              )}
            </Card.Header>
            <Card.Body>
              {expenses.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover border-top-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0">Date</th>
                        <th className="border-0">Category</th>
                        <th className="border-0">Description</th>
                        <th className="border-0 text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.slice(0, 5).map(expense => (
                        <tr key={expense.id || expense._id}>
                          <td className="align-middle">
                            <span className="text-nowrap">
                              {new Date(expense.date).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="align-middle">
                            <span
                              className={`badge rounded-pill bg-${getCategoryColor(expense.category)} bg-opacity-75 py-2 px-3`}
                            >
                              {expense.category}
                            </span>
                          </td>
                          <td className="align-middle">{expense.description}</td>
                          <td className="align-middle text-end fw-bold">
                            {typeof expense.amount === 'number'
                              ? formatIndianCurrency(expense.amount)
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5 bg-light rounded-3 my-3">
                  <div className="mb-3">
                    <div className="d-inline-block p-4 bg-white rounded-circle shadow-sm">
                      <i className="bi bi-receipt text-primary" style={{ fontSize: '48px' }}></i>
                    </div>
                  </div>
                  <h4 className="mb-3">No expenses recorded yet</h4>
                  <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                    Start tracking your house expenses to get insights into your spending patterns
                    and manage your budget efficiently.
                  </p>
                  <Link to="/expenses/add" className="btn btn-lg btn-primary shadow-sm">
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Your First Expense
                  </Link>
                </div>
              )}
            </Card.Body>
            {expenses.length > 5 && (
              <Card.Footer className="bg-white border-top py-3 text-center">
                <Link to="/expenses" className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-table me-1"></i> View All Expenses
                </Link>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

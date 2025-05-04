import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Row, Col, Badge, Alert, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatIndianCurrency } from '../../utils/currencyFormatter';
import API_ENDPOINTS from '../../config/api';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.EXPENSES.ALL);
      setExpenses(response.data);

      // Calculate total amount
      const total = response.data.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalAmount(total);

      setLoading(false);
    } catch (err) {
      setError('Error fetching expenses. Please try again later.');
      console.error('Expense fetch error:', err);
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!id) {
      setError('Invalid expense ID. Cannot delete this expense.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`${API_ENDPOINTS.EXPENSES.ALL}/${id}`);
        // Refresh expenses after deletion
        fetchExpenses();
      } catch (err) {
        setError(`Error deleting expense: ${err.response?.data?.error || err.message}`);
        console.error('Expense delete error:', err);
      }
    }
  };

  const handleSort = field => {
    if (sortField === field) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getCategoryBadgeVariant = category => {
    const variants = {
      Purchase: 'primary',
      Renovation: 'success',
      Maintenance: 'warning',
      Tax: 'danger',
      Insurance: 'info',
      Utility: 'secondary',
      Other: 'dark',
    };
    return variants[category] || 'light';
  };

  // Filter and sort expenses
  const filteredAndSortedExpenses = expenses
    .filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory ? expense.category === filterCategory : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortField === 'date') {
        comparison = new Date(a.date) - new Date(b.date);
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortField === 'description') {
        comparison = a.description.localeCompare(b.description);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Calculate filtered total
  const filteredTotal = filteredAndSortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return <div className="text-center py-5">Loading expenses...</div>;
  }

  return (
    <div className="expense-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Expenses</h1>
        <Link to="/expenses/add">
          <Button variant="primary">Add New Expense</Button>
        </Link>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4} className="mb-3 mb-md-0">
              <Card className="h-100">
                <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                  <h6 className="text-muted mb-2">Total Expenses</h6>
                  <h3 className="text-primary">{formatIndianCurrency(totalAmount)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3 mb-md-0">
              <Card className="h-100">
                <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                  <h6 className="text-muted mb-2">Filtered Total</h6>
                  <h3 className="text-success">{formatIndianCurrency(filteredTotal)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                  <h6 className="text-muted mb-2">Expense Count</h6>
                  <h3 className="text-info">{filteredAndSortedExpenses.length}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6} className="mb-3 mb-md-0">
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="">All Categories</option>
                <option value="Purchase">Purchase</option>
                <option value="Renovation">Renovation</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Tax">Tax</option>
                <option value="Insurance">Insurance</option>
                <option value="Utility">Utility</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Col>
          </Row>

          {filteredAndSortedExpenses.length > 0 ? (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                      Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
                      Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
                      Description{' '}
                      {sortField === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('amount')} style={{ cursor: 'pointer' }}>
                      Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Payment Method</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedExpenses.map(expense => (
                    <tr key={expense.id || expense._id}>
                      <td>{new Date(expense.date).toLocaleDateString()}</td>
                      <td>
                        <Badge bg={getCategoryBadgeVariant(expense.category)}>
                          {expense.category}
                        </Badge>
                      </td>
                      <td>{expense.description}</td>
                      <td>{formatIndianCurrency(expense.amount)}</td>
                      <td>{expense.payment_method || expense.paymentMethod || 'N/A'}</td>
                      <td>
                        <div className="d-flex">
                          <Link to={`/expenses/edit/${expense.id || expense._id}`} className="me-2">
                            <Button variant="outline-primary" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(expense.id || expense._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info">
              {expenses.length === 0
                ? "You haven't added any expenses yet."
                : 'No expenses match your search criteria.'}
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ExpenseList;

import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatIndianCurrency } from '../../utils/currencyFormatter';
import API_ENDPOINTS from '../../config/api';

const AddExpense = () => {
  const navigate = useNavigate();
  const [expense, setExpense] = useState({
    category: 'Purchase',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    receipt: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate amount
      if (isNaN(expense.amount) || parseFloat(expense.amount) <= 0) {
        setError('Please enter a valid amount greater than zero.');
        setLoading(false);
        return;
      }
      
      // Convert amount to number and camelCase to snake_case for Supabase
      const formattedExpense = {
        ...expense,
        amount: parseFloat(expense.amount),
        payment_method: expense.paymentMethod // Convert camelCase to snake_case for Supabase
      };
      
      // Remove the camelCase property to avoid duplication
      delete formattedExpense.paymentMethod;
      
      await axios.post(API_ENDPOINTS.EXPENSES.ALL, formattedExpense);
      
      setLoading(false);
      navigate('/expenses');
    } catch (err) {
      setError(`Error adding expense: ${err.response?.data?.error || err.message}`);
      console.error('Expense add error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="add-expense">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Add New Expense</h1>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={expense.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Purchase">Purchase</option>
                    <option value="Renovation">Renovation</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Tax">Tax</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Utility">Utility</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Amount (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={expense.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={expense.description}
                    onChange={handleInputChange}
                    placeholder="Enter expense description"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={expense.date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={expense.paymentMethod}
                    onChange={handleInputChange}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Receipt URL (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="receipt"
                    value={expense.receipt}
                    onChange={handleInputChange}
                    placeholder="URL to receipt image"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end mt-3">
              <Button 
                variant="secondary" 
                className="me-2" 
                onClick={() => navigate('/expenses')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Expense'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddExpense;

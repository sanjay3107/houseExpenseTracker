import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { formatIndianCurrency } from '../../utils/currencyFormatter';
import API_ENDPOINTS from '../../config/api';

const EditExpense = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [expense, setExpense] = useState({
    category: '',
    amount: '',
    description: '',
    date: '',
    paymentMethod: '',
    receipt: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        // Check if ID is valid before making the API call
        if (!id || id === 'undefined') {
          setError('Invalid expense ID. Please go back and try again.');
          setLoading(false);
          return;
        }

        setLoading(true);
        const response = await axios.get(`${API_ENDPOINTS.EXPENSES.ALL}/${id}`);

        // Format date for form input
        const formattedDate = response.data.date
          ? new Date(response.data.date).toISOString().split('T')[0]
          : '';

        setExpense({
          ...response.data,
          date: formattedDate,
        });

        setLoading(false);
      } catch (err) {
        setError(`Error fetching expense: ${err.response?.data?.error || err.message}`);
        console.error('Expense fetch error:', err);
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setExpense(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      // Validate ID
      if (!id || id === 'undefined') {
        setError('Invalid expense ID. Cannot update this expense.');
        setSaving(false);
        return;
      }

      // Validate amount
      if (isNaN(expense.amount) || parseFloat(expense.amount) <= 0) {
        setError('Please enter a valid amount greater than zero.');
        setSaving(false);
        return;
      }

      // Convert amount to number
      const formattedExpense = {
        ...expense,
        amount: parseFloat(expense.amount),
        payment_method: expense.paymentMethod, // Convert camelCase to snake_case for Supabase
      };

      await axios.put(`${API_ENDPOINTS.EXPENSES.ALL}/${id}`, formattedExpense);

      setSaving(false);
      navigate('/expenses');
    } catch (err) {
      setError(`Error updating expense: ${err.response?.data?.error || err.message}`);
      console.error('Expense update error:', err);
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading expense details...</div>;
  }

  return (
    <div className="edit-expense">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Edit Expense</h1>
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
                    value={expense.paymentMethod || ''}
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
                    value={expense.receipt || ''}
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
                disabled={saving}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Update Expense'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EditExpense;

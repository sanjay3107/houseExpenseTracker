import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [loading, setLoading] = useState(false);
  const { register, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (formData.password !== formData.passwordConfirm) {
      return setError('Passwords do not match');
    }
    
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await register(
        formData.email, 
        formData.password,
        formData.name
      );
      
      if (error) {
        throw new Error(error);
      }
      
      // Show success message and redirect to login
      alert('Registration successful! Please check your email to confirm your account.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      // Error is already set in the auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '90vh' }}>
      <div style={{ width: '400px', maxWidth: '100%' }}>
        <Form onSubmit={handleSubmit} className="bg-white p-4 shadow-sm border rounded" autoComplete="off">
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="new-email"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            <Form.Text className="text-muted">
              Password must be at least 6 characters
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </Form.Group>
          
          <Button 
            variant="primary" 
            type="submit" 
            className="w-100 py-2 mb-3"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
          
          <div className="text-center">
            <p className="mb-0">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;

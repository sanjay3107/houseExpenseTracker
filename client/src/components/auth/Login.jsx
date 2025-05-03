import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await login(formData.email, formData.password);
      
      if (error) {
        throw new Error(error);
      }
      
      // Redirect to dashboard on successful login
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      // Error is already set in the auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '90vh' }}>
      <div style={{ width: '360px', maxWidth: '100%' }}>
        <Form onSubmit={handleSubmit} className="bg-white p-4 shadow-sm border rounded" autoComplete="off">
          {error && <Alert variant="danger">{error}</Alert>}
          
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
          </Form.Group>
          
          <Button 
            variant="primary" 
            type="submit" 
            className="w-100 py-2 mb-3"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          
          <div className="text-center">
            <Link to="/reset-password" className="d-block mb-2">
              Forgot password?
            </Link>
            <div>
              Don't have an account? <Link to="/register">Register</Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;

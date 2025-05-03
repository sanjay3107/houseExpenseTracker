import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../config/supabase';

const ResetPasswordConfirm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL if available
  useEffect(() => {
    // Check for token in URL hash (this is how Supabase delivers it)
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const token = hashParams.get('access_token');
    
    if (!token) {
      setError('No reset token found in URL. Please request a new password reset.');
    } else {
      // Set the session in Supabase to use the token
      const setSession = async () => {
        try {
          // This tells Supabase to use the token from the URL
          await supabase.auth.getSession();
        } catch (err) {
          console.error('Error setting session:', err);
        }
      };
      setSession();
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Supabase will automatically use the token from the URL
      // when updateUser is called after getSession() has processed the URL
      const { data, error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        throw error;
      }

      setMessage('Password has been reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.message || 'Failed to reset password');
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Reset Your Password</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              {message && <Alert variant="success">{message}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 mb-3"
                  disabled={loading || error === 'No reset token found in URL. Please request a new password reset.'}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </Form>
              
              <div className="text-center mt-3">
                <p>
                  Remember your password? <Link to="/login">Login</Link>
                </p>
                <p>
                  Need a new reset link? <Link to="/reset-password">Request Reset</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPasswordConfirm;

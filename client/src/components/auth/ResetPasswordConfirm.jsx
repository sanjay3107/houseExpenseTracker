import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials directly
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const ResetPasswordConfirm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL
  const [accessToken, setAccessToken] = useState(null);
  
  useEffect(() => {
    // Extract token from URL hash
    const hash = location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    
    if (token) {
      console.log('Token found in URL');
      setAccessToken(token);
    } else {
      console.error('No token found in URL hash');
      setError('No reset token found in URL. Please request a new password reset.');
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
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      console.log('Attempting password reset with token');
      
      // Create a fresh Supabase client and pass the token directly
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Update the user's password with the token
      const { data, error } = await supabase.auth.updateUser(
        { password },
        { accessToken: accessToken }
      );
      
      if (error) {
        console.error('Password update error:', error);
        throw error;
      }
      
      console.log('Password updated successfully:', data);

      // Set success message
      setMessage('Password has been reset successfully!');
      setLoading(false);
      
      // Clear form fields
      setPassword('');
      setConfirmPassword('');
      
      // Show success message for 3 seconds, then redirect to login
      setTimeout(() => {
        navigate('/login', { state: { message: 'Your password has been reset. Please log in with your new password.' } });
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
              {error && (
                <Alert variant="danger">
                  ⚠️ {error}
                </Alert>
              )}
              {message && (
                <Alert variant="success">
                  ✅ {message}
                  <div className="mt-2 small text-muted">
                    Redirecting to login page in a few seconds...
                  </div>
                </Alert>
              )}
              
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

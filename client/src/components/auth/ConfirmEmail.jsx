import React, { useEffect, useState } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../config/supabase';

const ConfirmEmail = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Parse the hash params (what comes after # in the URL)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (type === 'email_confirmation' && accessToken) {
          setMessage('Your email has been confirmed! Redirecting to dashboard...');
          
          // Set the session in Supabase manually
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          // Wait a moment and redirect
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setError('Could not confirm email. Invalid or expired link.');
        }
      } catch (err) {
        console.error('Error confirming email:', err);
        setError('An error occurred while confirming your email. Please try logging in.');
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <Container className="py-5 text-center">
      {loading && (
        <div className="mb-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Processing email confirmation...</p>
        </div>
      )}
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {message && <Alert variant="success">{message}</Alert>}
    </Container>
  );
};

export default ConfirmEmail;

const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();
const auth = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Register user using Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          name,
          created_at: new Date().toISOString()
        }
      }
    });
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    // Return success message
    res.status(201).json({ 
      message: 'Registration successful. Please check your email for verification.',
      user: data.user
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login a user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    // Return user data and token
    res.json({
      user: data.user,
      session: data.session
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

/**
 * @route   GET /api/auth/user
 * @desc    Get user data
 * @access  Private
 */
router.get('/user', auth, async (req, res) => {
  try {
    // User is already attached to the request by the auth middleware
    res.json(req.user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error fetching user data' });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout a user
 * @access  Private
 */
router.post('/logout', auth, async (req, res) => {
  try {
    // Get the access token from the request
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Sign out with Supabase Auth
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }
    
    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL}/reset-password-confirm`
    });
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
});

// Password reset confirmation is handled directly by Supabase in the frontend

module.exports = router;

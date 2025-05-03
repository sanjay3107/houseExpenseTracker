const supabase = require('../config/supabase');

/**
 * Authentication middleware for Supabase
 * Verifies JWT token from the request header
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token, authorization denied' });
    }
    
    // Set user data in request object
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

module.exports = auth;

/**
 * Script to confirm a user's email in Supabase
 * Usage: node confirm-user-email.js <user_id>
 */

require('dotenv').config();
const supabase = require('../config/supabase');

async function confirmUserEmail(userId) {
  if (!userId) {
    console.error('Please provide a user ID');
    process.exit(1);
  }

  try {
    console.log(`Confirming email for user ID: ${userId}`);

    // Update the user's email status
    // Note: This requires the service_role key, not the anon key
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (error) {
      throw new Error(`Error confirming email: ${error.message}`);
    }

    console.log('Email confirmed successfully!');
    console.log('User details:', data);
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nAlternative solution:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Authentication > Providers > Email');
    console.log('3. Uncheck "Confirm email" and save changes');
    process.exit(1);
  }
}

// Get the user ID from command line arguments
const userId = process.argv[2];
confirmUserEmail(userId);

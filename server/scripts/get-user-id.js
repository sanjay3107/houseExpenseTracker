/**
 * Script to get a user ID by email from Supabase
 * Usage: node get-user-id.js <email>
 */

require('dotenv').config();
const supabase = require('../config/supabase');

async function getUserId(email) {
  if (!email) {
    console.error('Please provide an email address');
    process.exit(1);
  }

  try {
    console.log(`Looking up user with email: ${email}`);

    // Use the admin API to find the user by email
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }

    const user = data.users.find(u => u.email === email);

    if (!user) {
      throw new Error(`No user found with email: ${email}`);
    }

    console.log('===============================');
    console.log(`User found: ${user.email}`);
    console.log(`User ID: ${user.id}`);
    console.log('===============================');
    console.log('Use this ID in your migration command:');
    console.log(`node scripts/add-user-id-migration.js ${user.id}`);
    console.log('===============================');

    return user.id;
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Get the email from command line arguments
const email = process.argv[2];
getUserId(email);

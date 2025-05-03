/**
 * This script is used to migrate existing data in the database to work with the new authentication system.
 * It adds a user_id column to the expenses and house_details tables, and associates all existing
 * records with a specified user ID.
 * 
 * Usage: node add-user-id-migration.js <user_id>
 * 
 * Note: This should be run after creating a user account but before enabling RLS policies.
 */

require('dotenv').config();
const supabase = require('../config/supabase');

async function migrateData(userId) {
  if (!userId) {
    console.error('Please provide a valid user ID');
    process.exit(1);
  }

  try {
    console.log(`Starting migration for user ID: ${userId}`);
    
    // Update expenses table
    console.log('Updating expenses table...');
    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .update({ user_id: userId })
      .is('user_id', null)
      .select('id');
    
    if (expensesError) {
      throw new Error(`Error updating expenses: ${expensesError.message}`);
    }
    
    console.log(`Updated ${expensesData.length} expenses`);
    
    // Update house_details table
    console.log('Updating house_details table...');
    const { data: houseData, error: houseError } = await supabase
      .from('house_details')
      .update({ user_id: userId })
      .is('user_id', null)
      .select('id');
    
    if (houseError) {
      throw new Error(`Error updating house details: ${houseError.message}`);
    }
    
    console.log(`Updated ${houseData.length} house details`);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

// Get the user ID from command line arguments
const userId = process.argv[2];
migrateData(userId);

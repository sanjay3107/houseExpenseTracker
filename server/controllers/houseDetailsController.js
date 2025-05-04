const supabase = require('../config/supabase');

// Get house details
exports.getHouseDetails = async (req, res) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user.id;

    // Get house details for the authenticated user
    const { data, error } = await supabase
      .from('house_details')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is the error code for no rows returned
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: 'House details not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching house details', error: error.message });
  }
};

// Create house details
exports.createHouseDetails = async (req, res) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user.id;

    // Check if house details already exist for this user
    const { data: existingData, error: checkError } = await supabase
      .from('house_details')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (checkError) throw checkError;

    if (existingData && existingData.length > 0) {
      return res.status(400).json({
        message: 'House details already exist for this user. Use the update endpoint instead.',
      });
    }

    // Format the data to match Supabase table structure
    const houseData = {
      address: req.body.address,
      purchase_details: req.body.purchase_details || req.body.purchaseDetails,
      property_details: req.body.property_details || req.body.propertyDetails,
      loan_details: req.body.loan_details || req.body.loanDetails,
      user_id: userId, // Add user_id
    };

    const { data, error } = await supabase
      .from('house_details')
      .insert([houseData])
      .select()
      .single();

    if (error) throw error;

    // Return the data directly in snake_case format for consistency with Supabase
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: 'Error creating house details', error: error.message });
  }
};

// Update house details
exports.updateHouseDetails = async (req, res) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user.id;

    // Check if house details exist for this user
    const { data: existingData, error: checkError } = await supabase
      .from('house_details')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (!existingData) {
      return res.status(404).json({ message: 'House details not found for this user' });
    }

    // Format the data to match Supabase table structure
    const updateData = {};

    // Log the incoming request body for debugging
    console.log('Update request body:', req.body);

    // Always include all nested objects to ensure complete updates
    updateData.address = req.body.address || {};
    updateData.purchase_details = req.body.purchase_details || req.body.purchaseDetails || {};
    updateData.property_details = req.body.property_details || req.body.propertyDetails || {};
    updateData.loan_details = req.body.loan_details || req.body.loanDetails || {};

    console.log('Sending update to Supabase:', updateData);

    const { data, error } = await supabase
      .from('house_details')
      .update(updateData)
      .eq('id', existingData.id)
      .eq('user_id', userId) // Add user_id check
      .select()
      .single();

    console.log('Supabase update response:', data, error);

    if (error) throw error;

    // Return the data directly in snake_case format for consistency with Supabase
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: 'Error updating house details', error: error.message });
  }
};

// Delete house details
exports.deleteHouseDetails = async (req, res) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user.id;

    // Check if house details exist for this user
    const { data: existingData, error: checkError } = await supabase
      .from('house_details')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (!existingData) {
      return res.status(404).json({ message: 'House details not found for this user' });
    }

    const { error } = await supabase
      .from('house_details')
      .delete()
      .eq('id', existingData.id)
      .eq('user_id', userId); // Add user_id check

    if (error) throw error;

    res.status(200).json({ message: 'House details deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting house details', error: error.message });
  }
};

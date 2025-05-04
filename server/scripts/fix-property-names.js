/**
 * This script fixes the mixed property names in the Supabase database
 * by consolidating all camelCase and snake_case properties into snake_case only.
 */

const supabase = require('../config/supabase');

async function fixPropertyNames() {
  try {
    console.log('Starting property name fix script...');

    // Get all house details records
    const { data: houses, error: fetchError } = await supabase.from('house_details').select('*');

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${houses.length} house records to process`);

    // Process each house record
    for (const house of houses) {
      console.log(`Processing house ID: ${house.id}`);

      // Fix purchase_details
      const purchaseDetails = house.purchase_details || {};
      const fixedPurchaseDetails = {
        // Use snake_case properties and fall back to camelCase if needed
        purchase_date: purchaseDetails.purchase_date || purchaseDetails.purchaseDate || null,
        purchase_price: purchaseDetails.purchase_price || purchaseDetails.purchasePrice || null,
        down_payment: purchaseDetails.down_payment || purchaseDetails.downPayment || null,
        closing_costs: purchaseDetails.closing_costs || purchaseDetails.closingCosts || null,
      };

      // Remove any camelCase properties
      delete fixedPurchaseDetails.purchaseDate;
      delete fixedPurchaseDetails.purchasePrice;
      delete fixedPurchaseDetails.downPayment;
      delete fixedPurchaseDetails.closingCosts;

      // Fix property_details
      const propertyDetails = house.property_details || {};
      const fixedPropertyDetails = {
        square_feet: propertyDetails.square_feet || propertyDetails.squareFeet || null,
        bedrooms: propertyDetails.bedrooms || null,
        bathrooms: propertyDetails.bathrooms || null,
        year_built: propertyDetails.year_built || propertyDetails.yearBuilt || null,
        lot_size: propertyDetails.lot_size || propertyDetails.lotSize || null,
        property_type: propertyDetails.property_type || propertyDetails.propertyType || null,
      };

      // Fix loan_details
      const loanDetails = house.loan_details || {};
      const fixedLoanDetails = {
        loan_amount: loanDetails.loan_amount || loanDetails.loanAmount || null,
        interest_rate: loanDetails.interest_rate || loanDetails.interestRate || null,
        loan_term: loanDetails.loan_term || loanDetails.loanTerm || null,
        monthly_payment: loanDetails.monthly_payment || loanDetails.monthlyPayment || null,
        loan_start_date: loanDetails.loan_start_date || loanDetails.loanStartDate || null,
        lender: loanDetails.lender || null,
        loan_type: loanDetails.loan_type || loanDetails.loanType || null,
      };

      // Fix address
      const address = house.address || {};
      const fixedAddress = {
        street: address.street || null,
        city: address.city || null,
        state: address.state || null,
        zip_code: address.zip_code || address.zipCode || null,
        country: address.country || null,
      };

      // Update the record with fixed property names
      const updateData = {
        purchase_details: fixedPurchaseDetails,
        property_details: fixedPropertyDetails,
        loan_details: fixedLoanDetails,
        address: fixedAddress,
      };

      console.log('Updating with fixed data:', updateData);

      const { data: updatedHouse, error: updateError } = await supabase
        .from('house_details')
        .update(updateData)
        .eq('id', house.id)
        .select();

      if (updateError) {
        console.error(`Error updating house ID ${house.id}:`, updateError);
      } else {
        console.log(`Successfully updated house ID ${house.id}`);
      }
    }

    console.log('Property name fix script completed successfully!');
  } catch (error) {
    console.error('Error in fix-property-names script:', error);
  }
}

// Run the script
fixPropertyNames();

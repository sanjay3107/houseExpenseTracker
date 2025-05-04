import axios from 'axios';
import supabase from '../config/supabase';

import { API_URL as BASE_URL } from '../config/api';

const API_URL = `${BASE_URL}/api`;

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Expense API services
export const expenseService = {
  // Get all expenses
  getAllExpenses: () => api.get('/expenses'),

  // Get expense by ID
  getExpenseById: id => api.get(`/expenses/${id}`),

  // Create new expense
  createExpense: expenseData => {
    // Map frontend property names to backend property names
    const mappedData = {
      ...expenseData,
      payment_method: expenseData.paymentMethod,
    };
    return api.post('/expenses', mappedData);
  },

  // Update expense
  updateExpense: (id, expenseData) => {
    // Map frontend property names to backend property names
    const mappedData = {
      ...expenseData,
      payment_method: expenseData.paymentMethod,
    };
    return api.put(`/expenses/${id}`, mappedData);
  },

  // Delete expense
  deleteExpense: id => api.delete(`/expenses/${id}`),

  // Get expenses by category
  getExpensesByCategory: () => api.get('/expenses/summary/by-category'),

  // Get total expenses
  getTotalExpenses: () => api.get('/expenses/summary/total'),
};

// House details API services
export const houseService = {
  // Get house details
  getHouseDetails: () => api.get('/house-details'),

  // Create house details
  createHouseDetails: houseData => {
    // Format data for the backend
    const formattedData = {
      ...houseData,
      // Ensure nested objects use the correct naming convention
      purchaseDetails: houseData.purchaseDetails,
      propertyDetails: houseData.propertyDetails,
      loanDetails: houseData.loanDetails,
    };
    return api.post('/house-details', formattedData);
  },

  // Update house details
  updateHouseDetails: houseData => {
    // Format data for the backend
    const formattedData = {
      ...houseData,
      // Ensure nested objects use the correct naming convention
      purchaseDetails: houseData.purchaseDetails,
      propertyDetails: houseData.propertyDetails,
      loanDetails: houseData.loanDetails,
    };
    return api.put('/house-details', formattedData);
  },

  // Delete house details
  deleteHouseDetails: () => api.delete('/house-details'),
};

// Loan calculator API services
export const loanService = {
  // Calculate monthly payment
  calculateMonthlyPayment: loanData => api.post('/loan-calculator/monthly-payment', loanData),

  // Calculate amortization schedule
  calculateAmortizationSchedule: loanData =>
    api.post('/loan-calculator/amortization-schedule', loanData),

  // Calculate prepayment impact
  calculatePrepaymentImpact: prepaymentData =>
    api.post('/loan-calculator/prepayment-impact', prepaymentData),
};

// Direct Supabase services (alternative to using the API)
export const supabaseService = {
  // Expenses
  expenses: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    },

    getById: async id => {
      const { data, error } = await supabase.from('expenses').select('*').eq('id', id).single();

      if (error) throw error;
      return data;
    },

    create: async expenseData => {
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            category: expenseData.category,
            amount: expenseData.amount,
            description: expenseData.description,
            date: expenseData.date || new Date().toISOString(),
            payment_method: expenseData.paymentMethod,
            receipt: expenseData.receipt,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    update: async (id, expenseData) => {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          category: expenseData.category,
          amount: expenseData.amount,
          description: expenseData.description,
          date: expenseData.date,
          payment_method: expenseData.paymentMethod,
          receipt: expenseData.receipt,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    delete: async id => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);

      if (error) throw error;
      return { success: true };
    },
  },

  // House details
  houseDetails: {
    get: async () => {
      const { data, error } = await supabase
        .from('house_details')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) return null;

      // Transform the response to match the expected format in the frontend
      return {
        ...data,
        purchaseDetails: data.purchase_details,
        propertyDetails: data.property_details,
        loanDetails: data.loan_details,
      };
    },

    create: async houseData => {
      const { data, error } = await supabase
        .from('house_details')
        .insert([
          {
            address: houseData.address,
            purchase_details: houseData.purchaseDetails,
            property_details: houseData.propertyDetails,
            loan_details: houseData.loanDetails,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Transform the response to match the expected format in the frontend
      return {
        ...data,
        purchaseDetails: data.purchase_details,
        propertyDetails: data.property_details,
        loanDetails: data.loan_details,
      };
    },

    update: async houseData => {
      // Get the existing house details to get the ID
      const { data: existingData, error: checkError } = await supabase
        .from('house_details')
        .select('id')
        .limit(1)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (!existingData) {
        throw new Error('House details not found');
      }

      // Update the house details
      const updateData = {};

      if (houseData.address) updateData.address = houseData.address;
      if (houseData.purchaseDetails) updateData.purchase_details = houseData.purchaseDetails;
      if (houseData.propertyDetails) updateData.property_details = houseData.propertyDetails;
      if (houseData.loanDetails) updateData.loan_details = houseData.loanDetails;

      const { data, error } = await supabase
        .from('house_details')
        .update(updateData)
        .eq('id', existingData.id)
        .select()
        .single();

      if (error) throw error;

      // Transform the response to match the expected format in the frontend
      return {
        ...data,
        purchaseDetails: data.purchase_details,
        propertyDetails: data.property_details,
        loanDetails: data.loan_details,
      };
    },

    delete: async () => {
      // Get the existing house details to get the ID
      const { data: existingData, error: checkError } = await supabase
        .from('house_details')
        .select('id')
        .limit(1)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (!existingData) {
        throw new Error('House details not found');
      }

      const { error } = await supabase.from('house_details').delete().eq('id', existingData.id);

      if (error) throw error;
      return { success: true };
    },
  },
};

export default {
  expenseService,
  houseService,
  loanService,
  supabaseService,
};

/**
 * Utility functions for formatting currency in Indian format (lakhs and crores)
 */

/**
 * Format a number in Indian currency format (lakhs and crores)
 * @param {number} amount - The amount to format
 * @param {boolean} showCurrency - Whether to show the ₹ symbol
 * @param {boolean} showWords - Whether to show the amount in words (lakhs/crores)
 * @returns {string} The formatted amount
 */
export const formatIndianCurrency = (amount, showCurrency = true, showWords = true) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'N/A';
  }
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format the number in Indian format (commas at thousands, lakhs, crores)
  const formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
  
  const formattedAmount = formatter.format(numAmount);
  
  // Add currency symbol if requested
  const withCurrency = showCurrency ? `₹${formattedAmount}` : formattedAmount;
  
  // Add words (lakhs/crores) if requested and amount is large enough
  if (showWords && numAmount >= 1000) {
    if (numAmount >= 10000000) {
      // For crores (1 crore = 10,000,000)
      const crores = numAmount / 10000000;
      return `${withCurrency} (${crores.toFixed(2)} Cr)`;
    } else if (numAmount >= 100000) {
      // For lakhs (1 lakh = 100,000)
      const lakhs = numAmount / 100000;
      return `${withCurrency} (${lakhs.toFixed(2)} L)`;
    } else if (numAmount >= 1000) {
      // For thousands
      const thousands = numAmount / 1000;
      return `${withCurrency} (${thousands.toFixed(2)} K)`;
    }
  }
  
  return withCurrency;
};

/**
 * Convert input like "60L" or "1.5Cr" to absolute number
 * @param {string} value - The input value (e.g., "60L", "1.5Cr", "1000000")
 * @returns {number} The absolute number
 */
export const parseIndianAmount = (value) => {
  if (!value) return 0;
  
  const str = value.toString().trim().toUpperCase();
  
  // Handle crore amounts (e.g., "1.5CR" or "1.5C")
  if (str.endsWith('CR') || str.endsWith('C')) {
    const num = parseFloat(str.replace(/CR|C/i, ''));
    return num * 10000000; // 1 crore = 10000000
  }
  
  // Handle lakh amounts (e.g., "60L")
  if (str.endsWith('L')) {
    const num = parseFloat(str.replace(/L/i, ''));
    return num * 100000; // 1 lakh = 100000
  }
  
  // Handle numeric input
  return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
};

export default {
  formatIndianCurrency,
  parseIndianAmount
};

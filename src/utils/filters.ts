import { ExpenseData } from '../screens/ReviewScreen';
import { getAllCategories } from './categoryIcons';

/**
 * Filter expenses by a specific category
 */
export const filterByCategory = (expenses: ExpenseData[], category: string): ExpenseData[] => {
  if (category === 'All') return expenses;
  return expenses.filter((expense) => expense.category === category);
};

/**
 * Filter expenses by date range
 */
export const filterByDateRange = (
  expenses: ExpenseData[],
  startDate: Date,
  endDate: Date
): ExpenseData[] => {
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
};

/**
 * Get summary stats for a filtered list of expenses
 */
export const getFilteredStats = (expenses: ExpenseData[]): {
  total: number;
  count: number;
  average: number;
  byCategory: Record<string, number>;
} => {
  const total = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
  const count = expenses.length;
  const average = count > 0 ? total / count : 0;

  const byCategory: Record<string, number> = {};
  expenses.forEach((expense) => {
    const category = expense.category || 'Other';
    byCategory[category] = (byCategory[category] || 0) + (parseFloat(expense.amount) || 0);
  });

  return { total, count, average, byCategory };
};

/**
 * Search expenses by merchant name
 */
export const searchByMerchant = (expenses: ExpenseData[], query: string): ExpenseData[] => {
  if (!query.trim()) return expenses;
  const lowerQuery = query.toLowerCase();
  return expenses.filter((expense) =>
    expense.merchant.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Sort expenses by date (newest first by default)
 */
export const sortByDate = (
  expenses: ExpenseData[],
  ascending: boolean = false
): ExpenseData[] => {
  return [...expenses].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Sort expenses by amount
 */
export const sortByAmount = (
  expenses: ExpenseData[],
  ascending: boolean = false
): ExpenseData[] => {
  return [...expenses].sort((a, b) => {
    const amountA = parseFloat(a.amount) || 0;
    const amountB = parseFloat(b.amount) || 0;
    return ascending ? amountA - amountB : amountB - amountA;
  });
};

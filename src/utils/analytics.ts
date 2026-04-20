import { ExpenseData } from '../screens/ReviewScreen';
import { getExpensesByCategory } from './expenseCalculations';

export interface CategoryAnalytics {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface TimeAnalytics {
  period: string;
  total: number;
}

/**
 * Get spending trends by category with percentages
 */
export const getSpendingTrends = (expenses: ExpenseData[]): CategoryAnalytics[] => {
  if (expenses.length === 0) return [];

  const byCategory = getExpensesByCategory(expenses);
  const totalSpent = Object.values(byCategory).reduce((sum, cat) => sum + cat.total, 0);

  return Object.entries(byCategory)
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: totalSpent > 0 ? Math.round((data.total / totalSpent) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
};

/**
 * Get daily spending for the last 7 days
 */
export const getLast7DaysSpending = (expenses: ExpenseData[]): TimeAnalytics[] => {
  const days: { [key: string]: number } = {};

  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    days[dateStr] = 0;
  }

  // Accumulate expenses
  expenses.forEach((expense) => {
    const expenseDate = new Date(expense.date);
    const dateStr = expenseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (dateStr in days) {
      days[dateStr] += parseFloat(expense.amount);
    }
  });

  return Object.entries(days).map(([period, total]) => ({
    period,
    total: Math.round(total * 100) / 100,
  }));
};

/**
 * Get average daily spending
 */
export const getAverageDailySpending = (expenses: ExpenseData[]): number => {
  if (expenses.length === 0) return 0;

  const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const daysWithExpenses = new Set(
    expenses.map((exp) => new Date(exp.date).toDateString())
  ).size;

  return daysWithExpenses > 0 ? Math.round((totalSpent / daysWithExpenses) * 100) / 100 : 0;
};

/**
 * Get highest spending day in the last 7 days
 */
export const getHighestSpendingDay = (expenses: ExpenseData[]): TimeAnalytics | null => {
  const last7Days = getLast7DaysSpending(expenses);
  if (last7Days.length === 0) return null;

  return last7Days.reduce((max, day) => (day.total > max.total ? day : max));
};

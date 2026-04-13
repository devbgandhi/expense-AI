import { ExpenseData } from '../screens/ReviewScreen';

// Calculate total spent across all expenses
export const calculateTotalExpenses = (expenses: ExpenseData[]): number => {
  return expenses.reduce((total, expense) => {
    const amount = parseFloat(expense.amount) || 0;
    return total + amount;
  }, 0);
};

// Calculate total spent in the current month
export const calculateMonthlyExpenses = (expenses: ExpenseData[]): number => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return expenses.reduce((total, expense) => {
    const expenseDate = new Date(expense.date);
    if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
      const amount = parseFloat(expense.amount) || 0;
      return total + amount;
    }
    return total;
  }, 0);
};

// Get expenses grouped by category with totals
export const getExpensesByCategory = (
  expenses: ExpenseData[]
): Record<string, { count: number; total: number }> => {
  const categoryMap: Record<string, { count: number; total: number }> = {};

  expenses.forEach((expense) => {
    const category = expense.category || 'Other';
    const amount = parseFloat(expense.amount) || 0;

    if (!categoryMap[category]) {
      categoryMap[category] = { count: 0, total: 0 };
    }

    categoryMap[category].count += 1;
    categoryMap[category].total += amount;
  });

  return categoryMap;
};

// Get the most common category
export const getMostCommonCategory = (expenses: ExpenseData[]): string | null => {
  if (expenses.length === 0) return null;

  const categoryMap: Record<string, number> = {};

  expenses.forEach((expense) => {
    const category = expense.category || 'Other';
    categoryMap[category] = (categoryMap[category] || 0) + 1;
  });

  let maxCategory = null;
  let maxCount = 0;

  Object.entries(categoryMap).forEach(([category, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxCategory = category;
    }
  });

  return maxCategory;
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

//Format Data
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

//Range
export const getExpensesInDateRange = (
  expenses: ExpenseData[],
  startDate: Date,
  endDate: Date
): ExpenseData[] => {
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
};

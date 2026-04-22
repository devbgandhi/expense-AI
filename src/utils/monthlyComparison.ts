import { ExpenseData } from '../screens/ReviewScreen';

export interface MonthlyData {
  month: string;
  year: number;
  total: number;
  count: number;
  change: number; // percentage change from previous month
  trend: 'up' | 'down' | 'flat';
}

/**
 * Get spending data for the last 12 months
 */
export const getLast12MonthsData = (expenses: ExpenseData[]): MonthlyData[] => {
  const monthlyMap = new Map<string, { total: number; count: number }>();

  // Initialize last 12 months
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push(key);
    monthlyMap.set(key, { total: 0, count: 0 });
  }

  // Accumulate expenses
  expenses.forEach((expense) => {
    const expenseDate = new Date(expense.date);
    const key = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyMap.has(key)) {
      const data = monthlyMap.get(key)!;
      data.total += parseFloat(expense.amount);
      data.count += 1;
    }
  });

  // Convert to array with month names and trend calculation
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const result: MonthlyData[] = [];
  let previousTotal = 0;

  months.forEach((key) => {
    const [yearStr, monthStr] = key.split('-');
    const year = parseInt(yearStr);
    const monthIndex = parseInt(monthStr) - 1;
    const data = monthlyMap.get(key)!;

    const change = previousTotal > 0 ? ((data.total - previousTotal) / previousTotal) * 100 : 0;
    const trend: 'up' | 'down' | 'flat' =
      change > 5 ? 'up' : change < -5 ? 'down' : 'flat';

    result.push({
      month: monthNames[monthIndex],
      year,
      total: Math.round(data.total * 100) / 100,
      count: data.count,
      change: Math.round(change * 10) / 10,
      trend,
    });

    previousTotal = data.total;
  });

  return result;
};

/**
 * Get current month vs previous month comparison
 */
export const getCurrentVsPreviousMonth = (expenses: ExpenseData[]): { current: MonthlyData; previous: MonthlyData; percentageChange: number } | null => {
  const data = getLast12MonthsData(expenses);
  if (data.length < 2) return null;

  const current = data[data.length - 1];
  const previous = data[data.length - 2];

  const percentageChange = previous.total > 0 ? ((current.total - previous.total) / previous.total) * 100 : 0;

  return {
    current,
    previous,
    percentageChange: Math.round(percentageChange * 10) / 10,
  };
};

/**
 * Get highest spending month in the last 12 months
 */
export const getHighestSpendingMonth = (expenses: ExpenseData[]): MonthlyData | null => {
  const data = getLast12MonthsData(expenses);
  if (data.length === 0) return null;
  return data.reduce((max, month) => (month.total > max.total ? month : max));
};

/**
 * Get average monthly spending
 */
export const getAverageMonthlySpending = (expenses: ExpenseData[]): number => {
  const data = getLast12MonthsData(expenses);
  if (data.length === 0) return 0;
  const total = data.reduce((sum, month) => sum + month.total, 0);
  const monthsWithExpenses = data.filter((m) => m.count > 0).length;
  return monthsWithExpenses > 0 ? Math.round((total / monthsWithExpenses) * 100) / 100 : 0;
};

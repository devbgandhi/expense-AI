import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExpenseData } from '../screens/ReviewScreen';

const EXPENSES_STORAGE_KEY = 'expense_ai_expenses';

/**
 * Save all expenses to device storage
 */
export const saveExpenses = async (expenses: ExpenseData[]): Promise<void> => {
  try {
    const jsonString = JSON.stringify(expenses);
    await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, jsonString);
  } catch (error) {
    console.error('Error saving expenses to storage:', error);
    throw error;
  }
};

/**
 * Load all expenses from device storage
 */
export const loadExpenses = async (): Promise<ExpenseData[]> => {
  try {
    const jsonString = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
    if (jsonString === null) {
      return [];
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error loading expenses from storage:', error);
    return [];
  }
};

/**
 * Clear all expenses from storage
 */
export const clearExpenses = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(EXPENSES_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing expenses from storage:', error);
    throw error;
  }
};

/**
 * Delete a specific expense by index
 */
export const deleteExpense = async (
  expenses: ExpenseData[],
  indexToDelete: number
): Promise<ExpenseData[]> => {
  try {
    const updatedExpenses = expenses.filter((_, index) => index !== indexToDelete);
    await saveExpenses(updatedExpenses);
    return updatedExpenses;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

/**
 * Update an expense at a specific index
 */
export const updateExpense = async (
  expenses: ExpenseData[],
  indexToUpdate: number,
  updatedExpense: ExpenseData
): Promise<ExpenseData[]> => {
  try {
    const updatedExpenses = [...expenses];
    updatedExpenses[indexToUpdate] = updatedExpense;
    await saveExpenses(updatedExpenses);
    return updatedExpenses;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

/**
 * Add a single expense to storage
 */
export const addExpense = async (
  expense: ExpenseData,
  existingExpenses: ExpenseData[]
): Promise<ExpenseData[]> => {
  try {
    const updatedExpenses = [expense, ...existingExpenses];
    await saveExpenses(updatedExpenses);
    return updatedExpenses;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

/**
 * Get storage usage information
 */
export const getStorageInfo = async (): Promise<{
  totalExpenses: number;
  storageSize: string;
} | null> => {
  try {
    const jsonString = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
    if (jsonString === null) {
      return { totalExpenses: 0, storageSize: '0 KB' };
    }

    const expenses: ExpenseData[] = JSON.parse(jsonString);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);

    return {
      totalExpenses: expenses.length,
      storageSize: `${sizeInKB} KB`,
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
};

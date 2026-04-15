import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { CameraScreen } from './src/screens/CameraScreen';
import { ReviewScreen, ExpenseData } from './src/screens/ReviewScreen';
import { loadExpenses, saveExpenses } from './src/utils/storage';

type AppScreen = 'home' | 'camera' | 'review';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseData | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Load expenses from storage when app starts
  useEffect(() => {
    const initializeExpenses = async () => {
      try {
        const loadedExpenses = await loadExpenses();
        setExpenses(loadedExpenses);
      } catch (error) {
        console.error('Failed to load expenses on startup:', error);
      }
    };

    initializeExpenses();
  }, []);

  const handlePhotoCaptured = (photoUri: string) => {
    setCapturedImageUri(photoUri);
    setCurrentScreen('review');
  };

  const handleExpenseConfirm = async (expenseData: ExpenseData) => {
    setIsProcessing(true);
    try {
      // TODO: Upload to backend API here
      // const response = await fetch('http://your-backend/api/expenses', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(expenseData),
      // });
      // const result = await response.json();

      let updatedExpenses: ExpenseData[];

      // Check if we're editing or creating new
      if (editingIndex !== null && editingIndex >= 0) {
        // Update existing expense
        updatedExpenses = [...expenses];
        updatedExpenses[editingIndex] = expenseData;
        setEditingExpense(null);
        setEditingIndex(null);
      } else {
        // Add new expense
        updatedExpenses = [expenseData, ...expenses];
        setCapturedImageUri(null);
      }

      setExpenses(updatedExpenses);
      await saveExpenses(updatedExpenses);

      setCurrentScreen('home');
    } catch (error) {
      console.error('Error saving expense:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReviewCancel = () => {
    setCapturedImageUri(null);
    setEditingExpense(null);
    setEditingIndex(null);
    setCurrentScreen('home');
  };

  const handleDeleteExpense = async (index: number) => {
    try {
      const updatedExpenses = expenses.filter((_, i) => i !== index);
      setExpenses(updatedExpenses);
      await saveExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEditExpense = (expense: ExpenseData, index: number) => {
    // Set up editing state and navigate to review screen
    setEditingExpense(expense);
    setEditingIndex(index);
    setCapturedImageUri(expense.imageUri);
    setCurrentScreen('review');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {currentScreen === 'home' && (
        <HomeScreen
          onCameraPress={() => setCurrentScreen('camera')}
          recentExpenses={expenses.slice(0, 5)}
          onDeleteExpense={handleDeleteExpense}
          onEditExpense={handleEditExpense}
        />
      )}

      {currentScreen === 'camera' && (
        <CameraScreen onPhotoCaptured={handlePhotoCaptured} />
      )}

      {currentScreen === 'review' && capturedImageUri && (
        <ReviewScreen
          imageUri={capturedImageUri}
          onConfirm={handleExpenseConfirm}
          onCancel={handleReviewCancel}
          isProcessing={isProcessing}
          existingExpense={editingExpense || undefined}
          isEditing={editingIndex !== null}
        />
      )}
    </SafeAreaView>
  );
}

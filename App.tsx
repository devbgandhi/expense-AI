import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { CameraScreen } from './src/screens/CameraScreen';
import { ReviewScreen, ExpenseData } from './src/screens/ReviewScreen';

type AppScreen = 'home' | 'camera' | 'review';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

      // For now, just add to local state
      setExpenses([expenseData, ...expenses]);
      setCurrentScreen('home');
      setCapturedImageUri(null);
    } catch (error) {
      console.error('Error saving expense:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReviewCancel = () => {
    setCapturedImageUri(null);
    setCurrentScreen('home');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {currentScreen === 'home' && (
        <HomeScreen
          onCameraPress={() => setCurrentScreen('camera')}
          recentExpenses={expenses.slice(0, 5)}
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
        />
      )}
    </SafeAreaView>
  );
}

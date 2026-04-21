import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getCategoryIcon, getCategoryColor } from '../utils/categoryIcons';

interface ReviewScreenProps {
  imageUri: string;
  onConfirm: (data: ExpenseData) => void;
  onCancel: () => void;
  isProcessing?: boolean;
  existingExpense?: ExpenseData;
  isEditing?: boolean;
}

export interface ExpenseData {
  merchant: string;
  amount: string;
  date: string;
  category: string;
  imageUri: string;
}

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Other'];

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  imageUri,
  onConfirm,
  onCancel,
  isProcessing = false,
  existingExpense,
  isEditing = false,
}) => {
  const [merchant, setMerchant] = useState(existingExpense?.merchant || '');
  const [amount, setAmount] = useState(existingExpense?.amount || '');
  const [date, setDate] = useState(
    existingExpense?.date || new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState(existingExpense?.category || 'Food');

  const handleConfirm = () => {
    if (!merchant.trim()) {
      Alert.alert('Missing Information', 'Please enter merchant name');
      return;
    }
    if (!amount.trim()) {
      Alert.alert('Missing Information', 'Please enter amount');
      return;
    }

    const expenseData: ExpenseData = {
      merchant: merchant.trim(),
      amount: amount.trim(),
      date,
      category,
      imageUri,
    };

    onConfirm(expenseData);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Receipt Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.receiptImage}
        />
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>{isEditing ? 'Edit Expense' : 'Receipt Details'}</Text>

        {/* Merchant Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Merchant / Store Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Starbucks, Walmart"
            placeholderTextColor="#bdc3c7"
            value={merchant}
            onChangeText={setMerchant}
            editable={!isProcessing}
          />
        </View>

        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 25.50"
            placeholderTextColor="#bdc3c7"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            editable={!isProcessing}
          />
        </View>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#bdc3c7"
            value={date}
            onChangeText={setDate}
            editable={!isProcessing}
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive,
                  { backgroundColor: getCategoryColor(cat), opacity: category === cat ? 1 : 0.6 },
                ]}
                onPress={() => setCategory(cat)}
                disabled={isProcessing}
              >
                <Text style={styles.categoryButtonIcon}>{getCategoryIcon(cat)}</Text>
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === cat && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={isProcessing}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.confirmButton, isProcessing && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>
              {isEditing ? 'Update Expense' : 'Save Expense'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  imageContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  receiptImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: '#1a1f2e',
    borderWidth: 1,
    borderColor: '#2a3141',
  },
  formSection: {
    backgroundColor: '#1a1f2e',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a3141',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#252d3d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#3b4556',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#252d3d',
    borderWidth: 1,
    borderColor: '#3b4556',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  categoryButtonIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


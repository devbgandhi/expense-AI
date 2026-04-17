import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { ExpenseData } from './ReviewScreen';
import {
  calculateTotalExpenses,
  calculateMonthlyExpenses,
  formatCurrency,
  formatDate,
} from '../utils/expenseCalculations';
import { getCategoryIcon, getCategoryColor } from '../utils/categoryIcons';

interface HomeScreenProps {
  onCameraPress: () => void;
  recentExpenses: ExpenseData[];
  onDeleteExpense?: (index: number) => void;
  onEditExpense?: (expense: ExpenseData, index: number) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onCameraPress,
  recentExpenses,
  onDeleteExpense,
  onEditExpense,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Calculate stats from expenses
  const totalExpenses = calculateTotalExpenses(recentExpenses);
  const monthlyExpenses = calculateMonthlyExpenses(recentExpenses);

  const handleDeletePress = (index: number, merchantName: string) => {
    Alert.alert(
      'Delete Expense?',
      `Are you sure you want to delete the expense from ${merchantName}?`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            onDeleteExpense?.(index);
            setExpandedIndex(null);
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expense AI</Text>
        <Text style={styles.headerSubtitle}>Track your spending smarter</Text>
      </View>

      {/* Main CTA Button */}
      <TouchableOpacity
        style={styles.captureCard}
        onPress={onCameraPress}
      >
        <View style={styles.cameraIcon}>
          <Text style={styles.cameraIconText}>📷</Text>
        </View>
        <Text style={styles.captureCardText}>Capture Receipt</Text>
        <Text style={styles.captureCardSubtext}>
          Scan a receipt to add an expense
        </Text>
      </TouchableOpacity>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Expenses</Text>
          <Text style={styles.statValue}>{formatCurrency(totalExpenses)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={styles.statValue}>{formatCurrency(monthlyExpenses)}</Text>
        </View>
      </View>

      {/* Recent Expenses */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Expenses</Text>
        {recentExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No expenses yet. Start by capturing a receipt!
            </Text>
          </View>
        ) : (
          recentExpenses.map((expense, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.expenseItem}
                onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: getCategoryColor(expense.category) }]}>
                  <Text style={styles.categoryIcon}>{getCategoryIcon(expense.category)}</Text>
                </View>
                <View style={styles.expenseInfo}>
                  <Text style={styles.merchantName}>{expense.merchant}</Text>
                  <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
                </View>
                <Text style={styles.expenseAmount}>
                  {formatCurrency(parseFloat(expense.amount))}
                </Text>
              </TouchableOpacity>

              {/* Expanded Actions */}
              {expandedIndex === index && (
                <View style={styles.expenseActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => onEditExpense?.(expense, index)}
                  >
                    <Text style={styles.actionButtonText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeletePress(index, expense.merchant)}
                  >
                    <Text style={styles.actionButtonText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3498db',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ecf0f1',
    marginTop: 4,
  },
  captureCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraIcon: {
    marginBottom: 12,
  },
  cameraIconText: {
    fontSize: 40,
  },
  captureCardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  captureCardSubtext: {
    fontSize: 13,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498db',
  },
  recentSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  expenseItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  expenseInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  expenseDate: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#555',
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  expenseActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: '#f9f9f9',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

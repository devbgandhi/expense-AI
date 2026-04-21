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
import { filterByCategory } from '../utils/filters';
import { getSpendingTrends, getAverageDailySpending, getHighestSpendingDay } from '../utils/analytics';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter expenses by category
  const filteredExpenses = filterByCategory(recentExpenses, selectedCategory);

  // Calculate stats from filtered expenses
  const totalExpenses = calculateTotalExpenses(filteredExpenses);
  const monthlyExpenses = calculateMonthlyExpenses(filteredExpenses);

  // Get analytics data
  const spendingTrends = getSpendingTrends(recentExpenses);
  const averageDailySpending = getAverageDailySpending(recentExpenses);
  const highestSpendingDay = getHighestSpendingDay(recentExpenses);

  const categories = ['All', 'Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Other'];

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
        <Text style={styles.headerTitle}>Expenses</Text>
        <Text style={styles.headerSubtitle}>Financial Overview</Text>
      </View>

      {/* Category Filter */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main CTA Button */}
      <TouchableOpacity
        style={styles.captureCard}
        onPress={onCameraPress}
      >
        <View style={styles.cameraIconWrapper}>
          <Text style={styles.cameraIconPlus}>+</Text>
        </View>
        <Text style={styles.captureCardText}>Add Expense</Text>
        <Text style={styles.captureCardSubtext}>
          Scan receipt or add manually
        </Text>
      </TouchableOpacity>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIconNumber}>$</Text>
          </View>
          <Text style={styles.statLabel}>Total Expenses</Text>
          <Text style={styles.statValue}>{formatCurrency(totalExpenses)}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIconNumber}>�</Text>
          </View>
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={styles.statValue}>{formatCurrency(monthlyExpenses)}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIconNumber}>⏱</Text>
          </View>
          <Text style={styles.statLabel}>Daily Avg</Text>
          <Text style={styles.statValue}>{formatCurrency(averageDailySpending)}</Text>
        </View>
      </View>

      {/* Top Categories Section */}
      {spendingTrends.length > 0 && (
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          <View style={styles.categoryAnalytics}>
            {spendingTrends.slice(0, 3).map((trend, index) => (
              <View key={index} style={styles.categoryTrendItem}>
                <View style={styles.categoryTrendHeader}>
                  <View
                    style={[
                      styles.categoryBadgeIcon,
                      { backgroundColor: getCategoryColor(trend.category) },
                    ]}
                  >
                    <Text style={styles.categoryBadgeText}>{trend.category.charAt(0)}</Text>
                  </View>
                  <Text style={styles.categoryTrendName}>{trend.category}</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(trend.percentage, 100)}%`,
                        backgroundColor: getCategoryColor(trend.category),
                      },
                    ]}
                  />
                </View>
                <View style={styles.categoryTrendFooter}>
                  <Text style={styles.categoryTrendAmount}>{formatCurrency(trend.total)}</Text>
                  <Text style={styles.categoryTrendPercent}>{trend.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Expenses */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'All' ? 'Recent Expenses' : `${selectedCategory} Expenses`}
        </Text>
        {recentExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No expenses yet. Start by capturing a receipt!
            </Text>
          </View>
        ) : filteredExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No expenses in this category yet.
            </Text>
          </View>
        ) : (
          filteredExpenses.map((expense, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.expenseItem}
                onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: getCategoryColor(expense.category) }]}>
                  <Text style={styles.categoryInitial}>{expense.category.charAt(0)}</Text>
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
    backgroundColor: '#0f1419',
  },
  header: {
    backgroundColor: '#1a1f2e',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3141',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a0aec0',
    marginTop: 6,
  },
  captureCard: {
    backgroundColor: '#1a1f2e',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#2a3141',
  },
  cameraIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cameraIconPlus: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '600',
  },
  captureCardText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  captureCardSubtext: {
    fontSize: 13,
    color: '#a0aec0',
    textAlign: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 0,
    marginBottom: 24,
    zIndex: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#2a3141',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#a0aec0',
    marginBottom: 6,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  recentSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  expenseItem: {
    backgroundColor: '#1a1f2e',
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
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  expenseActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: '#252d3d',
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
    color: '#a0aec0',
    fontSize: 14,
    fontStyle: 'italic',
  },
  categoriesSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  categoryAnalytics: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2a3141',
  },
  categoryTrendItem: {
    gap: 8,
  },
  categoryTrendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTrendName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    flex: 1,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#2a3141',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  categoryTrendFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTrendAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  categoryTrendPercent: {
    fontSize: 12,
    color: '#a0aec0',
    fontWeight: '500',
  },
  categoryBadgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  categoryInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  filterSection: {
    paddingHorizontal: 12,
    marginBottom: 16,
    marginTop: 0,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#2a3141',
    borderWidth: 1,
    borderColor: '#3b4556',
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
});


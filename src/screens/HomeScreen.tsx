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
        <Text style={styles.headerTitle}>Expense AI</Text>
        <Text style={styles.headerSubtitle}>Track your spending smarter</Text>
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
                {category === 'All' ? '📊 All' : `${getCategoryIcon(category)} ${category}`}
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
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>💰</Text>
          </View>
          <Text style={styles.statLabel}>Total Expenses</Text>
          <Text style={styles.statValue}>{formatCurrency(totalExpenses)}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>📅</Text>
          </View>
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={styles.statValue}>{formatCurrency(monthlyExpenses)}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>📊</Text>
          </View>
          <Text style={styles.statLabel}>Daily Average</Text>
          <Text style={styles.statValue}>{formatCurrency(averageDailySpending)}</Text>
        </View>
      </View>

      {/* Top Categories Section */}
      {spendingTrends.length > 0 && (
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Top Spending Categories</Text>
          <View style={styles.categoryAnalytics}>
            {spendingTrends.slice(0, 3).map((trend, index) => (
              <View key={index} style={styles.categoryTrendItem}>
                <View style={styles.categoryTrendHeader}>
                  <Text style={styles.categoryTrendIcon}>
                    {getCategoryIcon(trend.category)}
                  </Text>
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
    backgroundColor: '#2c3e50',
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#ecf0f1',
    marginTop: 4,
  },
  captureCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#ecf0f1',
  },
  cameraIcon: {
    marginBottom: 12,
  },
  cameraIconText: {
    fontSize: 48,
  },
  captureCardText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
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
    marginTop: -20,
    marginBottom: 24,
    zIndex: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 13,
    color: '#95a5a6',
    marginBottom: 6,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2c3e50',
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
  filterSection: {
    paddingHorizontal: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#ecf0f1',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  categoryButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  categoriesSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  categoryAnalytics: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  categoryTrendItem: {
    gap: 8,
  },
  categoryTrendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTrendIcon: {
    fontSize: 20,
  },
  categoryTrendName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryTrendFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTrendAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  categoryTrendPercent: {
    fontSize: 12,
    color: '#95a5a6',
    fontWeight: '500',
  },
});


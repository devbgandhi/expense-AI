/**
 * Category emojis and colors for visual appeal
 */

export const CATEGORY_ICONS: Record<string, string> = {
  'Food': '🍽️',
  'Transport': '🚗',
  'Shopping': '🛍️',
  'Utilities': '💡',
  'Entertainment': '🎬',
  'Other': '📦',
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Food': '#FF6B6B',
  'Transport': '#4ECDC4',
  'Shopping': '#FFE66D',
  'Utilities': '#95E1D3',
  'Entertainment': '#C7CEEA',
  'Other': '#B8B8D1',
};

/**
 * Get emoji icon for a category
 */
export const getCategoryIcon = (category: string): string => {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS['Other'];
};

/**
 * Get color for a category
 */
export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
};

/**
 * Get all available categories
 */
export const getAllCategories = (): string[] => {
  return Object.keys(CATEGORY_ICONS);
};

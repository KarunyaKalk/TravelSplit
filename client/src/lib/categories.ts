import { UtensilsCrossed, Car, Hotel, Music, ShoppingCart } from "lucide-react";

export const EXPENSE_CATEGORIES = {
  food: {
    label: "Food & Dining",
    icon: UtensilsCrossed,
    color: "text-orange-500",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  transport: {
    label: "Transport",
    icon: Car,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  accommodation: {
    label: "Accommodation",
    icon: Hotel,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  entertainment: {
    label: "Entertainment",
    icon: Music,
    color: "text-pink-500",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
  },
  other: {
    label: "Other",
    icon: ShoppingCart,
    color: "text-gray-500",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
  },
} as const;

export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES;

export function getCategoryDetails(category: string) {
  return EXPENSE_CATEGORIES[category as ExpenseCategory] || EXPENSE_CATEGORIES.other;
}

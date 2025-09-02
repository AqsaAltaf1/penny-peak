export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  color: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AppState {
  auth: AuthState;
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
}

export interface TransactionStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

// Transaction Categories
export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Groceries",
  "Other"
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Business",
  "Gift",
  "Bonus",
  "Other"
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type Category = ExpenseCategory | IncomeCategory;

// Category Colors for Charts
export const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#ef4444",
  "Transportation": "#f97316", 
  "Shopping": "#eab308",
  "Entertainment": "#22c55e",
  "Bills & Utilities": "#3b82f6",
  "Healthcare": "#a855f7",
  "Education": "#06b6d4",
  "Travel": "#ec4899",
  "Groceries": "#84cc16",
  "Other": "#64748b",
  "Salary": "#22c55e",
  "Freelance": "#3b82f6",
  "Investment": "#a855f7",
  "Business": "#f59e0b",
  "Gift": "#ec4899",
  "Bonus": "#10b981"
};

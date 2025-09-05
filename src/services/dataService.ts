import { Transaction, SavingsGoal, User, TransactionStats, CategoryData } from "@/types";
import { CATEGORY_COLORS } from "@/types";

const STORAGE_KEYS = {
  USER: 'expense_tracker_user',
  TRANSACTIONS: 'expense_tracker_transactions',
  SAVINGS_GOALS: 'expense_tracker_savings_goals',
} as const;

// Local Storage Utilities
const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  remove: (key: string): void => {
    localStorage.removeItem(key);
  }
};

// User Management
export const userService = {
  getCurrentUser: (): User | null => {
    return storage.get<User>(STORAGE_KEYS.USER);
  },

  setCurrentUser: (user: User): void => {
    storage.set(STORAGE_KEYS.USER, user);
  },

  clearCurrentUser: (): void => {
    storage.remove(STORAGE_KEYS.USER);
  },

  createUser: (email: string, name: string, password: string): User => {
    const user: User = {
      id: generateId(),
      email,
      name,
      createdAt: new Date().toISOString(),
    };
    
    // In a real app, you'd hash the password and send to backend
    // For now, we'll just store the user
    userService.setCurrentUser(user);
    return user;
  },

  loginUser: (email: string, password: string): User | null => {
    // In a real app, you'd validate credentials with backend
    // For demo, create a user if they don't exist
    const existingUser = userService.getCurrentUser();
    if (existingUser && existingUser.email === email) {
      return existingUser;
    }
    
    // Create new user for demo
    return userService.createUser(email, email.split('@')[0], password);
  }
};

// Transaction Management
export const transactionService = {
  getTransactions: (): Transaction[] => {
    return storage.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
  },

  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>): Transaction => {
    const user = userService.getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    const transactions = transactionService.getTransactions();
    transactions.push(newTransaction);
    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions);
    
    return newTransaction;
  },

  updateTransaction: (id: string, updates: Partial<Transaction>): Transaction | null => {
    const transactions = transactionService.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) return null;
    
    transactions[index] = { ...transactions[index], ...updates };
    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions);
    
    return transactions[index];
  },

  deleteTransaction: (id: string): boolean => {
    const transactions = transactionService.getTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== id);
    
    if (filteredTransactions.length === transactions.length) return false;
    
    storage.set(STORAGE_KEYS.TRANSACTIONS, filteredTransactions);
    return true;
  },

  getTransactionsByDateRange: (startDate: string, endDate: string): Transaction[] => {
    const transactions = transactionService.getTransactions();
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  },

  getTransactionsByMonth: (year: number, month: number): Transaction[] => {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    return transactionService.getTransactionsByDateRange(startDate, endDate);
  }
};

// Savings Goals Management
export const savingsGoalService = {
  getSavingsGoals: (): SavingsGoal[] => {
    return storage.get<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS) || [];
  },

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt'>): SavingsGoal => {
    const user = userService.getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    const newGoal: SavingsGoal = {
      ...goal,
      id: generateId(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    const goals = savingsGoalService.getSavingsGoals();
    goals.push(newGoal);
    storage.set(STORAGE_KEYS.SAVINGS_GOALS, goals);
    
    return newGoal;
  },

  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>): SavingsGoal | null => {
    const goals = savingsGoalService.getSavingsGoals();
    const index = goals.findIndex(g => g.id === id);
    
    if (index === -1) return null;
    
    goals[index] = { ...goals[index], ...updates };
    storage.set(STORAGE_KEYS.SAVINGS_GOALS, goals);
    
    return goals[index];
  },

  deleteSavingsGoal: (id: string): boolean => {
    const goals = savingsGoalService.getSavingsGoals();
    const filteredGoals = goals.filter(g => g.id !== id);
    
    if (filteredGoals.length === goals.length) return false;
    
    storage.set(STORAGE_KEYS.SAVINGS_GOALS, filteredGoals);
    return true;
  }
};

// Analytics and Statistics
export const analyticsService = {
  calculateStats: (): TransactionStats => {
    const transactions = transactionService.getTransactions();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const monthlyTransactions = transactionService.getTransactionsByMonth(currentYear, currentMonth);
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalBalance = totalIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    
    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      totalIncome,
      totalExpenses
    };
  },

  getCategoryData: (type: 'income' | 'expense' = 'expense'): CategoryData[] => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const monthlyTransactions = transactionService.getTransactionsByMonth(currentYear, currentMonth)
      .filter(t => t.type === type);
    
    const categoryTotals = monthlyTransactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#64748b'
    }));
  }
};

// CSV Export Service
export const exportService = {
  exportTransactionsToCSV: (): string => {
    const transactions = transactionService.getTransactions();
    
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.date,
        t.type,
        `"${t.category}"`,
        `"${t.description}"`,
        t.amount.toFixed(2)
      ].join(','))
    ].join('\n');
    
    return csvContent;
  },

  downloadCSV: (filename: string = 'transactions.csv'): void => {
    const csvContent = exportService.exportTransactionsToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};

// Utility Functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Demo Data Generator
export const demoService = {
  generateDemoData: (): void => {
    const user = userService.getCurrentUser();
    if (!user) {
      console.error('No user found for demo data generation');
      return;
    }

    console.log('Generating demo data for user:', user);

    // Clear existing data
    storage.set(STORAGE_KEYS.TRANSACTIONS, []);
    storage.set(STORAGE_KEYS.SAVINGS_GOALS, []);

    // Generate demo transactions
    const demoTransactions: Omit<Transaction, 'id' | 'userId' | 'createdAt'>[] = [
      {
        type: "expense",
        amount: 45.80,
        category: "Food & Dining",
        description: "Lunch at downtown cafe",
        date: new Date().toISOString().split('T')[0]
      },
      {
        type: "income",
        amount: 2500.00,
        category: "Salary",
        description: "Monthly salary",
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
      },
      {
        type: "expense",
        amount: 89.99,
        category: "Shopping",
        description: "Online purchase",
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
      },
      {
        type: "expense",
        amount: 15.00,
        category: "Transportation",
        description: "Uber ride",
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0]
      },
      {
        type: "income",
        amount: 350.00,
        category: "Freelance",
        description: "Website design project",
        date: new Date(Date.now() - 259200000).toISOString().split('T')[0]
      }
    ];

    demoTransactions.forEach(transaction => {
      transactionService.addTransaction(transaction);
    });

    // Generate demo savings goals
    const demoGoals: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt'>[] = [
      {
        title: "Emergency Fund",
        target: 10000,
        current: 6500,
        deadline: "2024-12-31",
        color: "hsl(var(--primary))"
      },
      {
        title: "Vacation Fund",
        target: 3000,
        current: 1200,
        deadline: "2024-06-30",
        color: "hsl(var(--accent))"
      },
      {
        title: "New Car",
        target: 25000,
        current: 8500,
        deadline: "2025-03-31",
        color: "hsl(var(--success))"
      }
    ];

    demoGoals.forEach(goal => {
      savingsGoalService.addSavingsGoal(goal);
    });
  }
};

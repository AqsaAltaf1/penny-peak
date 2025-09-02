import { supabase } from '@/lib/supabase';
import { Transaction, SavingsGoal, User, TransactionStats, CategoryData } from '@/types';
import { CATEGORY_COLORS } from '@/types';

// Auth Service
export const authService = {
  // Sign up new user
  signUp: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  },

  // Sign up with OTP (sends verification code via email)
  signUpWithOTP: async (email: string, fullName: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  },

  // Verify OTP code
  verifyOTP: async (email: string, token: string, type: 'signup' | 'recovery' | 'email' = 'email') => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type
    });

    if (error) throw error;
    return data;
  },

  // Resend OTP code
  resendOTP: async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email
    });

    if (error) throw error;
    return data;
  },

  // Sign in with magic link (passwordless)
  signInWithMagicLink: async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  },

  // Sign in user
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    if (!user) return null;

    // Get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email!,
      name: profile?.full_name || user.user_metadata?.full_name || '',
      createdAt: user.created_at,
    };
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await authService.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
};

// Transaction Service
export const transactionService = {
  // Get all transactions for current user
  getTransactions: async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(row => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      amount: row.amount,
      category: row.category,
      description: row.description || '',
      date: row.date,
      createdAt: row.created_at,
    }));
  },

  // Add new transaction
  addTransaction: async (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>): Promise<Transaction> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description || '',
      date: data.date,
      createdAt: data.created_at,
    };
  },

  // Update transaction
  updateTransaction: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        type: updates.type,
        amount: updates.amount,
        category: updates.category,
        description: updates.description,
        date: updates.date,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description || '',
      date: data.date,
      createdAt: data.created_at,
    };
  },

  // Delete transaction
  deleteTransaction: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get transactions by date range
  getTransactionsByDateRange: async (startDate: string, endDate: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(row => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      amount: row.amount,
      category: row.category,
      description: row.description || '',
      date: row.date,
      createdAt: row.created_at,
    }));
  },

  // Get transactions by month
  getTransactionsByMonth: async (year: number, month: number): Promise<Transaction[]> => {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    return transactionService.getTransactionsByDateRange(startDate, endDate);
  }
};

// Savings Goals Service
export const savingsGoalService = {
  // Get all savings goals for current user
  getSavingsGoals: async (): Promise<SavingsGoal[]> => {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(row => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      target: row.target_amount,
      current: row.current_amount,
      deadline: row.deadline || '',
      color: row.color,
      createdAt: row.created_at,
    }));
  },

  // Add new savings goal
  addSavingsGoal: async (goal: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt'>): Promise<SavingsGoal> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: user.id,
        title: goal.title,
        target_amount: goal.target,
        current_amount: goal.current,
        deadline: goal.deadline,
        color: goal.color,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      target: data.target_amount,
      current: data.current_amount,
      deadline: data.deadline || '',
      color: data.color,
      createdAt: data.created_at,
    };
  },

  // Update savings goal
  updateSavingsGoal: async (id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    const { data, error } = await supabase
      .from('savings_goals')
      .update({
        title: updates.title,
        target_amount: updates.target,
        current_amount: updates.current,
        deadline: updates.deadline,
        color: updates.color,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      target: data.target_amount,
      current: data.current_amount,
      deadline: data.deadline || '',
      color: data.color,
      createdAt: data.created_at,
    };
  },

  // Delete savings goal
  deleteSavingsGoal: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Analytics Service
export const analyticsService = {
  // Calculate statistics
  calculateStats: async (): Promise<TransactionStats> => {
    const transactions = await transactionService.getTransactions();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const monthlyTransactions = await transactionService.getTransactionsByMonth(currentYear, currentMonth);
    
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

  // Get category data for charts
  getCategoryData: async (type: 'income' | 'expense' = 'expense'): Promise<CategoryData[]> => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const monthlyTransactions = (await transactionService.getTransactionsByMonth(currentYear, currentMonth))
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

// Categories Service
export const categoriesService = {
  // Get all categories
  getCategories: async (type?: 'income' | 'expense') => {
    let query = supabase.from('categories').select('*');
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query.order('name');
    if (error) throw error;
    
    return data;
  }
};

// Export Service
export const exportService = {
  // Export transactions to CSV
  exportTransactionsToCSV: async (): Promise<string> => {
    const transactions = await transactionService.getTransactions();
    
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

  // Download CSV file
  downloadCSV: async (filename: string = 'transactions.csv'): Promise<void> => {
    const csvContent = await exportService.exportTransactionsToCSV();
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

// Demo Service
export const demoService = {
  // Generate demo data
  generateDemoData: async (): Promise<void> => {
    // Demo transactions
    const demoTransactions = [
      {
        type: 'expense' as const,
        amount: 45.80,
        category: 'Food & Dining',
        description: 'Lunch at downtown cafe',
        date: new Date().toISOString().split('T')[0]
      },
      {
        type: 'income' as const,
        amount: 2500.00,
        category: 'Salary',
        description: 'Monthly salary',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
      },
      {
        type: 'expense' as const,
        amount: 89.99,
        category: 'Shopping',
        description: 'Online purchase',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
      },
      {
        type: 'expense' as const,
        amount: 15.00,
        category: 'Transportation',
        description: 'Uber ride',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0]
      },
      {
        type: 'income' as const,
        amount: 350.00,
        category: 'Freelance',
        description: 'Website design project',
        date: new Date(Date.now() - 259200000).toISOString().split('T')[0]
      }
    ];

    // Add demo transactions
    for (const transaction of demoTransactions) {
      await transactionService.addTransaction(transaction);
    }

    // Demo savings goals
    const demoGoals = [
      {
        title: 'Emergency Fund',
        target: 10000,
        current: 6500,
        deadline: '2024-12-31',
        color: 'hsl(var(--primary))'
      },
      {
        title: 'Vacation Fund',
        target: 3000,
        current: 1200,
        deadline: '2024-06-30',
        color: 'hsl(var(--accent))'
      },
      {
        title: 'New Car',
        target: 25000,
        current: 8500,
        deadline: '2025-03-31',
        color: 'hsl(var(--success))'
      }
    ];

    // Add demo savings goals
    for (const goal of demoGoals) {
      await savingsGoalService.addSavingsGoal(goal);
    }
  }
};

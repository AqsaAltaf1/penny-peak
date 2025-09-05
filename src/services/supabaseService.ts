import { supabase } from '@/lib/supabase';
import { Transaction, SavingsGoal, User, TransactionStats, CategoryData } from '@/types';
import { CATEGORY_COLORS } from '@/types';

// Auth Service
export const authService = {
  // Sign up new user with retry logic
  signUp: async (email: string, password: string, fullName: string, retryCount = 0) => {
    // Get the current origin and ensure it's the right port
    const currentOrigin = window.location.origin;
    const redirectUrl = `${currentOrigin}/auth/callback`;
    console.log('Window location:', window.location.href);
    console.log('Window origin:', currentOrigin);
    console.log('Signup redirect URL:', redirectUrl);
    
    // Double check - if somehow we're getting the wrong port, force it
    const finalRedirectUrl = redirectUrl.includes('localhost:8080') 
      ? redirectUrl.replace('localhost:8080', 'localhost:8081')
      : redirectUrl;
    console.log('Final redirect URL:', finalRedirectUrl);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: finalRedirectUrl,
        }
      });

      if (error) throw error;
      return data;
      
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle rate limiting with exponential backoff
      if ((error.message.includes('rate limit') || error.status === 429) && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/3)`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return authService.signUp(email, password, fullName, retryCount + 1);
      }
      
      // Provide user-friendly error messages
      if (error.message.includes('confirmation email') || error.message.includes('email service') || error.message.includes('Error sending confirmation email')) {
        throw new Error('Email service is not configured properly. The redirect URL or SMTP settings need to be fixed in Supabase. Please use demo mode for now.');
      } else if (error.message.includes('rate limit') || error.status === 429) {
        throw new Error('Server is busy. Please try the demo mode for instant access, or wait a few minutes.');
      } else if (error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      } else if (error.status === 500) {
        throw new Error('Server configuration error. Please use demo mode while we fix the email setup.');
      }
      
      throw error;
    }
  },

  // Sign up with OTP (sends ONLY verification code via email, no password required)
  signUpWithOTP: async (email: string, fullName: string) => {
    try {
      // Method 1: Try magic link OTP (should send 6-digit code)
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            full_name: fullName,
          },
          // No emailRedirectTo - we only want the OTP code, not a link
        }
      });

      if (error) {
        console.error('Magic link OTP failed, trying alternative method:', error);
        
        // Method 2: Fallback - create user first, then send OTP
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email,
          password: Math.random().toString(36).slice(-12), // Random temp password
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: undefined, // No redirect
          }
        });

        if (signupError) throw signupError;
        return signupData;
      }

      return data;
    } catch (err) {
      console.error('OTP signup failed:', err);
      throw err;
    }
  },

  // Verify OTP code - tries multiple types automatically
  verifyOTP: async (email: string, token: string, type?: 'signup' | 'recovery' | 'email' | 'magiclink') => {
    // If no type specified, try all possible types in order of likelihood
    const typesToTry = type ? [type] : ['email', 'magiclink', 'signup', 'recovery'];
    
    let lastError = null;
    
    for (const otpType of typesToTry) {
      try {
        console.log(`Trying OTP verification with type: ${otpType}`);
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: otpType as any
        });

        if (!error && data?.user) {
          console.log(`OTP verification successful with type: ${otpType}`);
          return data;
        }
        
        if (error) {
          console.log(`OTP verification failed with type ${otpType}:`, error.message);
          lastError = error;
        }
      } catch (err) {
        console.log(`Exception with type ${otpType}:`, err);
        lastError = err;
      }
    }
    
    // If all types failed, throw the last error
    throw lastError || new Error('OTP verification failed with all types');
  },

  // Resend OTP code for magic link
  resendOTP: async (email: string) => {
    // For magic link OTP, we need to send a new magic link
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't create if user doesn't exist
      }
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

  // Sign in user with retry logic
  signIn: async (email: string, password: string, retryCount = 0) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
      
    } catch (error) {
      console.error('Signin error:', error);
      
      // Handle rate limiting with exponential backoff
      if ((error.message.includes('rate limit') || error.status === 429) && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited, retrying login in ${delay}ms (attempt ${retryCount + 1}/3)`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return authService.signIn(email, password, retryCount + 1);
      }
      
      // Provide user-friendly error messages
      if (error.message.includes('rate limit') || error.status === 429) {
        throw new Error('Too many login attempts. Please try the demo mode for instant access.');
      } else if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials.');
      }
      
      throw error;
    }
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
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email!,
        name: profile?.full_name || user.user_metadata?.full_name || user.email!.split('@')[0],
        createdAt: user.created_at
      };
    } catch (error) {
      // Handle cases where no session exists
      console.log('No active session found:', error);
      return null;
    }
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

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

  // Sign up with OTP (sends ONLY verification code via email, password required)
  signUpWithOTP: async (email: string, fullName: string, password?: string) => {
    try {
      console.log('OTP Registration - Email:', email, 'Password provided:', !!password);
      
      // Always use the provided password - don't rely on magic link OTP for password setting
      if (!password) {
        throw new Error('Password is required for OTP registration');
      }
      
      // Create user with password and let Supabase handle the OTP automatically
      console.log('Creating user with password and OTP...');
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password: password, // Always use the provided password
        options: {
          data: {
            full_name: fullName,
          },
          // Let Supabase handle OTP automatically - don't send separate OTP
        }
      });

      if (signupError) {
        console.error('User creation failed:', signupError);
        throw signupError;
      }

      console.log('User created successfully with OTP sent automatically');
      return signupData;
      
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
  },

  // Check if email exists in Supabase Users table using Postgres function
  checkEmailExists: async (email: string) => {
    try {
      console.log('Checking if email exists using Postgres function:', email);
      
      // Use the Postgres function that runs with elevated privileges
      const { data, error } = await supabase.rpc('check_email_exists', {
        email_to_check: email
      });

      if (error) {
        console.error('Postgres function error:', error);
        // Fallback to authentication method if function fails
        console.log('Falling back to authentication method...');
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email,
          password: 'dummy-password-to-check-email-existence'
        });

        if (authError) {
          const errorMessage = authError.message.toLowerCase();
          console.log('Auth fallback error message:', errorMessage);
          
          if (errorMessage.includes('invalid login credentials') && authError.status === 400) {
            console.log('Email exists (auth fallback)');
            return { exists: true, confirmed: false, message: 'Email exists but not confirmed' };
          } else {
            console.log('Email does not exist (auth fallback)');
            return { exists: false, confirmed: false, message: 'Email does not exist' };
          }
        } else {
          console.log('Unexpected auth success - email exists');
          return { exists: true, confirmed: true, message: 'Email exists and is confirmed' };
        }
      }

      console.log('Postgres function result:', data);
      
      // The function returns a JSON object with the result
      if (data && typeof data === 'object') {
        return {
          exists: data.exists,
          confirmed: data.confirmed,
          user_id: data.user_id,
          email: data.email,
          message: data.message
        };
      } else {
        console.log('Unexpected function result format:', data);
        return { exists: false, confirmed: false, message: 'Error checking email, allowing registration' };
      }

    } catch (error) {
      console.error('Error checking email existence:', error);
      // If all methods fail, assume email doesn't exist to allow registration
      console.log('All methods failed, allowing registration');
      return { exists: false, confirmed: false, message: 'Error checking email, allowing registration' };
    }
  },

  // Send password reset email
  resetPassword: async (email: string, retryCount = 0) => {
    try {
      const currentOrigin = window.location.origin;
      const redirectUrl = `${currentOrigin}/auth/reset-password`;
      console.log('Password reset redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;
      return data;
      
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Handle rate limiting with exponential backoff
      if ((error.message.includes('rate limit') || error.status === 429) && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited, retrying password reset in ${delay}ms (attempt ${retryCount + 1}/3)`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return authService.resetPassword(email, retryCount + 1);
      }
      
      // Provide user-friendly error messages
      if (error.message.includes('rate limit') || error.status === 429) {
        throw new Error('Too many password reset attempts. Please wait a few minutes before trying again.');
      } else if (error.message.includes('email service') || error.message.includes('Error sending')) {
        throw new Error('Email service is not configured properly. Please contact support for assistance.');
      } else if (error.status === 500) {
        throw new Error('Server configuration error. Please contact support for assistance.');
      }
      
      throw error;
    }
  },

  // Update password (for authenticated users)
  updatePassword: async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return data;
      
    } catch (error) {
      console.error('Password update error:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('rate limit') || error.status === 429) {
        throw new Error('Too many password update attempts. Please wait a few minutes before trying again.');
      } else if (error.message.includes('Password should be at least')) {
        throw new Error('Password must be at least 6 characters long.');
      }
      
      throw error;
    }
  },

  // Get user details for debugging
  getUserDetails: async (email: string) => {
    try {
      console.log('Getting user details for:', email);
      
      // First, get the user ID from our existing checkEmailExists function
      const emailCheck = await authService.checkEmailExists(email);
      
      if (!emailCheck.exists) {
        return { success: false, error: 'User not found' };
      }
      
      // Extract user ID from the email check result
      const userId = emailCheck.user_id;
      
      if (!userId) {
        return { success: false, error: 'User ID not found' };
      }
      
      // Try to get user details using the user ID
      try {
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        
        if (error) {
          console.error('Error getting user details:', error);
          // If admin access is denied, return basic info we have
          return { 
            success: true, 
            user: {
              id: userId,
              email: emailCheck.email,
              emailConfirmed: emailCheck.confirmed,
              message: 'Admin access denied, showing basic info only'
            }
          };
        }
        
        if (data.user) {
          console.log('User details:', {
            id: data.user.id,
            email: data.user.email,
            email_confirmed_at: data.user.email_confirmed_at,
            created_at: data.user.created_at,
            last_sign_in_at: data.user.last_sign_in_at,
            app_metadata: data.user.app_metadata,
            user_metadata: data.user.user_metadata
          });
          
          return {
            success: true,
            user: {
              id: data.user.id,
              email: data.user.email,
              emailConfirmed: !!data.user.email_confirmed_at,
              createdAt: data.user.created_at,
              lastSignIn: data.user.last_sign_in_at,
              appMetadata: data.user.app_metadata,
              userMetadata: data.user.user_metadata
            }
          };
        } else {
          return { success: false, error: 'User not found' };
        }
      } catch (adminError) {
        console.log('Admin access denied, returning basic info');
        return { 
          success: true, 
          user: {
            id: userId,
            email: emailCheck.email,
            emailConfirmed: emailCheck.confirmed,
            message: 'Admin access denied, showing basic info only'
          }
        };
      }
      
    } catch (error) {
      console.error('Error in getUserDetails:', error);
      return { success: false, error: error.message };
    }
  },

  // Simple password reset function
  sendPasswordReset: async (email: string) => {
    try {
      console.log('Sending password reset for:', email);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }
      
      console.log('Password reset email sent successfully');
      return { success: true, data };
      
    } catch (error) {
      console.error('Error sending password reset:', error);
      throw error;
    }
  },

  // Alternative: Try to sign in with common passwords to help user remember
  tryCommonPasswords: async (email: string) => {
    const commonPasswords = [
      'password',
      '123456',
      'password123',
      '123456789',
      'qwerty',
      'abc123',
      'password1',
      'admin',
      'letmein',
      'welcome'
    ];

    console.log('Trying common passwords for:', email);
    
    for (const password of commonPasswords) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        if (!error && data.user) {
          console.log('Found working password:', password);
          return { success: true, password: password, message: `Found working password: ${password}` };
        }
      } catch (err) {
        // Continue to next password
        continue;
      }
    }
    
    return { success: false, message: 'No common passwords worked' };
  },

  // Test if a specific password works for a user
  testPassword: async (email: string, password: string) => {
    try {
      console.log('Testing password for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (!error && data.user) {
        console.log('Password test successful');
        return { success: true, message: 'Password is correct!' };
      } else {
        console.log('Password test failed:', error?.message);
        return { success: false, message: error?.message || 'Password is incorrect' };
      }
    } catch (err) {
      console.error('Password test error:', err);
      return { success: false, message: 'Password test failed' };
    }
  },

  // Send OTP for password reset
  sendPasswordResetOTP: async (email: string) => {
    try {
      console.log('Sending password reset OTP for:', email);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create user if doesn't exist
        }
      });

      if (error) {
        console.error('Password reset OTP error:', error);
        return { data: null, error };
      }
      
      console.log('Password reset OTP sent successfully');
      return { data, error: null };
      
    } catch (error) {
      console.error('Error sending password reset OTP:', error);
      return { data: null, error };
    }
  },

  // Verify OTP for password reset
  verifyPasswordResetOTP: async (email: string, token: string) => {
    try {
      console.log('Verifying password reset OTP for:', email);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery'
      });

      if (error) {
        console.error('Password reset OTP verification error:', error);
        return { success: false, message: error.message };
      }
      
      console.log('Password reset OTP verified successfully');
      return { success: true, message: 'OTP verified successfully' };
      
    } catch (error) {
      console.error('Error verifying password reset OTP:', error);
      return { success: false, message: 'OTP verification failed' };
    }
  },

  // Set new password with OTP verification
  setNewPasswordWithOTP: async (email: string, token: string, newPassword: string) => {
    try {
      console.log('Setting new password with OTP for:', email);
      
      // First verify the OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery'
      });

      if (error) {
        console.error('OTP verification failed:', error);
        return { success: false, message: 'Invalid or expired verification code' };
      }

      // Now update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Password update failed:', updateError);
        return { success: false, message: updateError.message };
      }
      
      console.log('Password updated successfully');
      return { success: true, message: 'Password updated successfully' };
      
    } catch (error) {
      console.error('Error setting new password:', error);
      return { success: false, message: 'Failed to update password' };
    }
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

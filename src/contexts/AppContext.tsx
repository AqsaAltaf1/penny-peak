import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Transaction, SavingsGoal, AppState } from '@/types';
import { 
  authService, 
  transactionService, 
  savingsGoalService, 
  demoService 
} from '@/services/supabaseService';

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<{ success: boolean; needsConfirmation: boolean; message?: string; }>;
  registerWithOTP: (email: string, name: string, password?: string) => Promise<{ success: boolean; needsConfirmation: boolean; message?: string; }>;
  verifyOTP: (email: string, code: string) => Promise<{ success: boolean; message?: string; }>;
  resendOTP: (email: string) => Promise<{ success: boolean; message?: string; }>;
  checkEmailExists: (email: string) => Promise<{ exists: boolean; confirmed: boolean; message: string; }>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  loadDemoData: () => Promise<void>;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; transaction: Transaction } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_SAVINGS_GOALS'; payload: SavingsGoal[] }
  | { type: 'ADD_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'UPDATE_SAVINGS_GOAL'; payload: { id: string; goal: SavingsGoal } }
  | { type: 'DELETE_SAVINGS_GOAL'; payload: string };

const initialState: AppState = {
  auth: {
    user: null,
    isAuthenticated: false,
  },
  transactions: [],
  savingsGoals: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        auth: {
          user: action.payload,
          isAuthenticated: action.payload !== null,
        },
      };
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload.transaction : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    case 'SET_SAVINGS_GOALS':
      return {
        ...state,
        savingsGoals: action.payload,
      };
    case 'ADD_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: [...state.savingsGoals, action.payload],
      };
    case 'UPDATE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map(g =>
          g.id === action.payload.id ? action.payload.goal : g
        ),
      };
    case 'DELETE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter(g => g.id !== action.payload),
      };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data and listen for auth changes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we're in demo mode first
        const isDemoMode = localStorage.getItem('demo_mode') === 'true';
        
        if (isDemoMode) {
          console.log('Demo mode detected, loading demo data...');
          // Load demo user and data from localStorage
          const demoUserData = localStorage.getItem('expense_tracker_user');
          
          if (demoUserData) {
            const demoUser = JSON.parse(demoUserData);
            console.log('Demo user loaded:', demoUser);
            dispatch({ type: 'SET_USER', payload: demoUser });
            
            // Load demo data from localStorage
            const { transactionService, savingsGoalService } = await import('@/services/dataService');
            const transactions = transactionService.getTransactions();
            const savingsGoals = savingsGoalService.getSavingsGoals();
            console.log('Demo data loaded:', { transactions, savingsGoals });
            dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
            dispatch({ type: 'SET_SAVINGS_GOALS', payload: savingsGoals });
            return;
          } else {
            console.log('Demo mode set but no user data found, clearing demo mode');
            // If demo mode is set but no user data, clear demo mode
            localStorage.removeItem('demo_mode');
          }
        }
        
        // Normal Supabase auth flow - only try if not in demo mode
        if (localStorage.getItem('demo_mode') !== 'true') {
          const user = await authService.getCurrentUser();
          if (user) {
            dispatch({ type: 'SET_USER', payload: user });
            await loadUserData();
          }
        }
      } catch (error) {
        // Silently handle auth session missing errors during initialization
        if (error.message?.includes('Auth session missing')) {
          console.log('No active session found during initialization');
        } else {
          console.error('Failed to initialize auth:', error);
        }
      }
    };

    // Initialize auth on mount
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (user) => {
      dispatch({ type: 'SET_USER', payload: user });
      if (user) {
        await loadUserData();
      } else {
        dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
        dispatch({ type: 'SET_SAVINGS_GOALS', payload: [] });
      }
    });

    // Cleanup subscription
    return () => subscription?.unsubscribe();
  }, []);

  const loadUserData = async () => {
    try {
      const transactions = await transactionService.getTransactions();
      const savingsGoals = await savingsGoalService.getSavingsGoals();
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
      dispatch({ type: 'SET_SAVINGS_GOALS', payload: savingsGoals });
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await authService.signIn(email, password);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const register = async (email: string, name: string, password: string) => {
    try {
      // First check if email already exists
      console.log('Checking email status before registration...');
      const emailCheck = await authService.checkEmailExists(email);
      console.log('Email check result:', emailCheck);
      
      if (emailCheck.exists) {
        if (emailCheck.confirmed) {
          // User exists and is confirmed - they should login instead
          throw new Error('An account with this email already exists and is confirmed. Please try logging in instead.');
        } else {
          // User exists but not confirmed - they should use OTP registration instead
          throw new Error('An account with this email already exists but is not confirmed. Please use the "Register with Code" option to complete your registration.');
        }
      }
      
      // Email doesn't exist - create new user
      console.log('Email does not exist, creating new user...');
      const data = await authService.signUp(email, password, name);
      
      // Check if user needs to confirm email
      if (data.user && !data.session) {
        // User created but needs email confirmation
        return { 
          success: true, 
          needsConfirmation: true,
          message: 'Please check your email and click the confirmation link to complete registration.'
        };
      }
      
      return { success: true, needsConfirmation: false };
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Handle specific error cases
      if (error.message?.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      } else if (error.message?.includes('confirmation email')) {
        throw new Error('Unable to send confirmation email. Please check your email address and try again.');
      } else if (error.message?.includes('Invalid email')) {
        throw new Error('Please enter a valid email address.');
      } else if (error.message?.includes('Password')) {
        throw new Error('Password must be at least 6 characters long.');
      }
      
      throw error;
    }
  };

  // Register with OTP (6-digit code) - Creates user with password and sends OTP
  const registerWithOTP = async (email: string, name: string, password?: string) => {
    try {
      // First check if email already exists
      console.log('Checking email status before OTP registration...');
      const emailCheck = await authService.checkEmailExists(email);
      console.log('Email check result:', emailCheck);
      
      if (emailCheck.exists) {
        if (emailCheck.confirmed) {
          // User exists and is confirmed - they should login instead
          throw new Error('An account with this email already exists and is confirmed. Please try logging in instead.');
        } else {
          // User exists but not confirmed - send OTP for verification
          console.log('User exists but not confirmed, sending OTP for verification...');
          try {
            await authService.resendOTP(email);
            return {
              success: true,
              needsConfirmation: true,
              message: 'Please check your email for a 6-digit verification code to complete your registration.'
            };
          } catch (otpError) {
            console.error('Failed to resend OTP:', otpError);
            throw new Error('Unable to send verification code. Please try again or contact support.');
          }
        }
      }
      
      // Email doesn't exist - create new user with OTP
      console.log('Email does not exist, creating new OTP account...');
      const data = await authService.signUpWithOTP(email, name);
      
      return { 
        success: true, 
        needsConfirmation: true,
        message: 'Please check your email for a 6-digit verification code.'
      };
    } catch (error) {
      console.error('OTP Registration failed:', error);
      
      // Handle specific error cases
      if (error.message?.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      } else if (error.message?.includes('confirmation email')) {
        throw new Error('Unable to send verification code. Please check your email address and try again.');
      } else if (error.message?.includes('Invalid email')) {
        throw new Error('Please enter a valid email address.');
      }
      
      throw error;
    }
  };

  // Verify OTP code
  const verifyOTP = async (email: string, code: string) => {
    try {
      // Don't specify type - let the service try all types automatically
      const result = await authService.verifyOTP(email, code);
      
      if (result?.user) {
        await loadUserData();
        return {
          success: true,
          message: 'Email verified successfully! Welcome to Penny Peak!'
        };
      }
      
      return {
        success: false,
        message: 'Invalid verification code. Please try again.'
      };
    } catch (error) {
      console.error('OTP verification failed:', error);
      
      // Provide specific error messages
      let message = 'Verification failed';
      if (error?.message?.includes('Invalid login credentials')) {
        message = 'Invalid verification code. Please check the 6-digit code from your email.';
      } else if (error?.message?.includes('Token has expired')) {
        message = 'Verification code has expired. Please request a new one.';
      } else if (error?.message?.includes('Email not confirmed')) {
        message = 'Please check your email and enter the 6-digit verification code.';
      } else if (error?.message) {
        message = error.message;
      }
      
      return {
        success: false,
        message
      };
    }
  };

  // Resend OTP code
  const resendOTP = async (email: string) => {
    try {
      await authService.resendOTP(email);
      return {
        success: true,
        message: 'Verification code sent to your email!'
      };
    } catch (error) {
      console.error('Resend OTP failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to resend code'
      };
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    try {
      // Check if we're in demo mode
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      
      if (isDemoMode) {
        // Use localStorage service for demo mode
        const { transactionService: localTransactionService } = await import('@/services/dataService');
        const transaction = localTransactionService.addTransaction(transactionData);
        dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      } else {
        // Use Supabase service for authenticated users
        const transaction = await transactionService.addTransaction(transactionData);
        dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      }
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      // Check if we're in demo mode
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      
      if (isDemoMode) {
        // Use localStorage service for demo mode
        const { transactionService: localTransactionService } = await import('@/services/dataService');
        const updatedTransaction = localTransactionService.updateTransaction(id, updates);
        if (updatedTransaction) {
          dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, transaction: updatedTransaction } });
        }
      } else {
        // Use Supabase service for authenticated users
        const updatedTransaction = await transactionService.updateTransaction(id, updates);
        dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, transaction: updatedTransaction } });
      }
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      // Check if we're in demo mode
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      
      if (isDemoMode) {
        // Use localStorage service for demo mode
        const { transactionService: localTransactionService } = await import('@/services/dataService');
        const success = localTransactionService.deleteTransaction(id);
        if (success) {
          dispatch({ type: 'DELETE_TRANSACTION', payload: id });
        }
      } else {
        // Use Supabase service for authenticated users
        await transactionService.deleteTransaction(id);
        dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  };

  const addSavingsGoal = async (goalData: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt'>) => {
    try {
      // Check if we're in demo mode
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      
      if (isDemoMode) {
        // Use localStorage service for demo mode
        const { savingsGoalService: localSavingsGoalService } = await import('@/services/dataService');
        const goal = localSavingsGoalService.addSavingsGoal(goalData);
        dispatch({ type: 'ADD_SAVINGS_GOAL', payload: goal });
      } else {
        // Use Supabase service for authenticated users
        const goal = await savingsGoalService.addSavingsGoal(goalData);
        dispatch({ type: 'ADD_SAVINGS_GOAL', payload: goal });
      }
    } catch (error) {
      console.error('Failed to add savings goal:', error);
      throw error;
    }
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    try {
      // Check if we're in demo mode
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      
      if (isDemoMode) {
        // Use localStorage service for demo mode
        const { savingsGoalService: localSavingsGoalService } = await import('@/services/dataService');
        const updatedGoal = localSavingsGoalService.updateSavingsGoal(id, updates);
        if (updatedGoal) {
          dispatch({ type: 'UPDATE_SAVINGS_GOAL', payload: { id, goal: updatedGoal } });
        }
      } else {
        // Use Supabase service for authenticated users
        const updatedGoal = await savingsGoalService.updateSavingsGoal(id, updates);
        dispatch({ type: 'UPDATE_SAVINGS_GOAL', payload: { id, goal: updatedGoal } });
      }
    } catch (error) {
      console.error('Failed to update savings goal:', error);
      throw error;
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    try {
      // Check if we're in demo mode
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      
      if (isDemoMode) {
        // Use localStorage service for demo mode
        const { savingsGoalService: localSavingsGoalService } = await import('@/services/dataService');
        const success = localSavingsGoalService.deleteSavingsGoal(id);
        if (success) {
          dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id });
        }
      } else {
        // Use Supabase service for authenticated users
        await savingsGoalService.deleteSavingsGoal(id);
        dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id });
      }
    } catch (error) {
      console.error('Failed to delete savings goal:', error);
      throw error;
    }
  };

  const loadDemoData = async () => {
    try {
      // Check if we're in demo mode
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      
      if (isDemoMode) {
        // Use localStorage demo service for demo mode
        const { demoService: localDemoService } = await import('@/services/dataService');
        localDemoService.generateDemoData();
        
        // Load the demo data from localStorage
        const { transactionService, savingsGoalService } = await import('@/services/dataService');
        const transactions = transactionService.getTransactions();
        const savingsGoals = savingsGoalService.getSavingsGoals();
        dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
        dispatch({ type: 'SET_SAVINGS_GOALS', payload: savingsGoals });
      } else {
        // Use Supabase demo service for authenticated users
        await demoService.generateDemoData();
        await loadUserData();
      }
    } catch (error) {
      console.error('Failed to load demo data:', error);
      throw error;
    }
  };

  const contextValue: AppContextType = {
    ...state,
    login,
    logout,
    register,
    registerWithOTP,
    verifyOTP,
    resendOTP,
    checkEmailExists: authService.checkEmailExists,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    loadDemoData,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

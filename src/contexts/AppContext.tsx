import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Transaction, SavingsGoal, AppState } from '@/types';
import { userService, transactionService, savingsGoalService, demoService } from '@/services/dataService';

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  loadDemoData: () => void;
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

  // Load initial data
  useEffect(() => {
    const user = userService.getCurrentUser();
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
      loadUserData();
    }
  }, []);

  const loadUserData = () => {
    const transactions = transactionService.getTransactions();
    const savingsGoals = savingsGoalService.getSavingsGoals();
    dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
    dispatch({ type: 'SET_SAVINGS_GOALS', payload: savingsGoals });
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = userService.loginUser(email, password);
      if (user) {
        dispatch({ type: 'SET_USER', payload: user });
        loadUserData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    userService.clearCurrentUser();
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_TRANSACTIONS', payload: [] });
    dispatch({ type: 'SET_SAVINGS_GOALS', payload: [] });
  };

  const register = async (email: string, name: string, password: string): Promise<boolean> => {
    try {
      const user = userService.createUser(email, name, password);
      dispatch({ type: 'SET_USER', payload: user });
      loadUserData();
      return true;
    } catch {
      return false;
    }
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    try {
      const transaction = transactionService.addTransaction(transactionData);
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = transactionService.updateTransaction(id, updates);
      if (updatedTransaction) {
        dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, transaction: updatedTransaction } });
      }
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const deleteTransaction = (id: string) => {
    try {
      const success = transactionService.deleteTransaction(id);
      if (success) {
        dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const addSavingsGoal = (goalData: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt'>) => {
    try {
      const goal = savingsGoalService.addSavingsGoal(goalData);
      dispatch({ type: 'ADD_SAVINGS_GOAL', payload: goal });
    } catch (error) {
      console.error('Failed to add savings goal:', error);
    }
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    try {
      const updatedGoal = savingsGoalService.updateSavingsGoal(id, updates);
      if (updatedGoal) {
        dispatch({ type: 'UPDATE_SAVINGS_GOAL', payload: { id, goal: updatedGoal } });
      }
    } catch (error) {
      console.error('Failed to update savings goal:', error);
    }
  };

  const deleteSavingsGoal = (id: string) => {
    try {
      const success = savingsGoalService.deleteSavingsGoal(id);
      if (success) {
        dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id });
      }
    } catch (error) {
      console.error('Failed to delete savings goal:', error);
    }
  };

  const loadDemoData = () => {
    try {
      demoService.generateDemoData();
      loadUserData();
    } catch (error) {
      console.error('Failed to load demo data:', error);
    }
  };

  const contextValue: AppContextType = {
    ...state,
    login,
    logout,
    register,
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

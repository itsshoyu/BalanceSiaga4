export interface User {
  id: string;
  username: string;
  email: string;
  joinedDate: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByType: (type: Transaction['type']) => Transaction[];
  getTotalByType: (type: Transaction['type']) => number;
  getTransactionsByCategory: (category: string) => Transaction[];
}

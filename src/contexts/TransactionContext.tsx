import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, TransactionContextType } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) throw new Error('useTransactions must be used within TransactionProvider');
  return context;
};

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider = ({ children }: TransactionProviderProps) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`transactions_${user.id}`);
      if (stored) {
        setTransactions(JSON.parse(stored));
      }
    } else {
      setTransactions([]);
    }
  }, [user]);

  const saveTransactions = (txs: Transaction[]) => {
    if (user) {
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(txs));
      setTransactions(txs);
    }
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    const updated = [...transactions, newTransaction];
    saveTransactions(updated);
    toast({ title: 'Berhasil!', description: 'Transaksi berhasil disimpan!' });
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    saveTransactions(updated);
    toast({ title: 'Terhapus', description: 'Transaksi berhasil dihapus' });
  };

  const getTransactionsByType = (type: Transaction['type']) => {
    return transactions.filter(t => t.type === type);
  };

  const getTotalByType = (type: Transaction['type']) => {
    return transactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTransactionsByCategory = (category: string) => {
    return transactions.filter(t => t.category === category);
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      deleteTransaction,
      getTransactionsByType,
      getTotalByType,
      getTransactionsByCategory,
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

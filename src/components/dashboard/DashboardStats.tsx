import { useTransactions } from '@/contexts/TransactionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, Wallet } from 'lucide-react';

export const DashboardStats = () => {
  const { getTotalByType, transactions } = useTransactions();

  const totalIncome = getTotalByType('income');
  const totalExpense = getTotalByType('expense');
  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground mt-1">Saldo keseluruhan</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pemasukan</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</div>
          <p className="text-xs text-muted-foreground mt-1">Total pemasukan</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pengeluaran</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpense)}</div>
          <p className="text-xs text-muted-foreground mt-1">Total pengeluaran</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transaksi</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{transactions.length}</div>
          <p className="text-xs text-muted-foreground mt-1">Total transaksi</p>
        </CardContent>
      </Card>
    </div>
  );
};

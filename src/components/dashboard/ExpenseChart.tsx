import { useTransactions } from '@/contexts/TransactionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

export const ExpenseChart = () => {
  const { transactions } = useTransactions();

  const expenses = transactions.filter(t => t.type === 'expense');
  
  const categoryData = expenses.reduce((acc, transaction) => {
    const existing = acc.find(item => item.name === transaction.category);
    if (existing) {
      existing.value += transaction.amount;
    } else {
      acc.push({ name: transaction.category, value: transaction.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pengeluaran per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Belum ada data pengeluaran
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengeluaran per Kategori</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => 
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(value)
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

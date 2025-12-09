import { useState } from 'react';
import { useTransactions } from '@/contexts/TransactionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const TransactionList = () => {
  const { transactions, deleteTransaction } = useTransactions();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowUpCircle className="h-5 w-5 text-success" />;
      case 'expense':
        return <ArrowDownCircle className="h-5 w-5 text-destructive" />;
      case 'transfer':
        return <ArrowRightLeft className="h-5 w-5 text-primary" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'income': return 'Pemasukan';
      case 'expense': return 'Pengeluaran';
      case 'transfer': return 'Transfer';
      default: return type;
    }
  };

  const exportToCSV = () => {
    const headers = ['Tanggal', 'Kategori', 'Jenis', 'Jumlah', 'Deskripsi'];
    const rows = transactions.map(t => [
      t.date,
      t.category,
      getTypeLabel(t.type),
      t.amount.toString(),
      t.description
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'balance_siaga_export.csv';
    link.click();
    
    toast({ title: 'Berhasil!', description: 'Data transaksi berhasil diekspor ke CSV' });
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(transactions, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'balance_siaga_export.json';
    link.click();
    
    toast({ title: 'Berhasil!', description: 'Data transaksi berhasil diekspor ke JSON' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Daftar Transaksi</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportToJSON}>
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value="income">Pemasukan</SelectItem>
              <SelectItem value="expense">Pengeluaran</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Belum ada transaksi
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map(transaction => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getTypeIcon(transaction.type)}
                  <div className="flex-1">
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`font-bold ${
                      transaction.type === 'income' ? 'text-success' : 
                      transaction.type === 'expense' ? 'text-destructive' : 
                      'text-primary'
                    }`}>
                      {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getTypeLabel(transaction.type)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTransaction(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

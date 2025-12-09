import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar, TrendingUp } from 'lucide-react';

export const UserProfile = () => {
  const { user } = useAuth();
  const { transactions } = useTransactions();

  if (!user) return null;

  const joinDate = new Date(user.joinedDate).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Profil Pengguna</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user.username}</h3>
              <p className="text-sm text-muted-foreground">Pengguna BalanceSiaga</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Bergabung sejak {joinDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>{transactions.length} transaksi tercatat</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistik Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Transaksi</span>
            <span className="font-semibold">{transactions.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Pemasukan</span>
            <span className="font-semibold text-success">
              {transactions.filter(t => t.type === 'income').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Pengeluaran</span>
            <span className="font-semibold text-destructive">
              {transactions.filter(t => t.type === 'expense').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Transfer</span>
            <span className="font-semibold text-primary">
              {transactions.filter(t => t.type === 'transfer').length}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

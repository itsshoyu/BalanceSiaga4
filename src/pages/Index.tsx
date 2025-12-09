import { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { TransactionProvider } from '@/contexts/TransactionContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionList } from '@/components/transactions/TransactionList';
import { ReceiptUpload } from '@/components/receipt/ReceiptUpload';
import { UserProfile } from '@/components/profile/UserProfile';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Wallet } from 'lucide-react';

const AppContent = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Wallet className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                BalanceSiaga
              </h1>
            </div>
            <p className="text-muted-foreground">
              Aplikasi pencatat keuangan cerdas dengan AI OCR
            </p>
          </div>
          
          {showRegister ? (
            <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
          ) : (
            <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">BalanceSiaga</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Halo, <span className="font-semibold text-foreground">{user?.username}</span>
            </span>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transaksi</TabsTrigger>
            <TabsTrigger value="receipt">Upload Struk</TabsTrigger>
            <TabsTrigger value="list">Daftar</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats />
            <div className="grid gap-6 md:grid-cols-2">
              <ExpenseChart />
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="grid gap-6 md:grid-cols-2">
              <TransactionForm />
            </div>
          </TabsContent>

          <TabsContent value="receipt">
            <div className="max-w-2xl mx-auto">
              <ReceiptUpload />
            </div>
          </TabsContent>

          <TabsContent value="list">
            <TransactionList />
          </TabsContent>

          <TabsContent value="ai-insights">
            <AIInsights />
          </TabsContent>

          <TabsContent value="profile">
            <div className="max-w-2xl mx-auto">
              <UserProfile />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <TransactionProvider>
        <AppContent />
      </TransactionProvider>
    </AuthProvider>
  );
};

export default Index;

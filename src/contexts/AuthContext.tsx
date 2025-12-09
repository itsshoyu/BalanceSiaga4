import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';
import { toast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(
      (u: User & { password: string }) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      toast({ title: 'Berhasil!', description: 'Login berhasil' });
      return true;
    }
    
    toast({ 
      title: 'Gagal', 
      description: 'Email atau password salah',
      variant: 'destructive'
    });
    return false;
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.some((u: User) => u.email === email)) {
      toast({ 
        title: 'Gagal', 
        description: 'Email sudah terdaftar',
        variant: 'destructive'
      });
      return false;
    }

    const newUser: User & { password: string } = {
      id: Date.now().toString(),
      username,
      email,
      password,
      joinedDate: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    toast({ title: 'Berhasil!', description: 'Akun berhasil dibuat' });
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    toast({ title: 'Logout', description: 'Anda telah keluar' });
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

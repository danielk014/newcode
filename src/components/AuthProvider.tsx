
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TempUser {
  id: string;
  username: string;
  expires_at: string;
  days_remaining: number;
}

interface AuthContextType {
  user: TempUser | null;
  login: (username: string, password: string) => Promise<{ error?: any }>;
  adminLogin: (code: string) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  createUser: (username: string, password: string) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<TempUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('temp_user');
    const storedAdmin = localStorage.getItem('is_admin');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Verify the user is still active in the database
      supabase
        .from('temp_users')
        .select('is_active, expires_at')
        .eq('id', userData.id)
        .single()
        .then(({ data, error }) => {
          if (error || !data || !data.is_active || new Date(data.expires_at) <= new Date()) {
            // User is no longer active or expired, log them out
            logout();
          } else {
            setUser(userData);
            setIsAuthenticated(true);
          }
        });
    }
    
    if (storedAdmin === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Query temp_users table
      const { data, error } = await supabase
        .from('temp_users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { error: { message: 'Invalid username or password' } };
      }

      // Check if account is expired
      const expiresAt = new Date(data.expires_at);
      const now = new Date();
      if (expiresAt <= now) {
        return { error: { message: 'Account has expired' } };
      }

      // Get days remaining
      const { data: daysData } = await supabase.rpc('get_days_remaining', { user_id: data.id });
      
      const tempUser: TempUser = {
        id: data.id,
        username: data.username,
        expires_at: data.expires_at,
        days_remaining: daysData || 0
      };

      setUser(tempUser);
      setIsAuthenticated(true);
      localStorage.setItem('temp_user', JSON.stringify(tempUser));

      return { error: null };
    } catch (error) {
      return { error: { message: 'Login failed' } };
    }
  };

  const adminLogin = async (code: string) => {
    // Secret admin code
    if (code === 'SCRIPT_ADMIN_2024') {
      setIsAdmin(true);
      localStorage.setItem('is_admin', 'true');
      return { error: null };
    }
    return { error: { message: 'Invalid admin code' } };
  };

  const createUser = async (username: string, password: string) => {
    if (!isAdmin) {
      return { error: { message: 'Admin access required' } };
    }

    try {
      const { error } = await supabase
        .from('temp_users')
        .insert({
          username,
          password,
          is_active: true
        });

      if (error) {
        return { error: { message: 'Failed to create user' } };
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'Failed to create user' } };
    }
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('temp_user');
    localStorage.removeItem('is_admin');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      adminLogin, 
      logout, 
      isAuthenticated, 
      isAdmin, 
      createUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

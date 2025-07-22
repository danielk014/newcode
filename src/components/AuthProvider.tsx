
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ADMIN_CONFIG, SESSION } from '@/config/constants';
import logger from '@/utils/logger';

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
  const [isOffline, setIsOffline] = useState(false);

  // Session monitoring function
  const checkSessionValidity = async (userData: TempUser) => {
    try {
      // Check if user was logged out by admin
      const logoutEvents = JSON.parse(localStorage.getItem('user_logout_events') || '{}');
      const userLogoutTime = logoutEvents[userData.id];
      
      if (userLogoutTime) {
        const logoutTimestamp = new Date(userLogoutTime);
        const sessionTimestamp = new Date(localStorage.getItem('session_timestamp') || '0');
        
        if (logoutTimestamp > sessionTimestamp) {
          logger.log('User was logged out by admin, clearing session');
          logout();
          return false;
        }
      }

      // Skip database checks for demo user in development
      if (import.meta.env.DEV && userData.id === 'demo-user-id') {
        return true;
      }

      // Verify the user is still active in the database
      const { data, error } = await supabase
        .from('temp_users')
        .select('is_active, expires_at, password')
        .eq('id', userData.id)
        .single();

      if (error || !data || !data.is_active || new Date(data.expires_at) <= new Date()) {
        logger.log('User is no longer active or expired, logging out');
        logout();
        return false;
      }

      // Check if password changed (indicating forced logout)
      const storedPasswordHash = localStorage.getItem('user_password');
      const currentPasswordHash = btoa(data.password);
      if (storedPasswordHash && storedPasswordHash !== currentPasswordHash) {
        logger.log('User password changed, logging out');
        logout();
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Session validation error:', error);
      logout();
      return false;
    }
  };

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('temp_user');
    const storedAdmin = localStorage.getItem('is_admin');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      
      // Set session timestamp for logout tracking
      if (!localStorage.getItem('session_timestamp')) {
        localStorage.setItem('session_timestamp', new Date().toISOString());
      }
      
      // In development, trust the stored session for demo user
      if (import.meta.env.DEV && userData.id === 'demo-user-id') {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        checkSessionValidity(userData)
          .then((isValid) => {
            if (isValid) {
              setUser(userData);
              setIsAuthenticated(true);
            }
          })
          .catch((error) => {
            logger.error('Session validation error:', error);
            logout();
          });
      }
    }
    
    if (storedAdmin === 'true') {
      setIsAdmin(true);
    }

    // Set up periodic session validation (disabled in development for demo mode)
    let interval: NodeJS.Timeout | null = null;
    
    if (!import.meta.env.DEV) {
      interval = setInterval(() => {
        const currentStoredUser = localStorage.getItem('temp_user');
        const currentIsAdmin = localStorage.getItem('is_admin') === 'true';
        
        if (currentStoredUser && !currentIsAdmin) {
          const userData = JSON.parse(currentStoredUser);
          checkSessionValidity(userData);
        }
      }, 60000); // Check every 60 seconds in production
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAdmin]);

  const login = async (username: string, password: string) => {
    try {
      // Development mode bypass for VPN/offline scenarios
      if (import.meta.env.DEV && username === 'demo' && password === 'demo123') {
        const demoUser: TempUser = {
          id: 'demo-user-id',
          username: 'demo',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          days_remaining: 30
        };
        
        setUser(demoUser);
        setIsAuthenticated(true);
        localStorage.setItem('temp_user', JSON.stringify(demoUser));
        localStorage.setItem('session_timestamp', new Date().toISOString());
        
        logger.log("Demo mode activated for offline development");
        
        return { error: null };
      }

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
      // Store password hash instead of plain password for better security
      const passwordHash = btoa(data.password); // Simple encoding, use bcrypt in production
      localStorage.setItem('user_password', passwordHash);
      localStorage.setItem('session_timestamp', new Date().toISOString());

      return { error: null };
    } catch (error) {
      logger.error('Login error:', error);
      
      // If network error and in development, suggest demo mode
      if (import.meta.env.DEV) {
        return { error: { message: 'Network error. Try demo account: username "demo", password "demo123"' } };
      }
      
      return { error: { message: 'Login failed - check your connection' } };
    }
  };

  const adminLogin = async (code: string) => {
    // Use admin code from config
    if (code === ADMIN_CONFIG.CODE) {
      setIsAdmin(true);
      localStorage.setItem(SESSION.STORAGE_KEYS.IS_ADMIN, 'true');
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
    localStorage.removeItem('user_password');
    localStorage.removeItem('session_timestamp');
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

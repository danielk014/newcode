
import React from 'react';
import { useAuth } from './AuthProvider';
import LoginForm from './LoginForm';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return <>{children}</>;
};

export default AuthGuard;

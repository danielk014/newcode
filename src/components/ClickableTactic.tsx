import React from 'react';
import { Link } from 'react-router-dom';

interface ClickableTacticProps {
  name: string;
  children: React.ReactNode;
}

export const ClickableTactic: React.FC<ClickableTacticProps> = ({ name, children }) => {
  return (
    <Link 
      to={`/tactics?tactic=${encodeURIComponent(name)}`}
      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
    >
      {children}
    </Link>
  );
};
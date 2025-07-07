
import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Clock } from 'lucide-react';
import { useAuth } from './AuthProvider';

const UserMenu = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Get display name from username
  const displayName = user.username;

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="text-right">
        <p className="text-xs sm:text-sm font-medium text-foreground">{displayName}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{user.days_remaining} days left</span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={logout}
        className="gap-2 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Sign Out</span>
      </Button>
    </div>
  );
};

export default UserMenu;

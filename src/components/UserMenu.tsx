
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
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-sm">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{displayName}</span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {user.days_remaining} days left
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={logout}
        className="gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </div>
  );
};

export default UserMenu;

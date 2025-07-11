import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { Loader2, Users, Calendar, Shield, Trash2, RefreshCw, LogOut } from 'lucide-react';

interface TempUser {
  id: string;
  username: string;
  password: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  days_remaining?: number;
}

const UsersList = () => {
  const [users, setUsers] = useState<TempUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loggingOutId, setLoggingOutId] = useState<string | null>(null);
  const { toast } = useToast();
  const { logout } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('temp_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate days remaining for each user
      const usersWithDays = await Promise.all(
        (data || []).map(async (user) => {
          const { data: daysData } = await supabase.rpc('get_days_remaining', { user_id: user.id });
          return {
            ...user,
            days_remaining: daysData || 0
          };
        })
      );

      setUsers(usersWithDays);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async (userId: string) => {
    try {
      // Set logout timestamp to force session invalidation
      const logoutTimestamp = new Date().toISOString();
      
      const { error } = await supabase
        .from('temp_users')
        .update({ 
          password: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}` // Change password to invalidate sessions
        })
        .eq('id', userId);

      if (error) throw error;

      // Store the logout event in localStorage for session monitoring
      const logoutEvents = JSON.parse(localStorage.getItem('user_logout_events') || '{}');
      logoutEvents[userId] = logoutTimestamp;
      localStorage.setItem('user_logout_events', JSON.stringify(logoutEvents));

      // Check if the user to be logged out is currently logged in in this session
      const storedUser = localStorage.getItem('temp_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.id === userId) {
            // Use the AuthProvider's logout method to properly clear auth state
            await logout();
            // Force a page reload to ensure complete state reset
            window.location.href = '/auth';
            return;
          }
        } catch (error) {
          // Continue even if parsing fails
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const handleLogoutUser = async (userId: string, username: string) => {
    setLoggingOutId(userId);
    try {
      await logoutUser(userId);
      
      toast({
        title: "User Logged Out",
        description: `User ${username} has been logged out from all sessions`
      });
      
      // Refresh the users list to show updated data
      await fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out user",
        variant: "destructive"
      });
    } finally {
      setLoggingOutId(null);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    setDeletingId(userId);
    try {
      const { error } = await supabase
        .from('temp_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Log out the user if they're currently signed in
      await logoutUser(userId);

      toast({
        title: "User Deleted",
        description: `User ${username} has been deleted and logged out`
      });

      // Refresh the users list
      await fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading users...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            All Users ({users.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell className="font-mono text-sm">{user.password}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className={user.days_remaining && user.days_remaining <= 7 ? "text-red-600 font-medium" : ""}>
                          {user.days_remaining || 0} days
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.expires_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLogoutUser(user.id, user.username)}
                          disabled={loggingOutId === user.id}
                        >
                          {loggingOutId === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <LogOut className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              disabled={deletingId === user.id}
                            >
                              {deletingId === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete user "{user.username}"? This action cannot be undone and will log them out immediately.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id, user.username)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersList;

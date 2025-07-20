import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { Loader2, User, Lock, Shield, Plus, Clock, Users } from 'lucide-react';
import UsersList from '@/components/UsersList';

const AuthPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, adminLogin, logout, isAuthenticated, isAdmin, createUser, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated (but not admin)
  if (isAuthenticated && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await login(username, password);
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await adminLogin(adminCode);
      if (error) {
        toast({
          title: "Admin Login Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Admin Access Granted",
          description: "You can now create user accounts"
        });
      }
    } catch (error) {
      toast({
        title: "Admin Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await createUser(newUsername, newPassword);
      if (error) {
        toast({
          title: "User Creation Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "User Created Successfully",
          description: `Account for ${newUsername} created with 30-day access`
        });
        setNewUsername('');
        setNewPassword('');
      }
    } catch (error) {
      toast({
        title: "User Creation Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Admin Panel View
  if (isAdmin) {
    return (
      <div className="min-h-screen p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/50 to-primary/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,hsl(var(--primary)/0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,hsl(var(--secondary)/0.1),transparent_50%)]"></div>
        
        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          <Card className="glass border-primary/20">
            <CardHeader className="text-center relative">
              <CardTitle className="text-3xl font-bold flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                <Shield className="w-8 h-8 text-primary glow-primary" />
                Admin Neural Interface
              </CardTitle>
              <p className="text-muted-foreground text-lg">Advanced user management and control systems</p>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent blur-3xl"></div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create">Create User</TabsTrigger>
                  <TabsTrigger value="users">View Users</TabsTrigger>
                </TabsList>
                
                <TabsContent value="create" className="space-y-4">
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-username">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="new-username"
                          type="text"
                          placeholder="Enter username"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating User...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create User Account
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="users">
                  <UsersList />
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 pt-6 border-t">
                <Button variant="outline" onClick={logout} className="w-full">
                  <Lock className="mr-2 h-4 w-4" />
                  Exit Admin Panel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/50 to-primary/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,hsl(var(--secondary)/0.15),transparent_50%)]"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <Card className="w-full max-w-md glass border-primary/30 glow-primary relative z-10">
        <CardHeader className="text-center relative">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Neural Access Portal
          </CardTitle>
          <p className="text-muted-foreground text-lg">Secure authentication gateway</p>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent blur-2xl"></div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">User Login</TabsTrigger>
              <TabsTrigger value="admin">Admin Access</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-code">Admin Code</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="admin-code"
                      type="password"
                      placeholder="Enter admin code"
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Access
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { Loader2, User, Lock, Shield, Plus, Clock, Users, Sparkles, KeyRound, LogIn } from 'lucide-react';
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
          description: "Welcome to the admin panel"
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
          title: "Failed to Create User",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "User Created",
          description: `User ${newUsername} created successfully`
        });
        setNewUsername('');
        setNewPassword('');
      }
    } catch (error) {
      toast({
        title: "Failed to Create User",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full gradient-bg-subtle relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-3/10 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-md space-y-8 md:space-y-10">
          {/* Logo/Title */}
          <div className="text-center space-y-2 animate-float">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 glow-md">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">PitchArchitect</h1>
            <p className="text-muted-foreground">AI-Powered Script Generation</p>
          </div>

          {isAdmin ? (
            <Card className="glass-effect border-border/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center gradient-text">Admin Panel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center p-4 glass-effect rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Admin Mode Active</span>
                  </div>
                  <Button
                    onClick={logout}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    Logout
                  </Button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-username" className="text-sm font-medium text-muted-foreground">New Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="new-username"
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="pl-10 input-futuristic"
                        placeholder="Enter username"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium text-muted-foreground">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 input-futuristic"
                        placeholder="Enter password"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-futuristic text-white font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating User...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create User
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-8">
                  <UsersList />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 glass-effect border-border/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  <User className="w-4 h-4 mr-2" />
                  User Login
                </TabsTrigger>
                <TabsTrigger value="admin" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <Card className="glass-effect border-border/50 shadow-2xl card-futuristic">
                  <CardHeader className="pb-6 pt-8">
                    <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium text-muted-foreground">Username</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10 input-futuristic"
                            placeholder="Enter your username"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 input-futuristic"
                            placeholder="Enter your password"
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-futuristic text-white font-medium"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign In
                          </>
                        )}
                      </Button>
                    </form>

                    {user && (
                      <div className="mt-6 p-4 glass-effect rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Logged in as:</span>
                          <span className="font-medium">{user.username}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Days remaining:</span>
                          <span className="font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {user.days_remaining} days
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Demo account info */}
                    <div className="mt-6 p-4 glass-effect rounded-lg border border-primary/20">
                      <p className="text-xs text-muted-foreground text-center">
                        Demo Account: <span className="text-primary">demo</span> / <span className="text-primary">demo123</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="admin" className="mt-6">
                <Card className="glass-effect border-border/50 shadow-2xl card-futuristic">
                  <CardHeader className="pb-6 pt-8">
                    <CardTitle className="text-2xl font-bold text-center">Admin Access</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-8">
                    <form onSubmit={handleAdminLogin} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="admin-code" className="text-sm font-medium text-muted-foreground">Admin Code</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="admin-code"
                            type="password"
                            value={adminCode}
                            onChange={(e) => setAdminCode(e.target.value)}
                            className="pl-10 input-futuristic"
                            placeholder="Enter admin code"
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-futuristic text-white font-medium"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Access Admin Panel
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="mt-6 p-4 glass-effect rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        <p>Admin access allows you to create and manage user accounts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 PitchArchitect. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
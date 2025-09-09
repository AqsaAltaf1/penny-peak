import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/components/Navbar";
import { LogIn, UserPlus, DollarSign, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AuthPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Mock login - replace with actual authentication
      if (loginForm.email && loginForm.password) {
        toast.success("Login successful!");
        navigate('/dashboard');
      } else {
        setError("Please fill in all fields");
      }
    } catch (error: any) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Mock registration - replace with actual authentication
      if (registerForm.name && registerForm.email && registerForm.password && registerForm.confirmPassword) {
        if (registerForm.password !== registerForm.confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        toast.success("Registration successful!");
        navigate('/dashboard');
      } else {
        setError("Please fill in all fields");
      }
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      toast.success('Demo mode activated! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      setError("Demo mode failed to activate");
      toast.error("Demo activation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar showAuthButtons={false} />
      
      <div className="flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 neomorph-raised rounded-2xl flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Expense Tracker
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Take control of your finances with beautiful insights
            </p>
          </div>

          {/* Auth Form */}
          <Card className="neomorph-raised border-0 shadow-none">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 neomorph-inset p-1">
                <TabsTrigger 
                  value="login" 
                  className="neomorph-button border-0 data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="neomorph-button border-0 data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <CardHeader className="pb-4">
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>
                    Sign in to your account to continue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="neomorph-inset border-0 focus:ring-2 focus:ring-primary focus:ring-offset-0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">
                        Password <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="neomorph-inset border-0 focus:ring-2 focus:ring-primary focus:ring-offset-0 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {error && (
                      <Alert className="neomorph-inset border-0">
                        <AlertDescription className="text-destructive">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-3">
                      <Button 
                        type="submit" 
                        className="w-full neomorph-button border-0 gradient-primary text-primary-foreground"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                      
                      {/* Forgot Password Link - Bottom Right */}
                      <div className="text-right">
                        <button
                          type="button"
                          className="text-sm text-primary hover:text-primary/80 transition-colors"
                          disabled={isLoading}
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </TabsContent>

              <TabsContent value="register">
                <CardHeader className="pb-4">
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Sign up to start tracking your expenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-name">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className="neomorph-inset border-0 focus:ring-2 focus:ring-primary focus:ring-offset-0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="neomorph-inset border-0 focus:ring-2 focus:ring-primary focus:ring-offset-0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">
                        Password <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showRegisterPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          className="neomorph-inset border-0 focus:ring-2 focus:ring-primary focus:ring-offset-0 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="register-confirm-password">
                        Confirm Password <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="register-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                          className="neomorph-inset border-0 focus:ring-2 focus:ring-primary focus:ring-offset-0 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <Alert className="neomorph-inset border-0">
                        <AlertDescription className="text-destructive">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full neomorph-button border-0 gradient-primary text-primary-foreground"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Demo Login */}
          <Card className="neomorph-raised border-0 shadow-none">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Want to try it out first?
                </p>
                <Button
                  onClick={handleDemoLogin}
                  variant="outline"
                  className="w-full neomorph-button border-0 hover:gradient-primary hover:text-primary-foreground transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading demo...
                    </>
                  ) : (
                    "Try Demo (No Signup)"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/50 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 All rights reserved by aqsaaltaf01@gmail.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

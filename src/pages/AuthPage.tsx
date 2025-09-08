import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useApp } from "@/contexts/AppContext";
import { authService } from "@/services/supabaseService";
import { LogIn, UserPlus, DollarSign, Mail, Shield, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AuthPage() {
  const { login, register, registerWithOTP, checkEmailExists } = useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryStatus, setRetryStatus] = useState("");
  
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

  // Password validation function
  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const isValid = Object.values(requirements).every(req => req);
    return { requirements, isValid };
  };

  const passwordValidation = validatePassword(registerForm.password);

  // Form validation functions
  const isLoginFormValid = () => {
    return loginForm.email.trim() !== "" && loginForm.password.trim() !== "";
  };

  const isRegisterFormValid = () => {
    return (
      registerForm.name.trim() !== "" &&
      registerForm.email.trim() !== "" &&
      registerForm.password.trim() !== "" &&
      registerForm.confirmPassword.trim() !== "" &&
      passwordValidation.isValid &&
      registerForm.password === registerForm.confirmPassword
    );
  };

  const isOTPFormValid = () => {
    return (
      registerForm.name.trim() !== "" &&
      registerForm.email.trim() !== "" &&
      registerForm.password.trim() !== "" &&
      registerForm.confirmPassword.trim() !== "" &&
      passwordValidation.isValid &&
      registerForm.password === registerForm.confirmPassword
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setRetryStatus("");

    // Validate required fields
    if (!isLoginFormValid()) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(loginForm.email, loginForm.password);
      if (!success) {
        setError("Invalid email or password");
      }
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
      setRetryStatus("");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setRetryStatus("");

    // Validate required fields first
    if (!registerForm.name.trim()) {
      setError("Full name is required");
      setIsLoading(false);
      return;
    }

    if (!registerForm.email.trim()) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!registerForm.password.trim()) {
      setError("Password is required");
      setIsLoading(false);
      return;
    }

    if (!registerForm.confirmPassword.trim()) {
      setError("Please confirm your password");
      setIsLoading(false);
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!passwordValidation.isValid) {
      setError("Password does not meet all requirements");
      setIsLoading(false);
      return;
    }

    try {
      // The register function now handles email checking internally
      const result = await register(registerForm.email, registerForm.name, registerForm.password);
      if (result.success) {
        if (result.needsConfirmation) {
          setError(""); // Clear any previous errors
          toast.success(result.message || "Please check your email to confirm your account");
        } else {
          toast.success("Registration successful!");
        }
      }
    } catch (error) {
      const errorMessage = error.message || "Registration failed. Please try again.";
      if (errorMessage.includes('email service') || errorMessage.includes('confirmation email') || errorMessage.includes('Server configuration') || errorMessage.includes('not configured properly')) {
        setError(`${errorMessage} 

🎮 Click "Try Demo (No Signup)" below for instant access to the full app!`);
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('Too many')) {
        setError(`${errorMessage} 

🎮 Try the demo mode below for instant access!`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate all required fields for OTP signup
    if (!registerForm.name.trim()) {
      setError("Full name is required");
      setIsLoading(false);
      return;
    }

    if (!registerForm.email.trim()) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!registerForm.password.trim()) {
      setError("Password is required");
      setIsLoading(false);
      return;
    }

    if (!registerForm.confirmPassword.trim()) {
      setError("Please confirm your password");
      setIsLoading(false);
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!passwordValidation.isValid) {
      setError("Password does not meet all requirements");
      setIsLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      // The registerWithOTP function now handles email checking internally
      const result = await registerWithOTP(registerForm.email, registerForm.name, registerForm.password);
      
      if (result.success && result.needsConfirmation) {
        toast.success('Verification code sent to your email!');
        navigate(`/verify-email?email=${encodeURIComponent(registerForm.email)}`);
      } else {
        toast.success("Registration successful!");
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send verification code';
      if (errorMessage.includes('email service') || errorMessage.includes('confirmation email') || errorMessage.includes('Server configuration') || errorMessage.includes('not configured properly')) {
        setError(`${errorMessage} \n\n🎮 Click "Try Demo (No Signup)" below for instant access to the full app!`);
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('Too many')) {
        setError(`${errorMessage} \n\n🎮 Try the demo mode below for instant access!`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Create demo user in localStorage FIRST
      const demoUser = {
        id: 'demo-user-' + Date.now(),
        email: 'demo@example.com', 
        name: 'Demo User',
        createdAt: new Date().toISOString()
      };
      
      // Clear any existing data first
      localStorage.removeItem('expense_tracker_transactions');
      localStorage.removeItem('expense_tracker_savings_goals');
      
      // Set demo mode flag and user
      localStorage.setItem('demo_mode', 'true');
      localStorage.setItem('expense_tracker_user', JSON.stringify(demoUser));
      
      // Generate demo data directly here to ensure it works
      const demoTransactions = [
        {
          id: 'demo-1',
          userId: demoUser.id,
          type: "expense",
          amount: 45.80,
          category: "Food & Dining",
          description: "Lunch at downtown cafe",
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-2', 
          userId: demoUser.id,
          type: "income",
          amount: 2500.00,
          category: "Salary",
          description: "Monthly salary",
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-3',
          userId: demoUser.id,
          type: "expense",
          amount: 89.99,
          category: "Shopping", 
          description: "Online purchase",
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        }
      ];
      
      const demoGoals = [
        {
          id: 'goal-1',
          userId: demoUser.id,
          title: "Emergency Fund",
          target: 10000,
          current: 6500,
          deadline: "2024-12-31",
          color: "hsl(var(--primary))",
          createdAt: new Date().toISOString()
        },
        {
          id: 'goal-2',
          userId: demoUser.id,
          title: "Vacation Fund",
          target: 3000,
          current: 1200,
          deadline: "2024-06-30", 
          color: "hsl(var(--accent))",
          createdAt: new Date().toISOString()
        }
      ];
      
      // Store demo data directly
      localStorage.setItem('expense_tracker_transactions', JSON.stringify(demoTransactions));
      localStorage.setItem('expense_tracker_savings_goals', JSON.stringify(demoGoals));
      
      console.log('Demo data created:', { demoUser, demoTransactions, demoGoals });
      
      toast.success('Demo mode activated! Redirecting to dashboard...');
      
      // Small delay then redirect
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      setError("Demo mode failed to activate");
      toast.error("Demo activation failed");
      console.error('Demo error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
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
                  
                  {retryStatus && (
                    <Alert className="neomorph-inset border-0">
                      <AlertDescription className="text-blue-600">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {retryStatus}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  
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
                    disabled={isLoading || !isLoginFormValid()}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
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
                    
                    {/* Password Requirements */}
                    {registerForm.password && (
                      <div className="mt-2 p-3 neomorph-inset rounded-lg space-y-2">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Password Requirements:</p>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          <div className={`flex items-center gap-2 ${passwordValidation.requirements.length ? 'text-success' : 'text-muted-foreground'}`}>
                            {passwordValidation.requirements.length ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                            At least 6 characters
                          </div>
                          <div className={`flex items-center gap-2 ${passwordValidation.requirements.uppercase ? 'text-success' : 'text-muted-foreground'}`}>
                            {passwordValidation.requirements.uppercase ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                            One uppercase letter (A-Z)
                          </div>
                          <div className={`flex items-center gap-2 ${passwordValidation.requirements.lowercase ? 'text-success' : 'text-muted-foreground'}`}>
                            {passwordValidation.requirements.lowercase ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                            One lowercase letter (a-z)
                          </div>
                          <div className={`flex items-center gap-2 ${passwordValidation.requirements.number ? 'text-success' : 'text-muted-foreground'}`}>
                            {passwordValidation.requirements.number ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                            One number (0-9)
                          </div>
                          <div className={`flex items-center gap-2 ${passwordValidation.requirements.special ? 'text-success' : 'text-muted-foreground'}`}>
                            {passwordValidation.requirements.special ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                            One special character (!@#$%^&*)
                          </div>
                        </div>
                      </div>
                    )}
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
                    
                    {/* Password Match Indicator */}
                    {registerForm.confirmPassword && (
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        {registerForm.password === registerForm.confirmPassword ? (
                          <>
                            <Check className="h-3 w-3 text-success" />
                            <span className="text-success">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 text-destructive" />
                            <span className="text-destructive">Passwords don't match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {retryStatus && (
                    <Alert className="neomorph-inset border-0">
                      <AlertDescription className="text-blue-600">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {retryStatus}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert className="neomorph-inset border-0">
                      <AlertDescription className="text-destructive">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="button"
                    onClick={handleOTPSignup}
                    className="w-full neomorph-button border-0 gradient-primary text-primary-foreground"
                    disabled={isLoading || !isOTPFormValid()}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {isLoading ? "Creating account..." : "Register with 6-Digit Code"}
                  </Button>
                  
                  <div className="neomorph-inset p-3 rounded-lg mt-4">
                    <p className="text-xs text-muted-foreground text-center">
                      📧 You'll receive a <strong>6-digit verification code</strong> via email<br />
                      🔐 After verification, you can login with your email & password
                    </p>
                  </div>
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
                {isLoading ? "Loading demo..." : "Try Demo (No Signup)"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Your data is stored locally in your browser for privacy
          </p>
        </div>
      </div>
    </div>
  );
}

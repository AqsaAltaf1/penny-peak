import { useState, useEffect } from "react";
import { StatsCard } from "./StatsCard";
import { QuickAddTransaction } from "./QuickAddTransaction";
import { ExpenseChart } from "./ExpenseChart";
import { SavingsGoals } from "./SavingsGoals";
import { RecentTransactions } from "./RecentTransactions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { analyticsService, exportService } from "@/services/supabaseService";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Target, LogOut, Download, Database } from "lucide-react";
import { toast } from "sonner";

export function DashboardLayout() {
  const { auth, logout, loadDemoData, transactions } = useApp();
  const [stats, setStats] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0
  });

  // Calculate stats when transactions change
  useEffect(() => {
    const calculateStats = async () => {
      try {
        // Check if we're in demo mode
        const isDemoMode = localStorage.getItem('demo_mode') === 'true';
        
        if (isDemoMode) {
          // Use localStorage analytics service for demo mode
          const { analyticsService: localAnalyticsService } = await import('@/services/dataService');
          const newStats = localAnalyticsService.calculateStats();
          setStats(newStats);
        } else {
          // Use Supabase analytics service for authenticated users
          const newStats = await analyticsService.calculateStats();
          setStats(newStats);
        }
      } catch (error) {
        console.error('Failed to calculate stats:', error);
      }
    };
    
    calculateStats();
  }, [transactions]);

  const handleLoadDemoData = async () => {
    try {
      await loadDemoData();
      toast.success("Demo data loaded successfully!");
    } catch (error) {
      toast.error("Failed to load demo data");
      console.error("Demo data error:", error);
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportService.downloadCSV();
      toast.success("CSV exported successfully!");
    } catch (error) {
      toast.error("Failed to export CSV");
      console.error("Export error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome back, {auth.user?.name}!
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground">
              Take control of your finances with beautiful insights
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              {localStorage.getItem('demo_mode') === 'true' && (
                <Badge variant="secondary" className="neomorph-inset border-0 px-2 py-1 text-xs bg-orange-100 text-orange-800">
                  🎮 Demo Mode
                </Badge>
              )}
              <Badge variant="outline" className="neomorph-inset border-0 px-3 py-1 text-xs truncate max-w-full">
                {auth.user?.email}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="neomorph-button border-0 text-xs"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              
              {/* Only show demo data button for new users with no transactions */}
              {transactions.length === 0 && (
                <Button
                  onClick={handleLoadDemoData}
                  variant="outline"
                  size="sm"
                  className="neomorph-button border-0 text-xs"
                >
                  <Database className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Load Demo</span>
                </Button>
              )}
              
              <Button
                onClick={() => {
                  // Check if in demo mode
                  const isDemoMode = localStorage.getItem('demo_mode') === 'true';
                  if (isDemoMode) {
                    // Clear demo mode
                    localStorage.removeItem('demo_mode');
                    localStorage.removeItem('expense_tracker_user');
                    localStorage.removeItem('expense_tracker_transactions');
                    localStorage.removeItem('expense_tracker_savings_goals');
                    toast.success('Demo mode ended');
                    window.location.href = '/';
                  } else {
                    logout();
                  }
                }}
                variant="outline"
                size="sm"
                className="neomorph-button border-0 text-xs"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {localStorage.getItem('demo_mode') === 'true' ? 'Exit Demo' : 'Logout'}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatsCard
            title="Total Balance"
            value={`$${stats.totalBalance.toLocaleString()}`}
            icon={<Wallet className="h-5 w-5 text-primary" />}
            trend={{ value: "8.2%", isPositive: true }}
          />
          <StatsCard
            title="Monthly Income"
            value={`$${stats.monthlyIncome.toLocaleString()}`}
            icon={<TrendingUp className="h-5 w-5 text-success" />}
            trend={{ value: "12.5%", isPositive: true }}
          />
          <StatsCard
            title="Monthly Expenses"
            value={`$${stats.monthlyExpenses.toLocaleString()}`}
            icon={<TrendingDown className="h-5 w-5 text-destructive" />}
            trend={{ value: "3.1%", isPositive: false }}
          />
          <StatsCard
            title="Savings Rate"
            value={`${stats.savingsRate}%`}
            icon={<Target className="h-5 w-5 text-accent" />}
            trend={{ value: "2.8%", isPositive: true }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <QuickAddTransaction />
              <ExpenseChart />
            </div>
            <RecentTransactions />
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:space-y-8">
            <SavingsGoals />
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground neomorph-inset p-4 rounded-lg inline-block">
            💡 <strong>Note:</strong> Your data is securely stored in the cloud database. Export to CSV for additional backup.
          </p>
        </div>
      </div>
    </div>
  );
}
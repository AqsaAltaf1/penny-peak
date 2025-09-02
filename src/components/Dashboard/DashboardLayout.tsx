import { StatsCard } from "./StatsCard";
import { QuickAddTransaction } from "./QuickAddTransaction";
import { ExpenseChart } from "./ExpenseChart";
import { SavingsGoals } from "./SavingsGoals";
import { RecentTransactions } from "./RecentTransactions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { analyticsService, exportService } from "@/services/dataService";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Target, LogOut, Download, Database } from "lucide-react";

export function DashboardLayout() {
  const { auth, logout, loadDemoData } = useApp();
  
  // Calculate real stats from transactions
  const stats = analyticsService.calculateStats();

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
            <Badge variant="outline" className="neomorph-inset border-0 px-3 py-1 text-xs truncate max-w-full">
              {auth.user?.email}
            </Badge>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => exportService.downloadCSV()}
                variant="outline"
                size="sm"
                className="neomorph-button border-0 text-xs"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button
                onClick={loadDemoData}
                variant="outline"
                size="sm"
                className="neomorph-button border-0 text-xs"
              >
                <Database className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Demo Data</span>
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="neomorph-button border-0 text-xs"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
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
            💡 <strong>Note:</strong> Your data is stored locally in your browser. Export to CSV to backup your transactions.
          </p>
        </div>
      </div>
    </div>
  );
}
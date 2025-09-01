import { StatsCard } from "./StatsCard";
import { QuickAddTransaction } from "./QuickAddTransaction";
import { ExpenseChart } from "./ExpenseChart";
import { SavingsGoals } from "./SavingsGoals";
import { RecentTransactions } from "./RecentTransactions";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";

export function DashboardLayout() {
  // Mock data - will be replaced with Supabase data
  const stats = {
    totalBalance: 12580.50,
    monthlyIncome: 4200.00,
    monthlyExpenses: 2800.75,
    savingsRate: 33.3
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Expense Tracker
          </h1>
          <p className="text-lg text-muted-foreground">
            Take control of your finances with beautiful insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <QuickAddTransaction />
              <ExpenseChart />
            </div>
            <RecentTransactions />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <SavingsGoals />
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground neomorph-inset p-4 rounded-lg inline-block">
            💡 <strong>Note:</strong> Connect to Supabase to store your real transaction data and enable user authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
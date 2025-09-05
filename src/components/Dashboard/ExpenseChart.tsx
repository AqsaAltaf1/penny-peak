import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsService } from "@/services/supabaseService";
import { useApp } from "@/contexts/AppContext";

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label for small slices

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function ExpenseChart() {
  const { transactions } = useApp();
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadExpenseData = async () => {
      try {
        if (transactions.length > 0) {
          // Check if we're in demo mode
          const isDemoMode = localStorage.getItem('demo_mode') === 'true';
          
          if (isDemoMode) {
            // Use localStorage analytics service for demo mode
            const { analyticsService: localAnalyticsService } = await import('@/services/dataService');
            const data = localAnalyticsService.getCategoryData('expense');
            setExpenseData(data);
            setTotal(data.reduce((sum, item) => sum + item.value, 0));
          } else {
            // Use Supabase analytics service for authenticated users
            const data = await analyticsService.getCategoryData('expense');
            setExpenseData(data);
            setTotal(data.reduce((sum, item) => sum + item.value, 0));
          }
        } else {
          setExpenseData([]);
          setTotal(0);
        }
      } catch (error) {
        console.error('Failed to load expense data:', error);
      }
    };

    loadExpenseData();
  }, [transactions]);

  return (
    <Card className="neomorph-raised border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          Expense Breakdown
          <span className="text-sm font-medium text-muted-foreground">
            Total: ${total.toLocaleString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenseData.length > 0 ? (
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--neomorph-base))',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-raised)'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 sm:h-80 flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No expense data available</p>
              <p className="text-sm text-muted-foreground">Add some transactions to see the breakdown</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
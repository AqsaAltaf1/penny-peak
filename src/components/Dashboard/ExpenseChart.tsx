import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const expenseData = [
  { name: "Food & Dining", value: 890, color: "#ef4444" },
  { name: "Transportation", value: 450, color: "#f97316" },
  { name: "Shopping", value: 320, color: "#eab308" },
  { name: "Entertainment", value: 280, color: "#22c55e" },
  { name: "Bills & Utilities", value: 650, color: "#3b82f6" },
  { name: "Other", value: 210, color: "#8b5cf6" },
];

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
  const total = expenseData.reduce((sum, item) => sum + item.value, 0);

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
        <div className="h-80">
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
                formatter={(value: number) => [`$${value}`, 'Amount']}
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
      </CardContent>
    </Card>
  );
}
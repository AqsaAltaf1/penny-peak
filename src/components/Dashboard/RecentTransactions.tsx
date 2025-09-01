import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  time: string;
}

const recentTransactions: Transaction[] = [
  {
    id: "1",
    type: "expense",
    amount: 45.80,
    category: "Food & Dining",
    description: "Lunch at downtown cafe",
    date: "Today",
    time: "2:30 PM"
  },
  {
    id: "2",
    type: "income",
    amount: 2500.00,
    category: "Salary",
    description: "Monthly salary",
    date: "Yesterday",
    time: "9:00 AM"
  },
  {
    id: "3",
    type: "expense",
    amount: 89.99,
    category: "Shopping",
    description: "Online purchase",
    date: "Yesterday",
    time: "4:15 PM"
  },
  {
    id: "4",
    type: "expense",
    amount: 15.00,
    category: "Transportation",
    description: "Uber ride",
    date: "2 days ago",
    time: "8:45 AM"
  },
  {
    id: "5",
    type: "income",
    amount: 350.00,
    category: "Freelance",
    description: "Website design project",
    date: "3 days ago",
    time: "11:30 AM"
  }
];

export function RecentTransactions() {
  return (
    <Card className="neomorph-raised border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <div className="neomorph-inset p-2 rounded-lg">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80 px-6">
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-4 neomorph-soft rounded-lg hover:neomorph-raised transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "neomorph-inset p-2 rounded-lg",
                    transaction.type === "income" ? "text-success" : "text-destructive"
                  )}>
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {transaction.description}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="secondary"
                        className="text-xs neomorph-inset border-0"
                      >
                        {transaction.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {transaction.date} • {transaction.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "font-semibold",
                  transaction.type === "income" ? "text-success" : "text-destructive"
                )}>
                  {transaction.type === "income" ? "+" : "-"}${transaction.amount}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
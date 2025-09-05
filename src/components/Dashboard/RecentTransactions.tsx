import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { ArrowUpRight, ArrowDownLeft, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days ago`;
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
}

export function RecentTransactions() {
  const { transactions, deleteTransaction } = useApp();
  
  // Get the 10 most recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast.success("Transaction deleted successfully");
    } catch (error) {
      toast.error("Failed to delete transaction");
      console.error("Delete error:", error);
    }
  };

  return (
    <Card className="neomorph-raised border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <div className="neomorph-inset p-2 rounded-lg">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          Recent Transactions
          <Badge variant="secondary" className="ml-auto neomorph-inset border-0">
            {recentTransactions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64 sm:h-80 px-4 sm:px-6">
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-3 sm:p-4 neomorph-soft rounded-lg hover:neomorph-raised transition-all duration-200"
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
                        {formatDate(transaction.date)} • {formatTime(transaction.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "font-semibold",
                    transaction.type === "income" ? "text-success" : "text-destructive"
                  )}>
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="h-8 w-8 p-0 neomorph-button border-0 hover:neomorph-inset"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground">Add your first transaction to get started</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
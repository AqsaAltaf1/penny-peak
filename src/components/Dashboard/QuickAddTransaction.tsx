import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuickAddTransaction() {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const expenseCategories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Other"
  ];

  const incomeCategories = [
    "Salary",
    "Freelance",
    "Investment",
    "Business",
    "Gift",
    "Other"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: This will be implemented with Supabase integration
    console.log({ type, amount, category, description });
    // Reset form
    setAmount("");
    setCategory("");
    setDescription("");
  };

  return (
    <Card className="neomorph-raised border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <div className="neomorph-inset p-2 rounded-lg">
            {type === "income" ? (
              <Plus className="h-4 w-4 text-success" />
            ) : (
              <Minus className="h-4 w-4 text-destructive" />
            )}
          </div>
          Quick Add Transaction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === "income" ? "default" : "outline"}
            onClick={() => setType("income")}
            className={cn(
              "flex-1 neomorph-button border-0",
              type === "income" && "gradient-success text-success-foreground"
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
            Income
          </Button>
          <Button
            type="button"
            variant={type === "expense" ? "default" : "outline"}
            onClick={() => setType("expense")}
            className={cn(
              "flex-1 neomorph-button border-0",
              type === "expense" && "gradient-warning text-warning-foreground"
            )}
          >
            <Minus className="h-4 w-4 mr-2" />
            Expense
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount" className="text-sm font-medium mb-2 block">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="neomorph-inset border-0 focus:ring-2 focus:ring-primary focus:ring-offset-0"
              required
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-sm font-medium mb-2 block">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="neomorph-inset border-0 focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="neomorph-raised border-0">
                {(type === "income" ? incomeCategories : expenseCategories).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium mb-2 block">Description</Label>
            <Input
              id="description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="neomorph-inset border-0 focus:ring-2 focus:ring-primary focus:ring-offset-0"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full neomorph-button border-0 gradient-primary text-primary-foreground font-medium"
          >
            Add Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
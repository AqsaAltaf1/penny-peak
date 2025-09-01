import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus } from "lucide-react";

interface SavingsGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  color: string;
}

const savingsGoals: SavingsGoal[] = [
  {
    id: "1",
    title: "Emergency Fund",
    target: 10000,
    current: 6500,
    deadline: "Dec 2024",
    color: "hsl(var(--primary))"
  },
  {
    id: "2", 
    title: "Vacation Fund",
    target: 3000,
    current: 1200,
    deadline: "Jun 2024",
    color: "hsl(var(--accent))"
  },
  {
    id: "3",
    title: "New Car",
    target: 25000,
    current: 8500,
    deadline: "Mar 2025", 
    color: "hsl(var(--success))"
  }
];

export function SavingsGoals() {
  return (
    <Card className="neomorph-raised border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="neomorph-inset p-2 rounded-lg">
              <Target className="h-4 w-4 text-primary" />
            </div>
            Savings Goals
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="neomorph-button border-0 h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {savingsGoals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          
          return (
            <div key={goal.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">{goal.title}</h4>
                  <p className="text-sm text-muted-foreground">{goal.deadline}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    ${goal.current.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    of ${goal.target.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Progress 
                  value={progress} 
                  className="h-2 neomorph-inset"
                  style={{
                    background: 'hsl(var(--neomorph-base))',
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{progress.toFixed(1)}% complete</span>
                  <span>${(goal.target - goal.current).toLocaleString()} remaining</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApp } from "@/contexts/AppContext";
import { Target, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function SavingsGoals() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useApp();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState({
    title: "",
    target: "",
    current: "",
    deadline: "",
    color: "hsl(var(--primary))",
  });

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSavingsGoal({
        title: goalForm.title,
        target: parseFloat(goalForm.target),
        current: parseFloat(goalForm.current) || 0,
        deadline: goalForm.deadline,
        color: goalForm.color,
      });
      setIsAddingGoal(false);
      setGoalForm({ title: "", target: "", current: "", deadline: "", color: "hsl(var(--primary))" });
      toast.success("Savings goal added successfully!");
    } catch (error) {
      toast.error("Failed to add savings goal");
      console.error("Add goal error:", error);
    }
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    
    try {
      await updateSavingsGoal(editingGoal, {
        title: goalForm.title,
        target: parseFloat(goalForm.target),
        current: parseFloat(goalForm.current),
        deadline: goalForm.deadline,
        color: goalForm.color,
      });
      setEditingGoal(null);
      setGoalForm({ title: "", target: "", current: "", deadline: "", color: "hsl(var(--primary))" });
      toast.success("Savings goal updated successfully!");
    } catch (error) {
      toast.error("Failed to update savings goal");
      console.error("Update goal error:", error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteSavingsGoal(id);
      toast.success("Savings goal deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete savings goal");
      console.error("Delete goal error:", error);
    }
  };

  const openEditDialog = (goal: any) => {
    setGoalForm({
      title: goal.title,
      target: goal.target.toString(),
      current: goal.current.toString(),
      deadline: goal.deadline,
      color: goal.color,
    });
    setEditingGoal(goal.id);
  };

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
          <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
            <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="neomorph-button border-0 h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
            </DialogTrigger>
            <DialogContent className="neomorph-raised border-0">
              <DialogHeader>
                <DialogTitle>Add New Savings Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div>
                  <Label htmlFor="goal-title">Goal Title</Label>
                  <Input
                    id="goal-title"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    placeholder="e.g., Emergency Fund"
                    className="neomorph-inset border-0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="goal-target">Target Amount</Label>
                  <Input
                    id="goal-target"
                    type="number"
                    step="0.01"
                    value={goalForm.target}
                    onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                    placeholder="10000"
                    className="neomorph-inset border-0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="goal-current">Current Amount</Label>
                  <Input
                    id="goal-current"
                    type="number"
                    step="0.01"
                    value={goalForm.current}
                    onChange={(e) => setGoalForm({ ...goalForm, current: e.target.value })}
                    placeholder="0"
                    className="neomorph-inset border-0"
                  />
                </div>
                <div>
                  <Label htmlFor="goal-deadline">Deadline</Label>
                  <Input
                    id="goal-deadline"
                    type="date"
                    value={goalForm.deadline}
                    onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                    className="neomorph-inset border-0"
                    required
                  />
                </div>
                <Button type="submit" className="w-full neomorph-button border-0 gradient-primary text-primary-foreground">
                  Add Goal
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {savingsGoals.length > 0 ? (
          savingsGoals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          
          return (
            <div key={goal.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">{goal.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(goal.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    ${goal.current.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    of ${goal.target.toLocaleString()}
                  </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(goal)}
                    className="h-8 w-8 p-0 neomorph-button border-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="h-8 w-8 p-0 neomorph-button border-0"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
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
        })
        ) : (
          <div className="text-center space-y-4 py-8">
            <p className="text-muted-foreground">No savings goals yet</p>
            <p className="text-sm text-muted-foreground">Create your first savings goal to start tracking progress</p>
          </div>
        )}

        {/* Edit Goal Dialog */}
        <Dialog open={editingGoal !== null} onOpenChange={(open) => !open && setEditingGoal(null)}>
          <DialogContent className="neomorph-raised border-0">
            <DialogHeader>
              <DialogTitle>Edit Savings Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateGoal} className="space-y-4">
              <div>
                <Label htmlFor="edit-goal-title">Goal Title</Label>
                <Input
                  id="edit-goal-title"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  placeholder="e.g., Emergency Fund"
                  className="neomorph-inset border-0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-goal-target">Target Amount</Label>
                <Input
                  id="edit-goal-target"
                  type="number"
                  step="0.01"
                  value={goalForm.target}
                  onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                  placeholder="10000"
                  className="neomorph-inset border-0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-goal-current">Current Amount</Label>
                <Input
                  id="edit-goal-current"
                  type="number"
                  step="0.01"
                  value={goalForm.current}
                  onChange={(e) => setGoalForm({ ...goalForm, current: e.target.value })}
                  placeholder="0"
                  className="neomorph-inset border-0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-goal-deadline">Deadline</Label>
                <Input
                  id="edit-goal-deadline"
                  type="date"
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                  className="neomorph-inset border-0"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingGoal(null)}
                  className="flex-1 neomorph-button border-0"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 neomorph-button border-0 gradient-primary text-primary-foreground"
                >
                  Update Goal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
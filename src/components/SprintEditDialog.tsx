
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store";
import { Sprint } from "@/types";
import { useState } from "react";
import { Textarea } from "./ui/textarea";

interface SprintEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint: Sprint;
}

export function SprintEditDialog({
  open,
  onOpenChange,
  sprint
}: SprintEditDialogProps) {
  const { updateSprint } = useAppStore();
  const { toast } = useToast();

  const [name, setName] = useState(sprint.name);
  const [goal, setGoal] = useState(sprint.goal || "");
  const [startDate, setStartDate] = useState(sprint.startDate || "");
  const [endDate, setEndDate] = useState(sprint.endDate || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!name.trim()) {
        toast({
          title: "Error",
          description: "Sprint name is required.",
          variant: "destructive",
        });
        return;
      }
      
      const updatedSprint: Sprint = {
        ...sprint,
        name,
        goal: goal.trim() ? goal : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        updatedAt: new Date().toISOString(),
      };
      
      await updateSprint(updatedSprint);
      
      toast({
        title: "Sprint updated",
        description: "Sprint details have been updated successfully.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating sprint:", error);
      toast({
        title: "Error",
        description: "There was a problem updating the sprint.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Sprint</DialogTitle>
            <DialogDescription>
              Update the details of your sprint here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Sprint Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sprint name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal">Sprint Goal</Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What do you want to achieve in this sprint?"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate ? startDate.split('T')[0] : ""}
                  onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value).toISOString() : "")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate ? endDate.split('T')[0] : ""}
                  onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value).toISOString() : "")}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

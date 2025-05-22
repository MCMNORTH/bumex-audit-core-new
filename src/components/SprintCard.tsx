
import { useAppStore } from "@/store";
import { Sprint } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarClock, ChevronDown, ChevronUp, Edit, Play, CheckCircle2, Trash2 } from "lucide-react";
import { useState } from "react";
import { IssueCard } from "./IssueCard";
import { Button } from "./ui/button";
import { SprintEditDialog } from "./SprintEditDialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SprintCardProps {
  sprint: Sprint;
  projectId: string;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (issueId: string) => void;
}

export const SprintCard = ({ sprint, projectId, onDragOver, onDrop, onDragStart }: SprintCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { getIssuesBySprint, updateSprint, deleteSprint, updateIssueSprint } = useAppStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [sprintStatus, setSprintStatus] = useState(sprint.status);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const issues = getIssuesBySprint(sprint.id);
  
  const getStatusBadgeColor = (status: Sprint["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "future":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const handleStartSprint = async () => {
    try {
      const updatedSprint = {
        ...sprint,
        status: "active" as const,
        startDate: sprint.startDate || new Date().toISOString()
      };
      await updateSprint(updatedSprint);
      setSprintStatus("active");
    } catch (error) {
      console.error("Error starting sprint:", error);
    }
  };

  const handleCompleteSprint = async () => {
    try {
      const updatedSprint = {
        ...sprint,
        status: "completed" as const,
        endDate: sprint.endDate || new Date().toISOString()
      };
      await updateSprint(updatedSprint);
      setSprintStatus("completed");
    } catch (error) {
      console.error("Error completing sprint:", error);
    }
  };

  const handleDeleteSprint = async () => {
    try {
      // Move all issues in this sprint back to backlog
      for (const issue of issues) {
        await updateIssueSprint(issue.id, null);
      }
      
      // Delete the sprint
      await deleteSprint(sprint.id);
      
      toast({
        title: "Sprint deleted",
        description: "Sprint has been successfully deleted"
      });
    } catch (error) {
      console.error("Error deleting sprint:", error);
      toast({
        title: "Error",
        description: "Failed to delete sprint",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  
  return (
    <div className="mb-6 rounded-md border bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex flex-col flex-grow cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center">
            <h3 className="font-semibold">{sprint.name}</h3>
            <span className={cn("ml-2 px-2 py-0.5 rounded-full text-xs font-medium", getStatusBadgeColor(sprintStatus))}>
              {sprintStatus.charAt(0).toUpperCase() + sprintStatus.slice(1)}
            </span>
          </div>
          {sprint.goal && (
            <p className="text-sm text-gray-500 mt-1">{sprint.goal}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 flex items-center">
            <CalendarClock className="h-3 w-3 mr-1" />
            {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
          </div>
          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full ml-2">
            {issues.length}
          </span>
          
          <div className="flex gap-1">
            {sprintStatus === "future" && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs h-7"
                onClick={handleStartSprint}
              >
                <Play className="h-3 w-3 mr-1" /> Start
              </Button>
            )}
            
            {sprintStatus === "active" && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs h-7"
                onClick={handleCompleteSprint}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" /> Complete
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditDialogOpen(true);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs h-7 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7 hover:bg-gray-200 group"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500 group-hover:text-gray-900" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-900" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div 
          className="p-4 border-t bg-gray-50" 
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {issues.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
              No issues in this sprint. Drag and drop issues here.
            </div>
          ) : (
            <div className="space-y-2">
              {issues.map((issue) => (
                <div 
                  key={issue.id}
                  draggable
                  onDragStart={() => onDragStart(issue.id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <IssueCard issue={issue} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <SprintEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        sprint={sprint}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the sprint "{sprint.name}". All issues in this sprint will be moved back to the backlog.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSprint} className="bg-red-500 hover:bg-red-600">
              Delete Sprint
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


import { useAppStore } from "@/store";
import { Sprint } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarClock, ChevronDown, ChevronUp, Edit, Play, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { IssueCard } from "./IssueCard";
import { Button } from "./ui/button";
import { SprintEditDialog } from "./SprintEditDialog";

interface SprintCardProps {
  sprint: Sprint;
  projectId: string;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (issueId: string) => void;
}

export const SprintCard = ({ sprint, projectId, onDragOver, onDrop, onDragStart }: SprintCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { getIssuesBySprint, updateSprint } = useAppStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
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
      await updateSprint({
        ...sprint,
        status: "active",
        startDate: sprint.startDate || new Date().toISOString()
      });
    } catch (error) {
      console.error("Error starting sprint:", error);
    }
  };

  const handleCompleteSprint = async () => {
    try {
      await updateSprint({
        ...sprint,
        status: "completed",
        endDate: sprint.endDate || new Date().toISOString()
      });
    } catch (error) {
      console.error("Error completing sprint:", error);
    }
  };
  
  return (
    <div className="mb-6 rounded-md border bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex flex-col flex-grow cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center">
            <h3 className="font-semibold">{sprint.name}</h3>
            <span className={cn("ml-2 px-2 py-0.5 rounded-full text-xs font-medium", getStatusBadgeColor(sprint.status))}>
              {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
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
            {sprint.status === "future" && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs h-7"
                onClick={handleStartSprint}
              >
                <Play className="h-3 w-3 mr-1" /> Start
              </Button>
            )}
            
            {sprint.status === "active" && (
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
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
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
    </div>
  );
};

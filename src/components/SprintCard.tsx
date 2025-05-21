
import { useAppStore } from "@/store";
import { Sprint } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { IssueCard } from "./IssueCard";

interface SprintCardProps {
  sprint: Sprint;
  projectId: string;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (issueId: string) => void;
}

export const SprintCard = ({ sprint, projectId, onDragOver, onDrop, onDragStart }: SprintCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { getIssuesBySprint } = useAppStore();
  
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
  
  return (
    <div className="mb-6 rounded-md border bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex flex-col">
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
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-500">
            {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
          </div>
          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
            {issues.length}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
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
    </div>
  );
};

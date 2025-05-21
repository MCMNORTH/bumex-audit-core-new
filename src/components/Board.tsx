
import { Status } from "@/types";
import { IssueCard } from "./IssueCard";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface BoardProps {
  projectId: string;
}

const columns: { id: Status; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "in-review", title: "In Review" },
  { id: "done", title: "Done" },
];

export const Board = ({ projectId }: BoardProps) => {
  const { getIssuesByProject, updateIssueStatus, getSprintsByProject, fetchIssues, fetchSprints, loading } = useAppStore();
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch issues AND sprints when the component mounts
  useEffect(() => {
    const loadData = async () => {
      if (projectId) {
        console.log("Board: Fetching data for project", projectId);
        await Promise.all([
          fetchIssues(projectId),
          fetchSprints(projectId)
        ]);
      }
    };
    
    loadData();
  }, [projectId, fetchIssues, fetchSprints]);

  const allIssues = getIssuesByProject(projectId);
  
  // Get active sprint
  const sprints = getSprintsByProject(projectId);
  const activeSprint = sprints.find(sprint => sprint.status === "active");
  
  // Filter issues by active sprint
  const issues = activeSprint 
    ? allIssues.filter(issue => issue.sprintId === activeSprint.id)
    : [];

  const issuesByStatus = (status: Status) => {
    return issues.filter((issue) => issue.status === status);
  };

  const handleDragStart = (issueId: string) => {
    setDraggedIssueId(issueId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    
    if (!draggedIssueId) return;
    
    const issue = issues.find(issue => issue.id === draggedIssueId);
    if (!issue) return;
    
    if (issue.status === status) return;
    
    try {
      await updateIssueStatus(draggedIssueId, status);
      toast({
        title: "Issue updated",
        description: `Issue moved to ${columns.find(col => col.id === status)?.title}`
      });
    } catch (error) {
      console.error("Error updating issue status:", error);
      toast({
        title: "Error",
        description: "Failed to update issue status",
        variant: "destructive"
      });
    } finally {
      setDraggedIssueId(null);
    }
  };

  return (
    <div className="p-4 flex gap-4 overflow-x-auto">
      {loading.issues && (
        <div className="w-full text-center py-8">
          <p className="text-gray-500">Loading issues...</p>
        </div>
      )}
      
      {!loading.issues && !activeSprint && (
        <div className="flex items-center justify-center w-full p-8 text-center">
          <div className="bg-gray-50 p-6 rounded-md shadow-sm border border-gray-200">
            <h3 className="text-xl font-medium mb-2">No Active Sprint</h3>
            <p className="text-gray-500">
              Start a sprint from the Sprints page to see issues here.
            </p>
          </div>
        </div>
      )}
      
      {!loading.issues && activeSprint && columns.map((column) => (
        <div 
          key={column.id} 
          className="kanban-column w-72 flex-shrink-0"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <h3 className="font-medium mb-3 flex items-center justify-between">
            {column.title}
            <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {issuesByStatus(column.id).length}
            </span>
          </h3>
          <div className="space-y-2 min-h-[100px] p-2 bg-gray-50 rounded-md">
            {issuesByStatus(column.id).map((issue) => (
              <div 
                key={issue.id}
                draggable
                onDragStart={() => handleDragStart(issue.id)}
                className="cursor-grab active:cursor-grabbing"
              >
                <IssueCard key={issue.id} issue={issue} />
              </div>
            ))}
            {issuesByStatus(column.id).length === 0 && (
              <div className="text-center p-4 text-gray-400 text-sm">
                No issues in this status
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

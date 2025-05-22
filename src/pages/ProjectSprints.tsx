
import { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { SprintCard } from "@/components/SprintCard";
import { IssueCard } from "@/components/IssueCard"; 
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateSprintDialog } from "@/components/CreateSprintDialog";
import { Sprint, Issue } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SprintBoard } from "@/components/SprintBoard";

const ProjectSprints = () => {
  const { projectId = "" } = useParams();
  const { 
    getSprintsByProject, 
    getIssuesByProject,
    updateIssueSprint, 
    fetchSprints,
    fetchIssues,
    loading 
  } = useAppStore();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("board");
  
  useEffect(() => {
    if (projectId) {
      // Fetch both issues and sprints when component mounts
      Promise.all([
        fetchIssues(projectId),
        fetchSprints(projectId)
      ]);
    }
  }, [projectId, fetchSprints, fetchIssues]);
  
  const sprints = getSprintsByProject(projectId);
  const issues = getIssuesByProject(projectId);
  const backlogIssues = issues.filter(issue => !issue.sprintId);
  
  // Sort sprints by creation date (newest first)
  const sortedSprints = [...sprints].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, sprintId: string) => {
    e.preventDefault();
    if (draggedIssueId) {
      updateIssueSprint(draggedIssueId, sprintId);
      setDraggedIssueId(null);
    }
  };

  const handleDragStart = (issueId: string) => {
    setDraggedIssueId(issueId);
  };

  return (
    <div className="h-full flex flex-col">
      <ProjectHeader projectId={projectId} />
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Sprint Planning</h2>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-[#459ed7] hover:bg-[#3688bd] flex gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Create Sprint
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="board">Sprint Board</TabsTrigger>
            <TabsTrigger value="list">Sprint List</TabsTrigger>
          </TabsList>
          
          <TabsContent value="board" className="w-full">
            <SprintBoard projectId={projectId} />
          </TabsContent>
          
          <TabsContent value="list" className="w-full">
            {loading.sprints ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading sprints...</p>
              </div>
            ) : sortedSprints.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-md border">
                <p className="text-gray-500 mb-4">No sprints found</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  Create Your First Sprint
                </Button>
              </div>
            ) : (
              <div>
                {/* Backlog Issues */}
                <div className="mb-6" onDragOver={handleDragOver}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
                    Backlog
                    <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {backlogIssues.length}
                    </span>
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
                    {backlogIssues.length === 0 ? (
                      <div className="text-gray-500 text-center">No issues in backlog</div>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {backlogIssues.map((issue: Issue) => (
                          <div 
                            key={issue.id}
                            draggable
                            onDragStart={() => handleDragStart(issue.id)}
                            className="cursor-grab active:cursor-grabbing"
                          >
                            <IssueCard issue={issue} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {sortedSprints.map((sprint: Sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    projectId={projectId}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, sprint.id)}
                    onDragStart={handleDragStart}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <CreateSprintDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={projectId}
      />
    </div>
  );
};

export default ProjectSprints;

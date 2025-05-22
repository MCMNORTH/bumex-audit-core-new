
import { useEffect } from "react";
import { useAppStore } from "@/store";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateSprintDialog } from "@/components/CreateSprintDialog";
import { useState } from "react";
import { SprintBoard } from "@/components/SprintBoard";

const ProjectSprints = () => {
  const { projectId = "" } = useParams();
  const { fetchSprints, fetchIssues } = useAppStore();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  useEffect(() => {
    if (projectId) {
      // Fetch both issues and sprints when component mounts
      Promise.all([
        fetchIssues(projectId),
        fetchSprints(projectId)
      ]);
    }
  }, [projectId, fetchSprints, fetchIssues]);
  
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
        
        <div className="w-full">
          <SprintBoard projectId={projectId} />
        </div>
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

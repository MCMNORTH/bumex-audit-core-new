
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectHeaderProps {
  projectId: string;
}

export const ProjectHeader = ({ projectId }: ProjectHeaderProps) => {
  const { getProjectById, getUserById } = useAppStore();
  const navigate = useNavigate();
  
  const project = getProjectById(projectId);
  const projectLead = project?.lead ? getUserById(project.lead) : null;

  if (!project) return null;

  return (
    <div className="p-4 border-b bg-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-jira-blue-dark rounded flex items-center justify-center text-white font-semibold">
            {project.key.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <p className="text-sm text-gray-500">Project lead: {projectLead?.name || 'Unassigned'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}/board`)}
          >
            Board
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}/issues`)}
          >
            Issues
          </Button>
          <Button 
            onClick={() => navigate(`/projects/${projectId}/create-issue`)}
            className="bg-jira-blue hover:bg-jira-blue-dark flex gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Create Issue
          </Button>
        </div>
      </div>
    </div>
  );
};

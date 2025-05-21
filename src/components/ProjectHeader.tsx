
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProjectHeaderProps {
  projectId: string;
}

export function ProjectHeader({ projectId }: { projectId: string }) {
  const { getProjectById, getUserById } = useAppStore();
  const navigate = useNavigate();
  
  const project = getProjectById(projectId);
  const projectLead = project?.lead ? getUserById(project.lead) : null;

  if (!project) return null;

  return (
    <div className="bg-white border-b p-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-jira-blue-dark rounded flex items-center justify-center text-white font-semibold">
            {project?.key.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{project?.name}</h1>
            <p className="text-sm text-muted-foreground">
              {project?.description || "No description"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="bg-jira-blue hover:bg-jira-blue-dark"
            onClick={() => navigate(`/projects/${projectId}/edit`)}
          >
            Edit Project
          </Button>
          <Button
            onClick={() => navigate(`/projects/${projectId}/create-issue`)}
            className="bg-jira-blue hover:bg-jira-blue-dark"
          >
            Create Issue
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-4">
        <div className="flex">
          <NavLink
            to={`/projects/${projectId}/board`}
            className={({ isActive }) =>
              cn(
                "px-4 py-2 text-sm border-b-2",
                isActive
                  ? "border-jira-blue text-jira-blue"
                  : "border-transparent hover:border-gray-300"
              )
            }
          >
            Board
          </NavLink>
          <NavLink
            to={`/projects/${projectId}/issues`}
            className={({ isActive }) =>
              cn(
                "px-4 py-2 text-sm border-b-2",
                isActive
                  ? "border-jira-blue text-jira-blue"
                  : "border-transparent hover:border-gray-300"
              )
            }
          >
            Issues
          </NavLink>
          <NavLink
            to={`/projects/${projectId}/timeline`}
            className={({ isActive }) =>
              cn(
                "px-4 py-2 text-sm border-b-2",
                isActive
                  ? "border-jira-blue text-jira-blue"
                  : "border-transparent hover:border-gray-300"
              )
            }
          >
            Timeline
          </NavLink>
          <NavLink
            to={`/projects/${projectId}/sprints`}
            className={({ isActive }) =>
              cn(
                "px-4 py-2 text-sm border-b-2",
                isActive
                  ? "border-jira-blue text-jira-blue"
                  : "border-transparent hover:border-gray-300"
              )
            }
          >
            Sprints
          </NavLink>
        </div>
      </div>
    </div>
  );
}

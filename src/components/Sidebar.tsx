
import { cn } from "@/lib/utils";
import { Project } from "@/types";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { PlusCircle, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogoutButton } from "./LogoutButton";

export const Sidebar = () => {
  const { projects, selectedProject, setSelectedProject } = useAppStore();
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    navigate(`/projects/${project.id}`);
  };

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || "User";

  return (
    <div className={cn(
      "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300",
      isOpen ? "w-60" : "w-16"
    )}>
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        <h1 className={cn("font-semibold", !isOpen && "hidden")}>
          Jira Clone
        </h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sidebar-foreground p-1 rounded hover:bg-sidebar-accent"
        >
          {isOpen ? "◀" : "▶"}
        </button>
      </div>
      
      <div className="p-2">
        <Button 
          onClick={() => navigate('/create-project')} 
          className="w-full bg-jira-blue hover:bg-jira-blue-dark justify-start gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          {isOpen && <span>Create Project</span>}
        </Button>
      </div>

      <div className="p-2 overflow-y-auto flex-1">
        <div className={cn("mb-2 text-xs uppercase font-semibold text-gray-400", !isOpen && "hidden")}>
          Projects
        </div>
        <ul className="space-y-1">
          {projects.map((project) => (
            <li key={project.id}>
              <button
                onClick={() => handleProjectSelect(project)}
                className={cn(
                  "w-full text-left p-2 rounded-md flex items-center gap-2",
                  "hover:bg-sidebar-accent transition-colors",
                  selectedProject?.id === project.id && "bg-sidebar-accent"
                )}
              >
                <div className="w-6 h-6 bg-jira-blue-dark rounded-md flex items-center justify-center text-white font-semibold text-xs">
                  {project.key.substring(0, 2).toUpperCase()}
                </div>
                {isOpen && <span>{project.name}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-auto border-t border-sidebar-border">
        <div className="p-2">
          <Button 
            onClick={() => navigate('/profile')} 
            variant="ghost" 
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <User className="mr-2 h-4 w-4" />
            {isOpen && <span>{displayName}</span>}
          </Button>
          {isOpen ? <LogoutButton /> : (
            <div className="flex justify-center p-2">
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

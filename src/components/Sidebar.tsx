
import { cn } from "@/lib/utils";
import { Project } from "@/types";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Sidebar = () => {
  const { projects, selectedProject, setSelectedProject } = useAppStore();
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    navigate(`/projects/${project.id}`);
  };

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
      
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-2", !isOpen && "justify-center")}>
          <div className="w-8 h-8 bg-jira-blue rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">JD</span>
          </div>
          {isOpen && <span>John Doe</span>}
        </div>
      </div>
    </div>
  );
};

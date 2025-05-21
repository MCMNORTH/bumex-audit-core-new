
import { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import { Project } from "@/types";
import { Link, useLocation, NavLink } from "react-router-dom";
import { Calendar, LayoutGrid, List, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectHeaderProps {
  projectId: string;
}

export const ProjectHeader = ({ projectId }: ProjectHeaderProps) => {
  const { getProjectById } = useAppStore();
  const [project, setProject] = useState<Project | null>(null);
  const location = useLocation();
  
  useEffect(() => {
    const currentProject = getProjectById(projectId);
    if (currentProject) {
      setProject(currentProject);
    }
  }, [projectId, getProjectById]);

  if (!project) {
    return <div className="h-16 border-b bg-gray-50"></div>;
  }

  return (
    <div className="bg-white border-b">
      <div className="px-6 py-3">
        <Link to="/" className="text-gray-500 text-sm hover:underline">
          Projects
        </Link>
        <span className="text-gray-400 mx-1">/</span>
        <span className="font-medium">{project.name}</span>
      </div>

      <div className="flex items-center px-6 overflow-x-auto">
        <NavLink
          to={`/projects/${projectId}/board`}
          className={({ isActive }) => cn(
            "flex items-center px-4 py-2 text-sm border-b-2 -mb-px",
            isActive
              ? "border-blue-500 text-blue-600 font-medium"
              : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
          )}
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          Board
        </NavLink>
        
        <NavLink
          to={`/projects/${projectId}/issues`}
          className={({ isActive }) => cn(
            "flex items-center px-4 py-2 text-sm border-b-2 -mb-px",
            isActive
              ? "border-blue-500 text-blue-600 font-medium"
              : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
          )}
        >
          <List className="h-4 w-4 mr-2" />
          Issues
        </NavLink>
        
        <NavLink
          to={`/projects/${projectId}/sprints`}
          className={({ isActive }) => cn(
            "flex items-center px-4 py-2 text-sm border-b-2 -mb-px",
            isActive
              ? "border-blue-500 text-blue-600 font-medium"
              : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
          )}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Sprints
        </NavLink>
        
        <NavLink
          to={`/projects/${projectId}/timeline`}
          className={({ isActive }) => cn(
            "flex items-center px-4 py-2 text-sm border-b-2 -mb-px",
            isActive
              ? "border-blue-500 text-blue-600 font-medium"
              : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
          )}
        >
          <Clock className="h-4 w-4 mr-2" />
          Timeline
        </NavLink>
      </div>
    </div>
  );
};

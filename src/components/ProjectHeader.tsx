
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store";
import { Edit, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectHeaderProps {
  projectId: string;
}

export const ProjectHeader = ({ projectId }: ProjectHeaderProps) => {
  const navigate = useNavigate();
  const { getProjectById, toggleStarProject } = useAppStore();
  const project = getProjectById(projectId);
  
  if (!project) {
    return <div className="bg-accent border-b border-border p-4">Project not found</div>;
  }
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };
  
  const handleStarClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleStarProject(projectId);
  };

  return (
    <div className="bg-accent border-b border-border">
      <div className="container py-4 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            {project.imageUrl ? (
              <img 
                src={project.imageUrl} 
                alt={project.name} 
                className="w-10 h-10 rounded-md object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center text-white font-semibold">
                {project.key.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <span className="text-sm text-white">{project.key}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-yellow-500"
              onClick={handleStarClick}
            >
              <Star
                className={cn(
                  "h-5 w-5",
                  project.starred ? "fill-yellow-400 text-yellow-400" : "fill-none"
                )}
              />
              <span className="sr-only">{project.starred ? "Unstar" : "Star"} project</span>
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => navigate(`/projects/${projectId}/edit`)}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>

        <Tabs defaultValue="board" className="w-full">
          <TabsList>
            <TabsTrigger
              value="board"
              className={isActiveRoute(`/projects/${projectId}`) ? "data-[state=active]" : ""}
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              Board
            </TabsTrigger>
            <TabsTrigger
              value="issues"
              className={isActiveRoute(`/projects/${projectId}/issues`) ? "data-[state=active]" : ""}
              onClick={() => navigate(`/projects/${projectId}/issues`)}
            >
              List
            </TabsTrigger>
            <TabsTrigger
              value="sprints"
              className={isActiveRoute(`/projects/${projectId}/sprints`) ? "data-[state=active]" : ""}
              onClick={() => navigate(`/projects/${projectId}/sprints`)}
            >
              Sprints
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className={isActiveRoute(`/projects/${projectId}/timeline`) ? "data-[state=active]" : ""}
              onClick={() => navigate(`/projects/${projectId}/timeline`)}
            >
              Timeline
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

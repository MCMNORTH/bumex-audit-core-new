
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store";
import { useEffect, useState } from "react";
import { Calendar, User, Target, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectProgress from "@/components/ProjectProgress";
import { cn } from "@/lib/utils";

const ProjectDetail = () => {
  const { projectId = "" } = useParams();
  const { 
    getProjectById, 
    fetchIssues, 
    fetchEpics,
    toggleStarProject,
    getIssuesByProject,
    getEpicsByProject
  } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  
  const project = getProjectById(projectId);
  const issues = getIssuesByProject(projectId);
  const epics = getEpicsByProject(projectId);

  useEffect(() => {
    const loadProjectData = async () => {
      if (projectId) {
        setIsLoading(true);
        try {
          await Promise.all([
            fetchIssues(projectId),
            fetchEpics(projectId)
          ]);
        } catch (error) {
          console.error("Error loading project data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProjectData();
  }, [projectId, fetchIssues, fetchEpics]);

  const handleStarClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleStarProject(projectId);
  };

  if (!project) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </div>
    );
  }

  const statusCounts = {
    total: issues.length,
    'in-progress': issues.filter(issue => issue.status === "in-progress").length,
    'in-review': issues.filter(issue => issue.status === "in-review").length,
    done: issues.filter(issue => issue.status === "done").length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {project.imageUrl ? (
              <img src={project.imageUrl} alt={project.name} className="w-16 h-16 object-cover rounded-lg" />
            ) : (
              <div className="w-16 h-16 bg-[#459ed7] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {project.key.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-lg text-muted-foreground">{project.key}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted-foreground hover:text-yellow-500"
            onClick={handleStarClick}
          >
            <Star 
              className={cn(
                "h-6 w-6",
                project.starred 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "fill-none"
              )} 
            />
          </Button>
        </div>
        
        {project.description && (
          <p className="text-muted-foreground text-lg leading-relaxed">{project.description}</p>
        )}
      </div>

      {/* Project Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statusCounts['in-progress']}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              In Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statusCounts['in-review']}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Done
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusCounts.done}</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground">Loading progress...</div>
          ) : (
            <ProjectProgress project={project} showDetails />
          )}
        </CardContent>
      </Card>

      {/* Project Information */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Project Key: {project.key}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetail;


import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/store";
import { Project } from "@/types";
import { useEffect, useState } from "react";
import { Percent } from "lucide-react";

interface ProjectProgressProps {
  project: Project;
  showDetails?: boolean;
}

const ProjectProgress = ({ project, showDetails = false }: ProjectProgressProps) => {
  const { issues, fetchIssues } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [totalIssues, setTotalIssues] = useState(0);
  const [completedIssues, setCompletedIssues] = useState(0);

  useEffect(() => {
    const loadIssues = async () => {
      setLoading(true);
      try {
        await fetchIssues(project.id);
      } catch (error) {
        console.error("Error loading issues for progress:", error);
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, [project.id, fetchIssues]);

  useEffect(() => {
    // Filter issues for this project
    const projectIssues = issues.filter(issue => issue.projectId === project.id);
    const completed = projectIssues.filter(issue => issue.status === "done").length;
    
    setTotalIssues(projectIssues.length);
    setCompletedIssues(completed);
    
    // Calculate progress percentage
    const progressPercentage = projectIssues.length > 0
      ? Math.round((completed / projectIssues.length) * 100)
      : 0;
    
    setProgress(progressPercentage);
  }, [issues, project.id]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm text-gray-500 flex items-center gap-1">
          <Percent className="h-4 w-4" />
          <span>Progress</span>
        </div>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      
      {showDetails && (
        <div className="mt-1 text-xs text-gray-500">
          {loading ? (
            <span>Loading issues...</span>
          ) : (
            <span>{completedIssues} of {totalIssues} issues completed</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectProgress;

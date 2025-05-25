
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
  const [statusCounts, setStatusCounts] = useState({
    todo: 0,
    'in-progress': 0,
    'in-review': 0,
    done: 0
  });
  const [totalIssues, setTotalIssues] = useState(0);

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
    
    const counts = {
      todo: projectIssues.filter(issue => issue.status === "todo").length,
      'in-progress': projectIssues.filter(issue => issue.status === "in-progress").length,
      'in-review': projectIssues.filter(issue => issue.status === "in-review").length,
      done: projectIssues.filter(issue => issue.status === "done").length
    };
    
    setStatusCounts(counts);
    setTotalIssues(projectIssues.length);
  }, [issues, project.id]);

  const getPercentage = (count: number) => {
    return totalIssues > 0 ? (count / totalIssues) * 100 : 0;
  };

  const overallProgress = totalIssues > 0 ? Math.round((statusCounts.done / totalIssues) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm text-gray-500 flex items-center gap-1">
          <Percent className="h-4 w-4" />
          <span>Progress</span>
        </div>
        <span className="text-sm font-medium">{overallProgress}%</span>
      </div>
      
      {/* Colorful status progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">
        {totalIssues > 0 ? (
          <>
            {/* To Do - Gray */}
            <div 
              className="h-full bg-gray-400 transition-all"
              style={{ width: `${getPercentage(statusCounts.todo)}%` }}
            />
            {/* In Progress - Blue */}
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${getPercentage(statusCounts['in-progress'])}%` }}
            />
            {/* In Review - Orange */}
            <div 
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${getPercentage(statusCounts['in-review'])}%` }}
            />
            {/* Done - Green */}
            <div 
              className="h-full bg-green-500 transition-all"
              style={{ width: `${getPercentage(statusCounts.done)}%` }}
            />
          </>
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
      </div>
      
      {showDetails && (
        <div className="mt-1 text-xs text-gray-500">
          {loading ? (
            <span>Loading issues...</span>
          ) : (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>To Do: {statusCounts.todo}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>In Progress: {statusCounts['in-progress']}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>In Review: {statusCounts['in-review']}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Done: {statusCounts.done}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectProgress;


import { cn } from "@/lib/utils";
import { Issue, IssueType } from "@/types";
import { useAppStore } from "@/store";
import { Bug, CheckSquare, ClipboardList, File } from "lucide-react";
import { useNavigate } from "react-router-dom";

const issueTypeIcons: Record<IssueType, React.ReactNode> = {
  task: <CheckSquare className="h-4 w-4 text-jira-blue" />,
  bug: <Bug className="h-4 w-4 text-jira-red" />,
  story: <ClipboardList className="h-4 w-4 text-jira-green" />,
  epic: <File className="h-4 w-4 text-jira-purple" />,
};

const priorityColors: Record<string, string> = {
  highest: "bg-jira-red",
  high: "bg-orange-500",
  medium: "bg-jira-yellow",
  low: "bg-green-400",
  lowest: "bg-gray-300",
};

interface IssueCardProps {
  issue: Issue;
}

export const IssueCard = ({ issue }: IssueCardProps) => {
  const { getUserById, setSelectedIssue } = useAppStore();
  const navigate = useNavigate();
  
  const assignee = issue.assigneeId ? getUserById(issue.assigneeId) : null;

  const handleClick = () => {
    setSelectedIssue(issue);
    navigate(`/issues/${issue.id}`);
  };

  return (
    <div 
      className="task-card fade-in"
      onClick={handleClick}
    >
      <div className="flex justify-between mb-2">
        <div className="flex items-center gap-1">
          {issueTypeIcons[issue.type]}
          <span className="text-xs text-gray-500">
            {issue.id.substring(0, 8)}
          </span>
        </div>
        <div className={cn("h-1.5 w-1.5 rounded-full", priorityColors[issue.priority])} />
      </div>
      
      <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">{issue.title}</h3>
      
      <div className="flex justify-between items-center">
        {issue.type !== 'epic' && (
          <span className="bg-jira-gray-card text-xs py-0.5 px-1.5 rounded text-gray-600">
            {issue.epicId ? `${issue.epicId.substring(0, 8)}` : ''}
          </span>
        )}
        
        {assignee ? (
          <div 
            className="h-6 w-6 rounded-full bg-jira-blue-dark text-white flex items-center justify-center text-xs font-medium"
            title={assignee.name}
          >
            {assignee.avatarUrl ? (
              <img 
                src={assignee.avatarUrl} 
                alt={assignee.name} 
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              assignee.name.substring(0, 2).toUpperCase()
            )}
          </div>
        ) : (
          <div className="h-6 w-6 rounded-full border-2 border-dashed border-gray-300" />
        )}
      </div>
    </div>
  );
};

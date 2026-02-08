
import { useAppStore } from "@/store";
import { Bug, CheckCircle2, FileText, Award, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Issue } from "@/types";

interface IssueCardProps {
  issue: Issue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const { issues } = useAppStore();
  const navigate = useNavigate();
  
  // Get subtask count and completion
  const subtasks = issues.filter(i => i.parentId === issue.id && i.type === "subtask");
  const completedSubtasks = subtasks.filter(i => i.status === "done").length;
  const hasSubtasks = subtasks.length > 0;
  
  // Map priority to colors
  const priorityColors = {
    highest: "bg-[#f04f3a]",
    high: "bg-orange-500",
    medium: "bg-[#FFAB00]",
    low: "bg-blue-500",
    lowest: "bg-gray-400",
  };
  
  // Map issue type to icons with updated modern look
  const TypeIcon = () => {
    switch (issue.type) {
      case "bug":
        return <Bug className="h-4 w-4 text-[#f04f3a]" />;
      case "task":
        return <CheckCircle2 className="h-4 w-4 text-[#459ed7]" />;
      case "story":
        return <FileText className="h-4 w-4 text-[#36B37E]" />;
      case "epic":
        return <Award className="h-4 w-4 text-purple-500" />;
      case "subtask":
        return <CheckSquare className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-3 rounded-md shadow border border-gray-200 mb-2 cursor-pointer"
      onClick={() => navigate(`/issues/${issue.id}`)}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <TypeIcon />
          <span className={`w-2 h-2 rounded-full ${priorityColors[issue.priority]}`} title={`Priority: ${issue.priority}`}></span>
        </div>
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            navigate(`/issues/${issue.id}/edit`);
          }}
          className="text-xs text-[#459ed7] hover:underline"
        >
          Edit
        </button>
      </div>
      
      <h3 className="font-medium text-sm line-clamp-2">{issue.title}</h3>
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center">
          {issue.assignee ? (
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs overflow-hidden">
                {issue.assignee.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-gray-600">{issue.assignee}</span>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border border-dashed border-gray-300 flex items-center justify-center">
              <span className="text-xs text-gray-400">?</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasSubtasks && (
            <div className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 flex items-center gap-1">
              <CheckSquare className="h-3 w-3" />
              {completedSubtasks}/{subtasks.length}
            </div>
          )}
          <div className="text-xs text-gray-500">{issue.id.substring(0, 8)}</div>
        </div>
      </div>
    </div>
  );
}

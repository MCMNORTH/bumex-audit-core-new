
import { useAppStore } from "@/store";
import { Bug, CheckCircle2, FileText, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Issue } from "@/types";

interface TaskCardProps {
  issue: Issue;
}

export function IssueCard({ issue }: TaskCardProps) {
  const { getUserById } = useAppStore();
  const assignee = issue.assigneeId ? getUserById(issue.assigneeId) : null;
  const navigate = useNavigate();
  
  // Map priority to colors
  const priorityColors = {
    highest: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
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
        return <FileText className="h-4 w-4 text-green-500" />;
      case "epic":
        return <Award className="h-4 w-4 text-purple-500" />;
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
          {assignee ? (
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs overflow-hidden">
                {assignee.avatarUrl ? (
                  <img src={assignee.avatarUrl} alt={assignee.name} className="w-full h-full object-cover" />
                ) : (
                  (assignee.name || assignee.email || "U").charAt(0).toUpperCase()
                )}
              </div>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border border-dashed border-gray-300 flex items-center justify-center">
              <span className="text-xs text-gray-400">?</span>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">{issue.id.substring(0, 8)}</div>
      </div>
    </div>
  );
}

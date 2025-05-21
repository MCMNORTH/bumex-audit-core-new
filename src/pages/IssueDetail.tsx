
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store";
import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useEffect } from "react";
import { 
  Bug, 
  CheckSquare, 
  ClipboardList, 
  File, 
  Clock, 
  Tag, 
  Edit, 
  Trash2,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { Status } from "@/types";
import { Badge } from "@/components/ui/badge";
import { SubTaskList } from "@/components/SubTaskList";

const IssueDetail = () => {
  const { issueId = "" } = useParams();
  const { issues, getUserById, getProjectById, updateIssueStatus, deleteIssue, fetchIssues } = useAppStore();
  const navigate = useNavigate();

  // Fetch issues to ensure we have the latest data
  useEffect(() => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      fetchIssues(issue.projectId);
    }
  }, [issueId, issues, fetchIssues]);

  const issue = useMemo(() => {
    return issues.find(i => i.id === issueId);
  }, [issues, issueId]);

  if (!issue) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">Issue not found</h1>
        <Button 
          onClick={() => navigate("/")} 
          variant="link" 
          className="mt-4"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // Don't show subtask list for subtasks themselves
  const isSubtask = issue.type === "subtask";

  const assignee = issue.assigneeId ? getUserById(issue.assigneeId) : null;
  const reporter = issue.reporterId ? getUserById(issue.reporterId) : null;
  const project = getProjectById(issue.projectId);

  const getIssueTypeIcon = () => {
    switch (issue.type) {
      case 'bug': 
        return <Bug className="h-5 w-5 text-[#f04f3a]" />;
      case 'task': 
        return <CheckSquare className="h-5 w-5 text-[#459ed7]" />;
      case 'story': 
        return <ClipboardList className="h-5 w-5 text-[#36B37E]" />;
      case 'epic': 
        return <File className="h-5 w-5 text-purple-500" />;
      case 'subtask':
        return <CheckSquare className="h-5 w-5 text-gray-400" />;
      default: 
        return null;
    }
  };

  const getPriorityBadge = () => {
    switch (issue.priority) {
      case 'highest':
        return <Badge className="bg-[#f04f3a]">Highest</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-[#FFAB00] text-black">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-500">Low</Badge>;
      case 'lowest':
        return <Badge className="bg-gray-400">Lowest</Badge>;
      default:
        return null;
    }
  };

  const handleStatusChange = (status: Status) => {
    updateIssueStatus(issue.id, status);
    toast("Status updated", {
      description: `Issue moved to "${status}"`,
    });
  };

  const handleDelete = () => {
    deleteIssue(issue.id);
    toast("Issue deleted", {
      description: `Issue "${issue.title}" has been deleted.`,
    });
    navigate(`/projects/${issue.projectId}`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/projects/${issue.projectId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Project
        </Button>
        
        <div className="flex-1" />
        
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => navigate(`/issues/${issue.id}/edit`)}
        >
          <Edit className="h-4 w-4" /> Edit
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 text-[#f04f3a]" 
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </div>

      <div className="bg-white rounded-md shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          {getIssueTypeIcon()}
          <span className="text-sm text-gray-500">{issue.id}</span>
          {project && (
            <Badge variant="outline" className="ml-2">
              {project.key}
            </Badge>
          )}
        </div>
        
        <h1 className="text-2xl font-bold mb-4">{issue.title}</h1>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-1">
            <Tag className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Type:</span>
            <span className="text-sm capitalize">{issue.type}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Created:</span>
            <span className="text-sm">{new Date(issue.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div>
            <span className="text-sm font-medium mr-1">Priority:</span>
            {getPriorityBadge()}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="text-sm font-medium mb-2">Description</h2>
          <p className="text-sm whitespace-pre-wrap">{issue.description || "No description provided."}</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-medium mb-2">Status</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={issue.status === "todo" ? "default" : "outline"}
                size="sm"
                className={issue.status === "todo" ? "bg-[#459ed7]" : ""}
                onClick={() => handleStatusChange("todo")}
              >
                To Do
              </Button>
              <Button
                variant={issue.status === "in-progress" ? "default" : "outline"}
                size="sm"
                className={issue.status === "in-progress" ? "bg-[#FFAB00] text-black hover:text-black" : ""}
                onClick={() => handleStatusChange("in-progress")}
              >
                In Progress
              </Button>
              <Button
                variant={issue.status === "in-review" ? "default" : "outline"}
                size="sm"
                className={issue.status === "in-review" ? "bg-purple-500" : ""}
                onClick={() => handleStatusChange("in-review")}
              >
                In Review
              </Button>
              <Button
                variant={issue.status === "done" ? "default" : "outline"}
                size="sm"
                className={issue.status === "done" ? "bg-[#36B37E]" : ""}
                onClick={() => handleStatusChange("done")}
              >
                Done
              </Button>
            </div>
          </div>
          
          <div>
            <h2 className="text-sm font-medium mb-2">People</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-20">Assignee:</span>
                {assignee ? (
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-[#459ed7] text-white flex items-center justify-center text-xs">
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
                    <span className="text-sm">{assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Unassigned</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-20">Reporter:</span>
                {reporter ? (
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-[#459ed7] text-white flex items-center justify-center text-xs">
                      {reporter.avatarUrl ? (
                        <img 
                          src={reporter.avatarUrl} 
                          alt={reporter.name} 
                          className="h-full w-full rounded-full object-cover" 
                        />
                      ) : (
                        reporter.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <span className="text-sm">{reporter.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Only show subtasks for regular issues, not for subtasks themselves */}
        {!isSubtask && <SubTaskList parentIssue={issue} />}
      </div>
    </div>
  );
};

export default IssueDetail;

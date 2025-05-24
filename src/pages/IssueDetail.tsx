import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store";
import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
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
  ArrowRight,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";
import { Status, User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { SubTaskList } from "@/components/SubTaskList";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const IssueDetail = () => {
  const { issueId = "" } = useParams();
  const { issues, getProjectById, updateIssueStatus, deleteIssue, fetchIssues, updateIssue } = useAppStore();
  const navigate = useNavigate();

  // Edit mode states
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingAssignee, setEditingAssignee] = useState(false);
  
  // Edit values
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAssignee, setEditAssignee] = useState<string>("");
  
  // Users for assignee dropdown
  const [users, setUsers] = useState<User[]>([]);

  // Fetch issues to ensure we have the latest data
  useEffect(() => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      fetchIssues(issue.projectId);
    }
  }, [issueId, issues, fetchIssues]);

  // Fetch users for assignee selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

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

  const project = getProjectById(issue.projectId);

  // Helper function to get user display name
  const getUserDisplayName = (user: User): string => {
    if (user.name) return user.name;
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split('@')[0];
    return "Unknown User";
  };

  const handleTitleEdit = () => {
    setEditTitle(issue.title);
    setEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (editTitle.trim() && editTitle !== issue.title) {
      try {
        await updateIssue({
          ...issue,
          title: editTitle.trim()
        });
        toast("Title updated successfully");
      } catch (error) {
        console.error("Error updating title:", error);
        toast("Failed to update title");
      }
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditTitle(issue.title);
    setEditingTitle(false);
  };

  const handleDescriptionEdit = () => {
    setEditDescription(issue.description || "");
    setEditingDescription(true);
  };

  const handleDescriptionSave = async () => {
    if (editDescription !== issue.description) {
      try {
        await updateIssue({
          ...issue,
          description: editDescription
        });
        toast("Description updated successfully");
      } catch (error) {
        console.error("Error updating description:", error);
        toast("Failed to update description");
      }
    }
    setEditingDescription(false);
  };

  const handleDescriptionCancel = () => {
    setEditDescription(issue.description || "");
    setEditingDescription(false);
  };

  const handleAssigneeEdit = () => {
    setEditAssignee(issue.assignee || "");
    setEditingAssignee(true);
  };

  const handleAssigneeSave = async () => {
    if (editAssignee !== issue.assignee) {
      try {
        await updateIssue({
          ...issue,
          assignee: editAssignee || undefined
        });
        toast("Assignee updated successfully");
      } catch (error) {
        console.error("Error updating assignee:", error);
        toast("Failed to update assignee");
      }
    }
    setEditingAssignee(false);
  };

  const handleAssigneeCancel = () => {
    setEditAssignee(issue.assignee || "");
    setEditingAssignee(false);
  };

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
        
        {/* Editable Title */}
        <div className="mb-4">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-2xl font-bold"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') handleTitleCancel();
                }}
                autoFocus
              />
              <Button size="sm" onClick={handleTitleSave}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleTitleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <h1 
              className="text-2xl font-bold cursor-pointer hover:bg-gray-50 p-2 rounded"
              onClick={handleTitleEdit}
              title="Click to edit title"
            >
              {issue.title}
            </h1>
          )}
        </div>
        
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
        
        {/* Editable Description */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="text-sm font-medium mb-2">Description</h2>
          {editingDescription ? (
            <div className="space-y-2">
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={6}
                placeholder="No description provided."
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleDescriptionSave}>
                  <Check className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleDescriptionCancel}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p 
              className="text-sm whitespace-pre-wrap cursor-pointer hover:bg-gray-100 p-2 rounded min-h-[60px]"
              onClick={handleDescriptionEdit}
              title="Click to edit description"
            >
              {issue.description || "No description provided."}
            </p>
          )}
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
                {editingAssignee ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Select
                      value={editAssignee || "unassigned"}
                      onValueChange={(value) => setEditAssignee(value === "unassigned" ? "" : value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.name}>
                            {getUserDisplayName(user)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={handleAssigneeSave}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleAssigneeCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded flex-1"
                    onClick={handleAssigneeEdit}
                    title="Click to edit assignee"
                  >
                    {issue.assignee ? (
                      <>
                        <div className="h-6 w-6 rounded-full bg-[#459ed7] text-white flex items-center justify-center text-xs">
                          {issue.assignee.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm">{issue.assignee}</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">Unassigned</span>
                    )}
                  </div>
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

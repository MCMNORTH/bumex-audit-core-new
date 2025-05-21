
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { IssueType, Priority, Status, User } from "@/types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const issueTypes: { value: IssueType; label: string }[] = [
  { value: "task", label: "Task" },
  { value: "bug", label: "Bug" },
  { value: "story", label: "Story" },
  { value: "epic", label: "Epic" },
];

const priorities: { value: Priority; label: string }[] = [
  { value: "highest", label: "Highest" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "lowest", label: "Lowest" },
];

const statusOptions: { value: Status; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "in-review", label: "In Review" },
  { value: "done", label: "Done" },
];

const CreateIssue = () => {
  const { projectId = "" } = useParams();
  const { addIssue, getEpicsByProject } = useAppStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<IssueType>("task");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<Status>("todo");
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [epicId, setEpicId] = useState<string | undefined>(undefined);
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const epics = getEpicsByProject(projectId);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        setUsers(usersData);
        if (usersData.length > 0) {
          setAssigneeId(usersData[0].id);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast({
        title: "Error",
        description: "Please provide a title for the issue.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a new issue object, ensuring no undefined values are passed to Firestore
      const newIssue = {
        title,
        description,
        type,
        status,
        priority,
        assigneeId: assigneeId || null, // Use null instead of undefined
        reporterId: localStorage.getItem("userId") || "",
        projectId,
        // Only include epicId if it's not undefined or "no-epic"
        ...(epicId && epicId !== "no-epic" ? { epicId } : { epicId: null }),
        // Only include parentId if it's provided and not "no-parent"
        ...(parentId && parentId !== "no-parent" ? { parentId } : { parentId: null }),
      };

      await addIssue(newIssue);

      toast({
        title: "Issue created",
        description: `"${title}" has been created successfully.`,
      });

      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("Error creating issue:", error);
      toast({
        title: "Error",
        description: "Failed to create issue",
        variant: "destructive",
      });
    }
  };

  // Helper function to get user display name
  const getUserDisplayName = (user: User): string => {
    if (user.name) return user.name;
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split('@')[0];
    return "Unknown User";
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Issue</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter issue title"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Issue Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as IssueType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map((issueType) => (
                  <SelectItem key={issueType.value} value={issueType.value}>
                    {issueType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as Priority)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as Status)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select
              value={assigneeId || "unassigned"}
              onValueChange={(value) => setAssigneeId(value === "unassigned" ? null : value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading users..." : "Select assignee"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {getUserDisplayName(user)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {type !== "epic" && (
          <div className="grid md:grid-cols-2 gap-4">
            {epics.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="epic">Epic</Label>
                <Select
                  value={epicId || "no-epic"}
                  onValueChange={(value) => setEpicId(value === "no-epic" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select epic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-epic">No epic</SelectItem>
                    {epics.map((epic) => (
                      <SelectItem key={epic.id} value={epic.id}>
                        {epic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* New parent epic selection */}
            {type === "task" && epics.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Epic</Label>
                <Select
                  value={parentId || "no-parent"}
                  onValueChange={(value) => setParentId(value === "no-parent" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent epic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-parent">No parent</SelectItem>
                    {epics.map((epic) => (
                      <SelectItem key={epic.id} value={epic.id}>
                        {epic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter issue description"
            rows={6}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#459ed7] hover:bg-[#3688bd]"
          >
            Create Issue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateIssue;

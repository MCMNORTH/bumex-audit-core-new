
export type Priority = "highest" | "high" | "medium" | "low" | "lowest";

export type Status = "todo" | "in-progress" | "in-review" | "done";

export type IssueType = "task" | "bug" | "story" | "epic";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  type: IssueType;
  status: Status;
  priority: Priority;
  assigneeId?: string;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  epicId?: string;
  parentId?: string; // For subtasks
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  lead: string; // User ID
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
}

export interface Epic {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  status: Status;
}

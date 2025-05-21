
export type Priority = "highest" | "high" | "medium" | "low" | "lowest";

export type Status = "todo" | "in-progress" | "in-review" | "done";

export type IssueType = "task" | "bug" | "story" | "epic";

export interface User {
  id: string;
  name: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export type Sprint = {
  id: string;
  name: string;
  projectId: string;
  startDate?: string;
  endDate?: string;
  status: "future" | "active" | "completed";
  goal?: string;
  createdAt: string;
  updatedAt: string;
};

export interface Issue {
  id: string;
  title: string;
  description?: string;
  type: "bug" | "task" | "story" | "epic";
  status: Status;
  priority: "highest" | "high" | "medium" | "low" | "lowest";
  assigneeId?: string;
  reporterId: string;
  epicId?: string;
  sprintId?: string;
  parentId?: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
};

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  lead: string; // User ID
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
  deleted?: boolean;
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


export type Priority = "highest" | "high" | "medium" | "low" | "lowest";

export type Status = "todo" | "in-progress" | "in-review" | "done";

export type IssueType = "task" | "bug" | "story" | "epic" | "subtask";

export interface User {
  id: string;
  name: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  userType?: "admin" | "user" | "client";
  contactNumber?: string;
  fullName?: string;
  createdAt?: string;
  company?: string;
  uid?: string;
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
  type: "bug" | "task" | "story" | "epic" | "subtask";
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
}

export interface SubTask extends Issue {
  parentId: string; // Required for subtasks
  type: "subtask";   // Subtasks always have this type
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  lead: string; // User ID
  owner?: string; // User ID of the project owner (client)
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
  deleted?: boolean;
  imageUrl?: string;
  starred?: boolean;
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

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export type Currency = "MRU" | "USD" | "EUR";

export interface Payment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Invoice {
  id: string;
  userId: string;
  clientName: string; // For storage/display of the client name
  clientContact?: string; // New field for email or phone contact
  items: InvoiceItem[];
  total: number;
  currency: Currency;
  status: "draft" | "pending" | "paid" | "partial" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  payments?: Payment[];
  amountPaid?: number;
}


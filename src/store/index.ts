
import { create } from 'zustand';
import { mockEpics, mockIssues, mockProjects, mockUsers } from '@/data/mockData';
import { Epic, Issue, Project, Status, User } from '@/types';

interface AppState {
  users: User[];
  projects: Project[];
  epics: Epic[];
  issues: Issue[];
  selectedProject: Project | null;
  selectedIssue: Issue | null;

  // Actions
  setSelectedProject: (project: Project | null) => void;
  setSelectedIssue: (issue: Issue | null) => void;
  addProject: (project: Project) => void;
  addEpic: (epic: Epic) => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (issue: Issue) => void;
  updateIssueStatus: (issueId: string, status: Status) => void;
  deleteIssue: (issueId: string) => void;
  getIssuesByProject: (projectId: string) => Issue[];
  getEpicsByProject: (projectId: string) => Epic[];
  getIssuesByEpic: (epicId: string) => Issue[];
  getProjectById: (projectId: string) => Project | undefined;
  getUserById: (userId: string) => User | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  users: mockUsers,
  projects: mockProjects,
  epics: mockEpics,
  issues: mockIssues,
  selectedProject: mockProjects[0],
  selectedIssue: null,

  setSelectedProject: (project) => set({ selectedProject: project }),
  setSelectedIssue: (issue) => set({ selectedIssue: issue }),
  
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  
  addEpic: (epic) => set((state) => ({ epics: [...state.epics, epic] })),
  
  addIssue: (issue) => set((state) => ({ issues: [...state.issues, issue] })),
  
  updateIssue: (issue) => set((state) => ({
    issues: state.issues.map((i) => (i.id === issue.id ? issue : i)),
  })),
  
  updateIssueStatus: (issueId, status) => set((state) => ({
    issues: state.issues.map((issue) => 
      issue.id === issueId ? { ...issue, status } : issue
    ),
  })),
  
  deleteIssue: (issueId) => set((state) => ({
    issues: state.issues.filter((issue) => issue.id !== issueId),
  })),
  
  getIssuesByProject: (projectId) => {
    return get().issues.filter((issue) => issue.projectId === projectId);
  },
  
  getEpicsByProject: (projectId) => {
    return get().epics.filter((epic) => epic.projectId === projectId);
  },
  
  getIssuesByEpic: (epicId) => {
    return get().issues.filter((issue) => issue.epicId === epicId);
  },
  
  getProjectById: (projectId) => {
    return get().projects.find((project) => project.id === projectId);
  },
  
  getUserById: (userId) => {
    return get().users.find((user) => user.id === userId);
  },
}));

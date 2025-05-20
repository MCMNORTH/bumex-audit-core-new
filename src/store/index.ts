import { create } from 'zustand';
import { Epic, Issue, Project, Status, User } from '@/types';
import { firestore } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  users: User[];
  projects: Project[];
  epics: Epic[];
  issues: Issue[];
  selectedProject: Project | null;
  selectedIssue: Issue | null;
  loading: {
    projects: boolean;
    epics: boolean;
    issues: boolean;
  };

  // Actions
  fetchProjects: () => Promise<void>;
  fetchEpics: (projectId: string) => Promise<void>;
  fetchIssues: (projectId: string) => Promise<void>;
  
  setSelectedProject: (project: Project | null) => void;
  setSelectedIssue: (issue: Issue | null) => void;
  
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (project: Project) => Promise<void>;
  addEpic: (epic: Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Epic>;
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Issue>;
  
  updateIssue: (issue: Issue) => Promise<void>;
  updateIssueStatus: (issueId: string, status: Status) => Promise<void>;
  deleteIssue: (issueId: string) => Promise<void>;
  
  getIssuesByProject: (projectId: string) => Issue[];
  getEpicsByProject: (projectId: string) => Epic[];
  getIssuesByEpic: (epicId: string) => Issue[];
  getProjectById: (projectId: string) => Project | undefined;
  getUserById: (userId: string) => User | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  users: [],
  projects: [],
  epics: [],
  issues: [],
  selectedProject: null,
  selectedIssue: null,
  loading: {
    projects: false,
    epics: false,
    issues: false,
  },

  fetchProjects: async () => {
    set(state => ({ loading: { ...state.loading, projects: true }}));
    try {
      const projects = await firestore.getAllProjects() as Project[];
      set({ projects, loading: { ...get().loading, projects: false } });
      
      // If there are projects and no selected project, select the first one
      if (projects.length > 0 && !get().selectedProject) {
        set({ selectedProject: projects[0] });
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      set(state => ({ loading: { ...state.loading, projects: false }}));
    }
  },

  fetchEpics: async (projectId: string) => {
    set(state => ({ loading: { ...state.loading, epics: true }}));
    try {
      const epics = await firestore.getEpicsByProject(projectId) as Epic[];
      set({ epics, loading: { ...get().loading, epics: false } });
    } catch (error) {
      console.error("Error fetching epics:", error);
      set(state => ({ loading: { ...state.loading, epics: false }}));
    }
  },

  fetchIssues: async (projectId: string) => {
    set(state => ({ loading: { ...state.loading, issues: true }}));
    try {
      const issues = await firestore.getIssuesByProject(projectId) as Issue[];
      set({ issues, loading: { ...get().loading, issues: false } });
    } catch (error) {
      console.error("Error fetching issues:", error);
      set(state => ({ loading: { ...state.loading, issues: false }}));
    }
  },

  setSelectedProject: (project) => set({ selectedProject: project }),
  setSelectedIssue: (issue) => set({ selectedIssue: issue }),
  
  addProject: async (projectData) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      id: uuidv4(),
      ...projectData,
      createdAt: now,
      updatedAt: now,
    };
    
    await firestore.createProject(newProject);
    set((state) => ({ projects: [...state.projects, newProject] }));
    return newProject;
  },
  
  updateProject: async (project) => {
    const updatedProject = {
      ...project,
      updatedAt: new Date().toISOString()
    };
    await firestore.updateProject(project.id, updatedProject);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === project.id ? updatedProject : p)),
      selectedProject: state.selectedProject?.id === project.id ? updatedProject : state.selectedProject,
    }));
  },
  
  addEpic: async (epicData) => {
    const now = new Date().toISOString();
    const newEpic: Epic = {
      id: uuidv4(),
      ...epicData,
      createdAt: now,
      updatedAt: now,
    };
    
    await firestore.createEpic(newEpic);
    set((state) => ({ epics: [...state.epics, newEpic] }));
    return newEpic;
  },
  
  addIssue: async (issueData) => {
    const now = new Date().toISOString();
    const newIssue: Issue = {
      id: uuidv4(),
      ...issueData,
      createdAt: now,
      updatedAt: now,
    };
    
    await firestore.createIssue(newIssue);
    set((state) => ({ issues: [...state.issues, newIssue] }));
    return newIssue;
  },
  
  updateIssue: async (issue) => {
    const updatedIssue = {
      ...issue,
      updatedAt: new Date().toISOString()
    };
    await firestore.updateIssue(issue.id, updatedIssue);
    set((state) => ({
      issues: state.issues.map((i) => (i.id === issue.id ? updatedIssue : i)),
    }));
  },
  
  updateIssueStatus: async (issueId, status) => {
    const issue = get().issues.find(i => i.id === issueId);
    if (!issue) return;
    
    const updatedIssue = {
      ...issue,
      status,
      updatedAt: new Date().toISOString()
    };
    
    await firestore.updateIssue(issueId, { status, updatedAt: updatedIssue.updatedAt });
    set((state) => ({
      issues: state.issues.map((issue) => 
        issue.id === issueId ? updatedIssue : issue
      ),
    }));
  },
  
  deleteIssue: async (issueId) => {
    await firestore.deleteIssue(issueId);
    set((state) => ({
      issues: state.issues.filter((issue) => issue.id !== issueId),
    }));
  },
  
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

// Initialize the store by loading projects
if (typeof window !== 'undefined') {
  useAppStore.getState().fetchProjects();
}

import { create } from 'zustand';
import { Epic, Issue, Project, Status, User, Sprint } from '@/types';
import { firestore } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  users: User[];
  clients: User[];
  projects: Project[];
  epics: Epic[];
  issues: Issue[];
  sprints: Sprint[];
  selectedProject: Project | null;
  selectedIssue: Issue | null;
  loading: {
    projects: boolean;
    epics: boolean;
    issues: boolean;
    sprints: boolean;
    clients: boolean;
  };

  // Actions
  fetchProjects: () => Promise<void>;
  fetchEpics: (projectId: string) => Promise<void>;
  fetchIssues: (projectId: string) => Promise<void>;
  fetchSprints: (projectId: string) => Promise<void>;
  fetchClients: () => Promise<void>;
  
  setSelectedProject: (project: Project | null) => void;
  setSelectedIssue: (issue: Issue | null) => void;
  
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (project: Project) => Promise<void>;
  addEpic: (epic: Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Epic>;
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Issue>;
  
  updateIssue: (issue: Issue) => Promise<void>;
  updateIssueStatus: (issueId: string, status: Status) => Promise<void>;
  updateIssueSprint: (issueId: string, sprintId: string | null) => Promise<void>;
  deleteIssue: (issueId: string) => Promise<void>;
  
  addSprint: (sprint: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Sprint>;
  updateSprint: (sprint: Sprint) => Promise<void>;
  
  getIssuesByProject: (projectId: string) => Issue[];
  getEpicsByProject: (projectId: string) => Epic[];
  getIssuesByEpic: (epicId: string) => Issue[];
  getProjectById: (projectId: string) => Project | undefined;
  getUserById: (userId: string) => User | undefined;
  getSprintsByProject: (projectId: string) => Sprint[];
  getIssuesBySprint: (sprintId: string) => Issue[];
}

export const useAppStore = create<AppState>((set, get) => ({
  users: [],
  clients: [],
  projects: [],
  epics: [],
  issues: [],
  sprints: [],
  selectedProject: null,
  selectedIssue: null,
  loading: {
    projects: false,
    epics: false,
    issues: false,
    sprints: false,
    clients: false,
  },

  fetchProjects: async () => {
    set(state => ({ loading: { ...state.loading, projects: true }}));
    try {
      const projects = await firestore.getAllProjects() as Project[];
      // Filter out deleted projects
      const activeProjects = projects.filter(project => !project.deleted);
      set({ projects: activeProjects, loading: { ...get().loading, projects: false } });
      
      // If there are projects and no selected project, select the first non-deleted one
      if (activeProjects.length > 0 && !get().selectedProject) {
        set({ selectedProject: activeProjects[0] });
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
      // Update epics by merging with existing ones to avoid flickering
      set(state => ({ 
        epics: [...state.epics.filter(e => e.projectId !== projectId), ...epics],
        loading: { ...state.loading, epics: false } 
      }));
    } catch (error) {
      console.error("Error fetching epics:", error);
      set(state => ({ loading: { ...state.loading, epics: false }}));
    }
  },

  fetchIssues: async (projectId: string) => {
    set(state => ({ loading: { ...state.loading, issues: true }}));
    try {
      const issues = await firestore.getIssuesByProject(projectId) as Issue[];
      // Update issues by merging with existing ones to avoid flickering
      set(state => ({
        issues: [...state.issues.filter(i => i.projectId !== projectId), ...issues],
        loading: { ...state.loading, issues: false }
      }));
    } catch (error) {
      console.error("Error fetching issues:", error);
      set(state => ({ loading: { ...state.loading, issues: false }}));
    }
  },

  fetchSprints: async (projectId: string) => {
    set(state => ({ loading: { ...state.loading, sprints: true }}));
    try {
      const sprints = await firestore.getSprintsByProject(projectId) as Sprint[];
      // Update sprints by merging with existing ones to avoid flickering
      set(state => ({
        sprints: [...state.sprints.filter(s => s.projectId !== projectId), ...sprints],
        loading: { ...state.loading, sprints: false }
      }));
    } catch (error) {
      console.error("Error fetching sprints:", error);
      set(state => ({ loading: { ...state.loading, sprints: false }}));
    }
  },

  fetchClients: async () => {
    set(state => ({ loading: { ...state.loading, clients: true }}));
    try {
      const usersCollection = firestore.usersCollection;
      const q = firestore.query(usersCollection, firestore.where("userType", "==", "client"));
      const clientsSnap = await firestore.getDocs(q);
      const clients = clientsSnap.docs.map(doc => doc.data()) as User[];
      
      set({ clients, loading: { ...get().loading, clients: false } });
      console.log("Fetched clients:", clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      set(state => ({ loading: { ...state.loading, clients: false }}));
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
      deleted: false,
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

  updateIssueSprint: async (issueId, sprintId) => {
    const issue = get().issues.find(i => i.id === issueId);
    if (!issue) return;
    
    const updatedIssue = {
      ...issue,
      sprintId,
      updatedAt: new Date().toISOString()
    };
    
    await firestore.updateIssue(issueId, { sprintId, updatedAt: updatedIssue.updatedAt });
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

  addSprint: async (sprintData) => {
    const now = new Date().toISOString();
    const newSprint: Sprint = {
      id: uuidv4(),
      ...sprintData,
      createdAt: now,
      updatedAt: now,
    };
    
    await firestore.createSprint(newSprint);
    // Immediately update the state with the new sprint
    set((state) => ({ sprints: [...state.sprints, newSprint] }));
    return newSprint;
  },
  
  updateSprint: async (sprint) => {
    const updatedSprint = {
      ...sprint,
      updatedAt: new Date().toISOString()
    };
    await firestore.updateSprint(sprint.id, updatedSprint);
    // Immediately update the state with the updated sprint
    set((state) => ({
      sprints: state.sprints.map((s) => (s.id === sprint.id ? updatedSprint : s)),
    }));
  },
  
  getIssuesByProject: (projectId) => {
    const issues = get().issues;
    const filtered = issues.filter((issue) => issue.projectId === projectId);
    console.log(`Getting issues for project ${projectId}:`, filtered);
    return filtered;
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

  getSprintsByProject: (projectId) => {
    return get().sprints.filter((sprint) => sprint.projectId === projectId);
  },

  getIssuesBySprint: (sprintId) => {
    return get().issues.filter((issue) => issue.sprintId === sprintId);
  },
}));

// Initialize the store by loading projects
if (typeof window !== 'undefined') {
  useAppStore.getState().fetchProjects();
}

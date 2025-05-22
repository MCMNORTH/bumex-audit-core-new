
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCmezG-Mcl94IV3w1gxDt-6OHI9R6fGh2Y",
  authDomain: "overcode-27f56.firebaseapp.com",
  databaseURL: "https://overcode-27f56-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "overcode-27f56",
  storageBucket: "overcode-27f56.appspot.com",
  messagingSenderId: "200629257352",
  appId: "1:200629257352:web:1e1dd5c8ba7bc8e1bb0b3d",
  measurementId: "G-E5HQQEYFJ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Collection References
export const projectsCollection = collection(db, "projects");
export const epicsCollection = collection(db, "epics");
export const issuesCollection = collection(db, "issues");
export const usersCollection = collection(db, "users");
export const sprintsCollection = collection(db, "sprints");
export const invoicesCollection = collection(db, "invoices");

// Export query functions needed for client queries
export { query, where };

// Helper functions for Firestore operations
export const firestore = {
  // Export collection references and query functions
  projectsCollection,
  epicsCollection,
  issuesCollection,
  usersCollection,
  sprintsCollection,
  invoicesCollection,
  query,
  where,
  getDocs,

  // Create
  createProject: async (projectData: any) => {
    const projectRef = doc(projectsCollection, projectData.id);
    await setDoc(projectRef, projectData);
    return projectData;
  },
  
  createEpic: async (epicData: any) => {
    const epicRef = doc(epicsCollection, epicData.id);
    await setDoc(epicRef, epicData);
    return epicData;
  },
  
  createIssue: async (issueData: any) => {
    const issueRef = doc(issuesCollection, issueData.id);
    await setDoc(issueRef, issueData);
    return issueData;
  },
  
  createUser: async (userData: any) => {
    const userRef = doc(usersCollection, userData.id);
    await setDoc(userRef, userData);
    return userData;
  },

  createSprint: async (sprintData: any) => {
    const sprintRef = doc(sprintsCollection, sprintData.id);
    await setDoc(sprintRef, sprintData);
    return sprintData;
  },
  
  createInvoice: async (invoiceData: any) => {
    const invoiceRef = doc(invoicesCollection, invoiceData.id);
    await setDoc(invoiceRef, invoiceData);
    return invoiceData;
  },
  
  // Read
  getProject: async (projectId: string) => {
    const projectRef = doc(projectsCollection, projectId);
    const projectSnap = await getDoc(projectRef);
    return projectSnap.exists() ? projectSnap.data() : null;
  },
  
  getAllProjects: async () => {
    const projectsSnap = await getDocs(projectsCollection);
    return projectsSnap.docs.map(doc => doc.data());
  },
  
  getEpic: async (epicId: string) => {
    const epicRef = doc(epicsCollection, epicId);
    const epicSnap = await getDoc(epicRef);
    return epicSnap.exists() ? epicSnap.data() : null;
  },
  
  getEpicsByProject: async (projectId: string) => {
    const q = query(epicsCollection, where("projectId", "==", projectId));
    const epicsSnap = await getDocs(q);
    return epicsSnap.docs.map(doc => doc.data());
  },
  
  getIssue: async (issueId: string) => {
    const issueRef = doc(issuesCollection, issueId);
    const issueSnap = await getDoc(issueRef);
    return issueSnap.exists() ? issueSnap.data() : null;
  },
  
  getIssuesByProject: async (projectId: string) => {
    const q = query(issuesCollection, where("projectId", "==", projectId));
    const issuesSnap = await getDocs(q);
    return issuesSnap.docs.map(doc => doc.data());
  },
  
  getIssuesByEpic: async (epicId: string) => {
    const q = query(issuesCollection, where("epicId", "==", epicId));
    const issuesSnap = await getDocs(q);
    return issuesSnap.docs.map(doc => doc.data());
  },
  
  getSprint: async (sprintId: string) => {
    const sprintRef = doc(sprintsCollection, sprintId);
    const sprintSnap = await getDoc(sprintRef);
    return sprintSnap.exists() ? sprintSnap.data() : null;
  },
  
  getSprintsByProject: async (projectId: string) => {
    const q = query(sprintsCollection, where("projectId", "==", projectId));
    const sprintsSnap = await getDocs(q);
    return sprintsSnap.docs.map(doc => doc.data());
  },
  
  getUser: async (userId: string) => {
    const userRef = doc(usersCollection, userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  },

  getAllUsers: async () => {
    const usersSnap = await getDocs(usersCollection);
    return usersSnap.docs.map(doc => doc.data());
  },

  getInvoice: async (invoiceId: string) => {
    const invoiceRef = doc(invoicesCollection, invoiceId);
    const invoiceSnap = await getDoc(invoiceRef);
    return invoiceSnap.exists() ? invoiceSnap.data() : null;
  },

  getAllInvoices: async () => {
    const invoicesSnap = await getDocs(invoicesCollection);
    return invoicesSnap.docs.map(doc => doc.data());
  },
  
  // Update
  updateProject: async (projectId: string, data: any) => {
    const projectRef = doc(projectsCollection, projectId);
    await updateDoc(projectRef, data);
    return { id: projectId, ...data };
  },
  
  updateEpic: async (epicId: string, data: any) => {
    const epicRef = doc(epicsCollection, epicId);
    await updateDoc(epicRef, data);
    return { id: epicId, ...data };
  },
  
  updateIssue: async (issueId: string, data: any) => {
    const issueRef = doc(issuesCollection, issueId);
    await updateDoc(issueRef, data);
    return { id: issueId, ...data };
  },
  
  updateSprint: async (sprintId: string, data: any) => {
    const sprintRef = doc(sprintsCollection, sprintId);
    await updateDoc(sprintRef, data);
    return { id: sprintId, ...data };
  },

  updateInvoice: async (invoiceId: string, data: any) => {
    const invoiceRef = doc(invoicesCollection, invoiceId);
    await updateDoc(invoiceRef, data);
    return { id: invoiceId, ...data };
  },
  
  // Delete
  deleteProject: async (projectId: string) => {
    await deleteDoc(doc(projectsCollection, projectId));
    return projectId;
  },
  
  deleteEpic: async (epicId: string) => {
    await deleteDoc(doc(epicsCollection, epicId));
    return epicId;
  },
  
  deleteIssue: async (issueId: string) => {
    await deleteDoc(doc(issuesCollection, issueId));
    return issueId;
  },

  deleteSprint: async (sprintId: string) => {
    await deleteDoc(doc(sprintsCollection, sprintId));
    return sprintId;
  },

  deleteInvoice: async (invoiceId: string) => {
    await deleteDoc(doc(invoicesCollection, invoiceId));
    return invoiceId;
  },
};

export default app;

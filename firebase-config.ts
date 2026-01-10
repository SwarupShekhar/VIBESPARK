// Mock Firebase exports to prevent build errors during migration
const mockAuth = {
  currentUser: null,
  signOut: async () => console.log("Mock signOut"),
  onAuthStateChanged: (cb: any) => { cb(null); return () => { }; }
};

const mockDb = {};

export const auth = mockAuth;
export const db = mockDb;
export const app = {};
export const appId = "mock-app-id";
export const firebaseConfig = {};

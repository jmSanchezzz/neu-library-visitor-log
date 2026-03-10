"use client";

import { UserRole } from "./constants";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  query, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  collegeOrOffice?: string;
  isBlocked?: boolean;
}

export interface VisitLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  collegeOrOffice: string;
  reason: string;
  timestamp: string;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Firestore request timed out after ${ms}ms`)), ms)
    )
  ]);
}

export const mockStore = {
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('neu_current_user');
    return stored ? JSON.parse(stored) as User : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('neu_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('neu_current_user');
    }
  },
  getUsers: async (): Promise<User[]> => {
    const usersCol = collection(db, "users");
    const snapshot = await withTimeout(getDocs(usersCol), 10000);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  },
  saveUser: async (user: User) => {
    const userRef = doc(db, "users", user.id);
    await withTimeout(setDoc(userRef, user, { merge: true }), 10000);
  },
  getVisitLogs: async (): Promise<VisitLog[]> => {
    const logsCol = collection(db, "visitLogs");
    const q = query(logsCol, orderBy("timestamp", "desc"));
    const snapshot = await withTimeout(getDocs(q), 10000);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VisitLog));
  },
  addVisitLog: async (log: Omit<VisitLog, 'id' | 'timestamp'>) => {
    const logsCol = collection(db, "visitLogs");
    const newLogData = {
      ...log,
      timestamp: new Date().toISOString()
    };
    const docRef = await withTimeout(addDoc(logsCol, newLogData), 10000);
    return { id: docRef.id, ...newLogData } as VisitLog;
  }
};
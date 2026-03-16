"use client";

import { ADMIN_EMAILS, ALLOWED_DOMAIN, UserRole } from "./constants";
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  addDoc, 
  query, 
  orderBy
} from "firebase/firestore";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { auth, db, googleProvider } from "./firebase";

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

const CURRENT_USER_KEY = "neu_current_user";
const SESSION_MODE_KEY = "neu_session_mode";
type SessionMode = "firebase" | "prototype";
const RECENT_SYNC_WINDOW_MS = 30000;

const ADMIN_EMAIL_SET = new Set(ADMIN_EMAILS.map((email) => email.toLowerCase()));
const recentFirebaseSyncByUid = new Map<string, number>();

function toFirestoreUser(user: User): Record<string, unknown> {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isBlocked: user.isBlocked ?? false,
    ...(user.collegeOrOffice ? { collegeOrOffice: user.collegeOrOffice } : {})
  };
}

function getSessionMode(): SessionMode | null {
  if (typeof window === "undefined") return null;
  const mode = localStorage.getItem(SESSION_MODE_KEY);
  return mode === "firebase" || mode === "prototype" ? mode : null;
}

function setSessionMode(mode: SessionMode | null) {
  if (typeof window === "undefined") return;
  if (mode) {
    localStorage.setItem(SESSION_MODE_KEY, mode);
  } else {
    localStorage.removeItem(SESSION_MODE_KEY);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Firestore request timed out after ${ms}ms`)), ms)
    )
  ]);
}

function markUserSynced(uid: string) {
  recentFirebaseSyncByUid.set(uid, Date.now());
}

function wasUserRecentlySynced(uid: string): boolean {
  const lastSyncedAt = recentFirebaseSyncByUid.get(uid);
  if (!lastSyncedAt) return false;
  return Date.now() - lastSyncedAt < RECENT_SYNC_WINDOW_MS;
}

export const mockStore = {
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) as User : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },
  signInWithGoogle: async (roleHint?: UserRole): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    setSessionMode("firebase");
    const user = await mockStore.syncUserFromAuth(result.user, roleHint);
    markUserSynced(result.user.uid);
    return user;
  },
  signInPrototype: async (email: string, roleHint?: UserRole): Promise<User> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith(ALLOWED_DOMAIN)) {
      throw new Error("Prototype access requires a @neu.edu.ph email.");
    }

    const users = await mockStore.getUsers();
    const existingUser = users.find((user) => user.email.toLowerCase() === normalizedEmail);
    const localPart = normalizedEmail.split("@")[0];
    const isAdminEmail = ADMIN_EMAIL_SET.has(normalizedEmail);
    const inferredRole: UserRole = isAdminEmail
      ? "Admin"
      : localPart.includes(".")
        ? "Student"
        : "Faculty";

    const resolvedRole = isAdminEmail
      ? "Admin"
      : existingUser?.role || roleHint || inferredRole;

    const prototypeUser: User = {
      id: existingUser?.id || `prototype-${localPart.replace(/[^a-z0-9]/g, "-")}`,
      email: normalizedEmail,
      name: existingUser?.name || localPart.replace(/\./g, " "),
      role: resolvedRole,
      collegeOrOffice: existingUser?.collegeOrOffice,
      isBlocked: existingUser?.isBlocked ?? false
    };

    await mockStore.saveUser(prototypeUser);
    setSessionMode("prototype");
    mockStore.setCurrentUser(prototypeUser);
    return prototypeUser;
  },
  syncUserFromAuth: async (firebaseUser: FirebaseUser, roleHint?: UserRole): Promise<User> => {
    if (!firebaseUser.email) {
      throw new Error("Google account must have an email address.");
    }

    const normalizedEmail = firebaseUser.email.trim().toLowerCase();
    if (!normalizedEmail.endsWith(ALLOWED_DOMAIN)) {
      await signOut(auth);
      throw new Error("Please use your institutional @neu.edu.ph account.");
    }

    const userRef = doc(db, "users", firebaseUser.uid);
    const existingSnapshot = await withTimeout(getDoc(userRef), 10000);
    const existingUser = existingSnapshot.exists() ? (existingSnapshot.data() as User) : null;

    const localPart = normalizedEmail.split("@")[0];
    const isAdminEmail = ADMIN_EMAIL_SET.has(normalizedEmail);
    const inferredRole: UserRole = isAdminEmail
      ? "Admin"
      : localPart.includes(".")
        ? "Student"
        : "Faculty";

    const resolvedRole = isAdminEmail
      ? "Admin"
      : existingUser?.role || roleHint || inferredRole;

    const mergedUser: User = {
      id: firebaseUser.uid,
      email: normalizedEmail,
      name: existingUser?.name || firebaseUser.displayName || localPart.replace(/\./g, " "),
      role: resolvedRole,
      collegeOrOffice: existingUser?.collegeOrOffice,
      isBlocked: existingUser?.isBlocked ?? false
    };

    const shouldPersistUser = !existingUser ||
      existingUser.email !== mergedUser.email ||
      existingUser.name !== mergedUser.name ||
      existingUser.role !== mergedUser.role ||
      existingUser.collegeOrOffice !== mergedUser.collegeOrOffice ||
      (existingUser.isBlocked ?? false) !== (mergedUser.isBlocked ?? false);

    if (shouldPersistUser) {
      await withTimeout(setDoc(userRef, toFirestoreUser(mergedUser), { merge: true }), 10000);
    }

    markUserSynced(firebaseUser.uid);
    mockStore.setCurrentUser(mergedUser);
    return mergedUser;
  },
  signOutCurrentUser: async () => {
    await signOut(auth);
    setSessionMode(null);
    mockStore.setCurrentUser(null);
  },
  getPrototypeSessionUser: () => {
    if (getSessionMode() !== "prototype") return null;
    return mockStore.getCurrentUser();
  },
  onCurrentUserChange: (onChange: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        const prototypeUser = mockStore.getPrototypeSessionUser();
        if (prototypeUser) {
          onChange(prototypeUser);
          return;
        }

        setSessionMode(null);
        mockStore.setCurrentUser(null);
        onChange(null);
        return;
      }

      try {
        if (wasUserRecentlySynced(firebaseUser.uid)) {
          const cachedUser = mockStore.getCurrentUser();
          if (cachedUser && cachedUser.id === firebaseUser.uid) {
            setSessionMode("firebase");
            onChange(cachedUser);
            return;
          }
        }

        const user = await mockStore.syncUserFromAuth(firebaseUser);
        setSessionMode("firebase");
        onChange(user);
      } catch (error) {
        console.error("Failed to sync authenticated user", error);
        setSessionMode(null);
        mockStore.setCurrentUser(null);
        onChange(null);
      }
    });
  },
  getUsers: async (): Promise<User[]> => {
    const usersCol = collection(db, "users");
    const snapshot = await withTimeout(getDocs(usersCol), 10000);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  },
  saveUser: async (user: User) => {
    const userRef = doc(db, "users", user.id);
    await withTimeout(setDoc(userRef, toFirestoreUser(user), { merge: true }), 10000);
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
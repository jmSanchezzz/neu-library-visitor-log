"use client";

import { UserRole } from "./constants";

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

// In-memory mock store for the prototype
let currentUser: User | null = null;
let visitLogs: VisitLog[] = [];
let users: User[] = [
  {
    id: "admin-1",
    email: "admin@neu.edu.ph",
    name: "Library Admin",
    role: "Admin",
    isBlocked: false
  }
];

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
  getUsers: () => {
    const stored = localStorage.getItem('neu_users');
    return stored ? JSON.parse(stored) as User[] : users;
  },
  saveUser: (user: User) => {
    const allUsers = mockStore.getUsers();
    const index = allUsers.findIndex(u => u.id === user.id);
    if (index > -1) {
      allUsers[index] = user;
    } else {
      allUsers.push(user);
    }
    localStorage.setItem('neu_users', JSON.stringify(allUsers));
  },
  getVisitLogs: () => {
    const stored = localStorage.getItem('neu_visit_logs');
    return stored ? JSON.parse(stored) as VisitLog[] : visitLogs;
  },
  addVisitLog: (log: Omit<VisitLog, 'id' | 'timestamp'>) => {
    const logs = mockStore.getVisitLogs();
    const newLog: VisitLog = {
      ...log,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    localStorage.setItem('neu_visit_logs', JSON.stringify(logs));
    return newLog;
  }
};
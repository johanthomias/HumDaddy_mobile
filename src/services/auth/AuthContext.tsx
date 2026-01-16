import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveSession, loadSession, clearSession } from './authStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const hasSession = await loadSession();
      setIsAuthenticated(hasSession);
    } catch (error) {
      console.error('Failed to restore session:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(token?: string) {
    try {
      await saveSession(token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to login:', error);
    }
  }

  async function logout() {
    try {
      await clearSession();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

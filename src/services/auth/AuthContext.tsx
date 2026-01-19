import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  saveSession,
  loadSession,
  clearSession,
  setOnboardingCompleted as persistOnboardingCompleted,
  getOnboardingCompleted,
  getToken,
} from './authStorage';
import { userApi, getErrorMessage } from '../api';
import type { User } from '../api/otpApi';

interface AuthContextType {
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  isLoading: boolean;
  user: User | null;
  setAuthenticated: (token: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const hasSession = await loadSession();
      const onboardingFlag = await getOnboardingCompleted();
      setIsAuthenticated(hasSession);
      setOnboardingCompleted(onboardingFlag);

      // Fetch user data if session exists
      if (hasSession) {
        const token = await getToken();
        if (token) {
          try {
            const userData = await userApi.getMe();
            setUser(userData);
          } catch (err) {
            console.warn('[AuthContext] Failed to fetch user:', getErrorMessage(err));
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      setIsAuthenticated(false);
      setOnboardingCompleted(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshUser() {
    try {
      const token = await getToken();
      if (token) {
        const userData = await userApi.getMe();
        setUser(userData);
      }
    } catch (err) {
      console.warn('[AuthContext] Failed to refresh user:', getErrorMessage(err));
    }
  }

  async function setAuthenticated(token: string) {
    try {
      await saveSession(token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to set authenticated:', error);
    }
  }

  async function completeOnboarding() {
    try {
      await persistOnboardingCompleted(true);
      setOnboardingCompleted(true);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  }

  async function logout() {
    try {
      await clearSession();
      setIsAuthenticated(false);
      setOnboardingCompleted(false);
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        onboardingCompleted,
        isLoading,
        user,
        setAuthenticated,
        completeOnboarding,
        logout,
        restoreSession,
        refreshUser,
      }}
    >
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

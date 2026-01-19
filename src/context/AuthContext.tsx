import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateUser: (userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    // Set loading to false after checking
    setIsLoading(false);
  }, []);

  // Update user function - handles both camelCase and snake_case
  const updateUser = useCallback((userData: any) => {
    console.log('AuthContext: Updating user with:', userData);
    
    const updatedUser: User = {
      id: userData.id,
      email: userData.email,
      // Handle both camelCase (new backend response) and snake_case (legacy)
      fullName: userData.fullName || userData.full_name || '',
      matricNumber: userData.matricNumber || userData.matric_number || '',
      level: userData.level || '',
      role: userData.role,
      // Optional fields
      department: userData.department,
      phone: userData.phone,
      createdAt: userData.createdAt || userData.created_at,
    };
    
    console.log('AuthContext: Setting user to:', updatedUser);
    
    setUser(updatedUser);
    
    // Update localStorage with new user data
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        setUser,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Utility function to get auth token for API calls
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Utility function to get auth headers for API calls
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'director' | 'analyst' | 'nurse' | 'physician';
  department: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage and verify with backend
  useEffect(() => {
    const savedToken = localStorage.getItem('hospital_auth_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    setToken(savedToken);

    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${savedToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Token expired or invalid');
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setUser({
            id: data.user.userId,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            department: data.user.department,
          });
        }
      })
      .catch(() => {
        localStorage.removeItem('hospital_auth_token');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('hospital_auth_token', data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error: ' + err.message };
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('hospital_auth_token', data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error: ' + err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('hospital_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

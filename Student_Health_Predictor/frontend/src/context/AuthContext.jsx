import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Fetch current session profile (automatically returns Guest Admin if token is absent)
        const res = await authAPI.getProfile();
        setUser(res.data);
      } catch (err) {
        console.warn("Backend not yet active or returning guest. Provisioning offline Guest Session context...", err);
        // Fallback offline mock guest profile
        setUser({
          name: "Guest Student",
          email: "guest@wellnessai.edu",
          is_admin: true,
          created_at: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    return { name: "Guest Student", email: "guest@wellnessai.edu", is_admin: true };
  };

  const register = async (name, email, password) => {
    return { name: "Guest Student", email: "guest@wellnessai.edu", is_admin: true };
  };

  const logout = () => {
    // In free-for-all guest mode, logout simply reloads to reset state logs
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

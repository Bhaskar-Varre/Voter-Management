'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      
    }
    setAuthLoading(false);
    // setLoading(false);
  }, []);

  const login = async (email, password) => {
    // setLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userData = { ...data.user };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      
      return { success: false, message: 'Network error or server unavailable' };
    } 
    // finally {
    //   setLoading(false);
    // }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/'); // Redirect to login page after logout
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isVolunteer = user?.role === 'volunteer';

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isVolunteer,
    loading: authLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

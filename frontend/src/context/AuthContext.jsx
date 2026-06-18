import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem('auth_roles');
    const parsed = saved ? JSON.parse(saved) : null;
    return (parsed && parsed.length > 0) ? parsed : ['fan'];
  });
  
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('auth_activeRole') || 'fan';
  });

  const setAuthData = (newRoles, newActiveRole, token) => {
    let rolesToSave = newRoles;
    if (!rolesToSave || rolesToSave.length === 0) {
      rolesToSave = ['fan'];
    }
    
    let activeToSave = newActiveRole;
    if (!activeToSave) {
      activeToSave = 'fan';
    }
    
    setRoles(rolesToSave);
    setActiveRole(activeToSave);
    
    localStorage.setItem('auth_roles', JSON.stringify(rolesToSave));
    if (activeToSave) {
      localStorage.setItem('auth_activeRole', activeToSave);
    } else {
      localStorage.removeItem('auth_activeRole');
    }

    if (token) {
      localStorage.setItem('skriibe_token', token);
    }
  };

  const clearAuthData = () => {
    setRoles(['fan']);
    setActiveRole('fan');
    localStorage.removeItem('auth_roles');
    localStorage.removeItem('auth_activeRole');
    localStorage.removeItem('skriibe_token');
  };

  return (
    <AuthContext.Provider value={{ roles, activeRole, setAuthData, clearAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

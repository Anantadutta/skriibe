import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    return JSON.parse(atob(padded));
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [roles, setRoles] = useState(() => {
    let activeRoles = [];
    const creatorToken = localStorage.getItem('skriibe_creator_token');
    const fanToken = localStorage.getItem('skriibe_fan_token');
    const legacyToken = localStorage.getItem('skriibe_token');

    if (creatorToken) {
      const decoded = parseJwt(creatorToken);
      if (decoded && (decoded.roles?.includes('creator') || decoded.creatorId)) {
        return ['creator'];
      }
    }
    
    if (fanToken) {
      const decoded = parseJwt(fanToken);
      if (decoded && (decoded.roles?.includes('fan') || decoded.fanId)) {
        return ['fan'];
      }
    }

    if (legacyToken) {
      const decoded = parseJwt(legacyToken);
      if (decoded && decoded.roles) return decoded.roles;
      if (decoded && decoded.creatorId) return ['creator'];
    }
    const saved = localStorage.getItem('auth_roles');
    const parsed = saved ? JSON.parse(saved) : null;
    return (parsed && parsed.length > 0) ? parsed : ['fan'];
  });
  
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('auth_activeRole') || 'fan';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!(localStorage.getItem('skriibe_creator_token') || localStorage.getItem('skriibe_fan_token') || localStorage.getItem('skriibe_token'));
  });

  useEffect(() => {
    const sync = () => {
      let activeRoles = [];
      const creatorToken = localStorage.getItem('skriibe_creator_token');
      const fanToken = localStorage.getItem('skriibe_fan_token');
      const legacyToken = localStorage.getItem('skriibe_token');

      if (creatorToken) {
        const decoded = parseJwt(creatorToken);
        if (decoded && (decoded.roles?.includes('creator') || decoded.creatorId)) {
          setRoles(['creator']);
          setIsAuthenticated(true);
          return;
        }
      }
      
      if (fanToken) {
        const decoded = parseJwt(fanToken);
        if (decoded && (decoded.roles?.includes('fan') || decoded.fanId)) {
          setRoles(['fan']);
          setIsAuthenticated(true);
          return;
        }
      }
      
      if (legacyToken) {
        const decoded = parseJwt(legacyToken);
        if (decoded) {
          if (decoded.roles) setRoles(decoded.roles);
          else if (decoded.creatorId) setRoles(['creator']);
        }
        setIsAuthenticated(true);
      } else {
        setRoles(['fan']);
        setActiveRole('fan');
        setIsAuthenticated(false);
      }
    };
    window.addEventListener('storage', sync);
    window.addEventListener('skriibe:auth', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('skriibe:auth', sync);
    };
  }, []);

  const setAuthData = (newRoles, newActiveRole, token) => {
    let rolesToSave = newRoles;
    if (!rolesToSave || rolesToSave.length === 0) {
      rolesToSave = ['fan'];
    }
    
    let activeToSave = newActiveRole;
    if (!activeToSave) {
      activeToSave = 'fan';
    }
    
    if (rolesToSave.includes('fan')) {
      localStorage.setItem('isReturningFan', 'true');
    }

    if (token) {
      if (rolesToSave.includes('creator')) {
        localStorage.removeItem('skriibe_fan_token'); // Ensure entities don't mix
        localStorage.setItem('skriibe_creator_token', token);
      } else if (rolesToSave.includes('fan')) {
        localStorage.removeItem('skriibe_creator_token'); // Ensure entities don't mix
        localStorage.setItem('skriibe_fan_token', token);
      }
      localStorage.setItem('skriibe_token', token); // Keep as active token for legacy API support
      setIsAuthenticated(true);
    }

    setRoles(rolesToSave);
    setActiveRole(activeToSave);
    
    localStorage.setItem('auth_roles', JSON.stringify(rolesToSave));
    if (activeToSave) {
      localStorage.setItem('auth_activeRole', activeToSave);
    } else {
      localStorage.removeItem('auth_activeRole');
    }
  };

  const clearAuthData = (roleToClear) => {
    if (roleToClear === 'creator') {
      localStorage.removeItem('skriibe_creator_token');
      const fanToken = localStorage.getItem('skriibe_fan_token');
      if (fanToken) {
        setRoles(['fan']);
        setActiveRole('fan');
        localStorage.setItem('auth_roles', JSON.stringify(['fan']));
        localStorage.setItem('auth_activeRole', 'fan');
        localStorage.setItem('skriibe_token', fanToken); // switch legacy token to fan
        setIsAuthenticated(true);
        return;
      }
    } else if (roleToClear === 'fan') {
      localStorage.removeItem('skriibe_fan_token');
      const creatorToken = localStorage.getItem('skriibe_creator_token');
      if (creatorToken) {
        setRoles(['creator']);
        setActiveRole('creator');
        localStorage.setItem('auth_roles', JSON.stringify(['creator']));
        localStorage.setItem('auth_activeRole', 'creator');
        localStorage.setItem('skriibe_token', creatorToken); // switch legacy token to creator
        setIsAuthenticated(true);
        return;
      }
    }

    // Default clear all
    setRoles(['fan']);
    setActiveRole('fan');
    setIsAuthenticated(false);
    localStorage.removeItem('auth_roles');
    localStorage.removeItem('auth_activeRole');
    localStorage.removeItem('skriibe_token');
    localStorage.removeItem('skriibe_creator_token');
    localStorage.removeItem('skriibe_fan_token');
  };

  return (
    <AuthContext.Provider value={{ roles, activeRole, isAuthenticated, setAuthData, clearAuthData }}>
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

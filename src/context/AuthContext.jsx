import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('everest_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem('everest_user');
    }
    setLoading(false);
  }, []);

  // Sync login/logout across browser tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'everest_user') {
        if (!e.newValue) {
          setUser(null); // logged out in another tab
        } else {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {}
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('everest_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('everest_user');
    localStorage.removeItem('everest_cart');
    localStorage.removeItem('everest_currency');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

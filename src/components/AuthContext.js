// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing user data in cookies on component mount
    const userData = Cookies.get('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    // Store user data in cookies with expiration of 1 day
    Cookies.set('userData', JSON.stringify(userData), { expires: 1 });
  };

  const logout = () => {
    setUser(null);
    // Remove user data from cookies
    Cookies.remove('userData');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
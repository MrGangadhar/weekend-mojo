import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);
  
  const fetchUser = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };
  
  const login = (newToken, userData = null) => {
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    if (userData) {
      setUser(userData);
      setLoading(false);
    }
    toast.success('Login successful!');
    // fetchUser will run due to token change
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };
  
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    role: user?.role
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
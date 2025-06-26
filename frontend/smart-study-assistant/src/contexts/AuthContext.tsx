import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as authService from '../services/authService';

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    setUser({ id: res.id, name: res.name, email: res.email, role: res.role });
    setToken(res.token);
    setIsLoggedIn(true);
    // TODO: Lưu vào AsyncStorage nếu muốn giữ đăng nhập
  };
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    // TODO: Xóa khỏi AsyncStorage nếu dùng
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}; 
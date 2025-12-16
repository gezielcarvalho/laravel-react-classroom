import React, { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../services/authService";
import { useNavigate } from "react-router-dom";

type User = any;

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await AuthService.getUser();
        if (res.status === 200) setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await AuthService.login({ email, password });
    if (res.status >= 200 && res.status < 300) {
      setUser(res.data.user);
      navigate("/");
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => {
    // Call register endpoint then attempt to login to create session
    const res = await AuthService.register({
      name,
      email,
      password,
      password_confirmation,
    });
    if (res.status >= 200 && res.status < 300) {
      // After successful registration, log the user in
      await login(email, password);
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

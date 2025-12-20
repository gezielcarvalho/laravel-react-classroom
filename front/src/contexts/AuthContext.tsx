import React, { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../services/authService";
import { useNavigate } from "react-router-dom";

type User = any;

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    captcha?: { token?: string; answer?: string | number }
  ) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    captcha?: { token?: string; answer?: string | number }
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

  const login = async (
    email: string,
    password: string,
    captcha?: { token?: string; answer?: string | number }
  ) => {
    const payload: any = { email, password };
    if (captcha?.token) payload.captcha_token = captcha.token;
    if (captcha?.answer !== undefined) payload.captcha_answer = captcha.answer;
    const res = await AuthService.login(payload);
    if (res.status >= 200 && res.status < 300) {
      setUser(res.data.user);
      navigate("/");
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    captcha?: { token?: string; answer?: string | number }
  ) => {
    const payload: any = { name, email, password, password_confirmation };
    if (captcha?.token) payload.captcha_token = captcha.token;
    if (captcha?.answer !== undefined) payload.captcha_answer = captcha.answer;
    const res = await AuthService.register(payload);
    if (res.status >= 200 && res.status < 300) {
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

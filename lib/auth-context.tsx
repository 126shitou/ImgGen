"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  checkAccess: (path: string) => boolean;
  requireAuth: () => boolean;
}

// 需要认证的路由
const PROTECTED_ROUTES = ['/gallery', '/profile'];
// 需要认证才能使用功能的页面
const PROTECTED_FEATURES = ['/generate'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 检查本地存储中的登录状态
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      setIsAuthenticated(authStatus === 'true');
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // 路由保护逻辑
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // 检查当前路径是否需要认证
      if (PROTECTED_ROUTES.some(route => pathname?.startsWith(route))) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = () => {
    //BUG 打开 Google 登录页面 
    // window.open('https://accounts.google.com/o/oauth2/v2/auth', '_target');
  
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    router.push('/');
  };

  // 检查是否有权限访问特定页面
  const checkAccess = (path: string): boolean => {
    if (PROTECTED_ROUTES.some(route => path.startsWith(route))) {
      return isAuthenticated;
    }
    return true;
  };

  // 检查是否可以使用需要认证的功能
  const requireAuth = (): boolean => {
    if (!isAuthenticated) {
      // 如果在需要认证功能的页面
      if (PROTECTED_FEATURES.some(route => pathname?.startsWith(route))) {
        router.push('/login?redirect=' + encodeURIComponent(pathname || ''));
        return false;
      }
    }
    return isAuthenticated;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAccess, requireAuth }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
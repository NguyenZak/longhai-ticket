'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, getUser, logout, isAuthenticated } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// BroadcastChannel để đồng bộ giữa các tab
const authChannel = typeof window !== 'undefined' ? new BroadcastChannel('auth-sync') : null;

// Chỉ log một lần khi module được load
if (typeof window !== 'undefined') {
  console.log('🔧 AuthContext: BroadcastChannel created:', !!authChannel);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authKey, setAuthKey] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Kiểm tra authentication
  const checkAuth = () => {
    try {
      const token = getToken();
      const userData = getUser();
      
      console.log('🔧 AuthContext: checkAuth called', { 
        token: !!token, 
        userData: !!userData,
        tokenValue: token,
        userDataValue: userData
      });
      
      if (token && userData && userData !== 'undefined') {
        setUser(userData);
        console.log('🔧 AuthContext: User authenticated', userData);
      } else {
        setUser(null);
        console.log('🔧 AuthContext: User not authenticated - clearing data');
        // Clear invalid data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('🔧 AuthContext: Error in checkAuth', error);
      setUser(null);
      // Clear invalid data on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra auth khi component mount (chỉ 1 lần)
  useEffect(() => {
    if (!isInitialized) {
      console.log('🔧 AuthContext: Provider mounted');
      checkAuth();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Kiểm tra auth khi authKey thay đổi (chỉ khi đã initialized)
  useEffect(() => {
    if (authKey > 0 && isInitialized) {
      console.log('🔄 Auth key changed, checking auth...');
      checkAuth();
    }
  }, [authKey, isInitialized]);

  // Listen for auth events from other tabs
  useEffect(() => {
    if (authChannel) {
      const handleMessage = (event: MessageEvent) => {
        console.log('🔧 AuthContext: Received broadcast message', event.data);
        if (event.data.type === 'LOGIN') {
          setUser(event.data.data);
        } else if (event.data.type === 'LOGOUT') {
          setUser(null);
        }
      };

      authChannel.addEventListener('message', handleMessage);
      return () => authChannel.removeEventListener('message', handleMessage);
    }
  }, []);

  // Tự động redirect về /auth/login nếu user bị set null (logout hoặc hết hạn token)
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    console.log('🔧 AuthContext: handleLogout called');
    logout();
    setUser(null);
    setAuthKey(prev => prev + 1); // Force reload state
    // Broadcast logout event
    if (authChannel) {
      authChannel.postMessage({ type: 'LOGOUT' });
    }
  };

  const handleSetUser = (userData: any) => {
    console.log('🔧 AuthContext: handleSetUser called', userData);
    setUser(userData);
    setAuthKey(prev => prev + 1); // Force reload state
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    logout: handleLogout,
    setUser: handleSetUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export function để broadcast auth events
export const broadcastAuthEvent = (type: 'LOGIN' | 'LOGOUT', data?: any) => {
  console.log('🔧 broadcastAuthEvent called:', type, data);
  if (authChannel) {
    console.log('📤 Broadcasting auth event:', type, data);
    authChannel.postMessage({ type, data });
    console.log('✅ Broadcast message sent');
  } else {
    console.log('❌ No BroadcastChannel available for broadcasting');
  }
}; 
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string; // Tùy chọn: nơi chuyển hướng nếu không login
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = <div>Loading...</div>,
  redirectTo = '/auth/login'
}) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (loading || !isAuthenticated) {
    return <>{fallback}</>; // fallback khi loading hoặc chưa xác thực
  }

  return <>{children}</>;
};

export default ProtectedRoute;

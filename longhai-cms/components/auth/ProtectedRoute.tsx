'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = <div>Loading...</div> 
}) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Không redirect nữa, chỉ hiển thị loading hoặc null
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     router.push('/auth/login');
  //   }
  // }, [isAuthenticated, loading, router]);

  if (loading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return null; // Không redirect nữa, chỉ return null
  }

  return <>{children}</>;
};

export default ProtectedRoute; 
'use client';

import React, { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import IconUser from '@/components/icon/icon-user';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await apiCall('/profile', { method: 'GET' });
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="ml-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-1 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center">
        <IconUser className="w-8 h-8 text-gray-400" />
        <div className="ml-3">
          <div className="text-sm font-medium text-gray-900 dark:text-white">Guest</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Not logged in</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="relative">
        <img
          src={user.avatar || '/images/profile-default.png'}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
        />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
      </div>
      <div className="ml-3">
        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
      </div>
    </div>
  );
};

export default UserProfile; 
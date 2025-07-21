'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '@/lib/api';
import IconSearch from '@/components/icon/icon-search';
import IconSend from '@/components/icon/icon-send';
import IconMoodSmile from '@/components/icon/icon-mood-smile';
import IconPaperclip from '@/components/icon/icon-paperclip';
import IconPhone from '@/components/icon/icon-phone';
import IconVideo from '@/components/icon/icon-video';
import IconMore from '@/components/icon/icon-more';
import PerfectScrollbar from 'react-perfect-scrollbar';
import EmojiPicker from 'emoji-picker-react';

interface User {
  id: number;
  name: string;
  avatar?: string;
  last_seen_at?: string;
  unread_count?: number;
}

interface Message {
  id: number;
  from_user_id: number;
  to_user_id: number;
  message: string;
  type: 'text' | 'image' | 'file';
  read_at?: string;
  created_at: string;
  fromUser: User;
  toUser: User;
}

interface Conversation {
  id: number;
  name: string;
  avatar?: string;
  last_seen_at?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

const InternalChat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get current user info
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await apiCall('/user', { method: 'GET' });
        if (response.success) {
          setCurrentUser(response.data);
        }
      } catch (error) {
        console.error('Error getting user info:', error);
      }
    };
    getUserInfo();
  }, []);

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/chat/conversations', { method: 'GET' });
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load online users
  const loadOnlineUsers = async () => {
    try {
      const response = await apiCall('/chat/online-users', { method: 'GET' });
      if (response.success) {
        setOnlineUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading online users:', error);
    }
  };

  // Load messages for selected user
  const loadMessages = async (userId: number) => {
    try {
      setLoading(true);
      const response = await apiCall(`/chat/messages?user_id=${userId}`, { method: 'GET' });
      if (response.success) {
        setMessages(response.data);
        // Mark messages as read
        await apiCall('/chat/mark-read', { 
          method: 'POST', 
          body: JSON.stringify({ user_id: userId }) 
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await apiCall('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          to_user_id: selectedUser.id,
          message: newMessage.trim(),
          type: 'text'
        })
      });

      if (response.success) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        // Reload conversations to update last message
        loadConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Select user to chat with
  const selectUser = (user: User) => {
    setSelectedUser(user);
    loadMessages(user.id);
  };

  // Update last seen periodically
  useEffect(() => {
    const updateLastSeen = async () => {
      try {
        await apiCall('/chat/update-last-seen', { method: 'POST' });
      } catch (error) {
        console.error('Error updating last seen:', error);
      }
    };

    const interval = setInterval(updateLastSeen, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Load initial data
  useEffect(() => {
    loadConversations();
    loadOnlineUsers();
  }, []);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if user is online
  const isUserOnline = (lastSeenAt?: string) => {
    if (!lastSeenAt) return false;
    const lastSeen = new Date(lastSeenAt);
    const now = new Date();
    return (now.getTime() - lastSeen.getTime()) < 5 * 60 * 1000; // 5 minutes
  };

  // Thêm hàm xử lý chọn emoji
  const addEmoji = (emoji: any) => {
    setNewMessage(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Conversations */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Nội Bộ</h2>
          <div className="mt-3 relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <IconSearch className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Online Users */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Đang Online</h3>
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => selectUser(user)}
              >
                <div className="relative">
                  <img
                    src={user.avatar || '/images/profile-default.png'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-hidden">
          <PerfectScrollbar>
            <div className="p-4 space-y-2">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === conversation.id
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => selectUser({
                      id: conversation.id,
                      name: conversation.name,
                      avatar: conversation.avatar,
                      last_seen_at: conversation.last_seen_at
                    })}
                  >
                    <div className="relative">
                      <img
                        src={conversation.avatar || '/images/profile-default.png'}
                        alt={conversation.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {isUserOnline(conversation.last_seen_at) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conversation.name}
                        </h4>
                        {conversation.unread_count > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {conversation.last_message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PerfectScrollbar>
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={selectedUser.avatar || '/images/profile-default.png'}
                    alt={selectedUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {isUserOnline(selectedUser.last_seen_at) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedUser.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isUserOnline(selectedUser.last_seen_at) ? 'Đang online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <IconPhone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <IconVideo className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <IconMore className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
              <PerfectScrollbar>
                <div className="p-4 space-y-4">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.from_user_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.from_user_id === currentUser?.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.created_at).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </PerfectScrollbar>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <IconPaperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowEmojiPicker(v => !v)}
                  type="button"
                >
                  <IconMoodSmile className="w-5 h-5" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-14 left-0 z-50">
                    <EmojiPicker onEmojiClick={(_, emojiObject) => addEmoji(emojiObject)} />
                  </div>
                )}
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconSend className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconSend className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Chào mừng đến với Chat Nội Bộ
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Chọn một cuộc trò chuyện để bắt đầu nhắn tin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternalChat; 
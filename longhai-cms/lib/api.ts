export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: any;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Utility function để lấy token từ localStorage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('access_token');
      console.log('🔧 getToken: Token from localStorage:', token ? 'found' : 'not found');
      return token && token !== 'undefined' && token !== 'null' ? token : null;
    } catch (error) {
      console.error('🔧 getToken error:', error);
      return null;
    }
  }
  return null;
};

// Utility function để lấy user info từ localStorage
export const getUser = (): any => {
  if (typeof window !== 'undefined') {
    try {
      const userStr = localStorage.getItem('user');
      
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      
      const user = JSON.parse(userStr);
      return user;
    } catch (error) {
      console.error('🔧 getUser error:', error);
      // Clear invalid data
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

// Utility function để logout
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    // Xóa cookie token
    document.cookie = 'token=; Max-Age=0; path=/;';
  }
};

// API call function với authentication
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const defaultHeaders: HeadersInit = {
    'Accept': 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
    console.log('🔧 apiCall: Token found, adding Authorization header');
  } else {
    console.log('🔧 apiCall: No token found');
  }

  // Luôn đảm bảo endpoint gọi về backend Laravel
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = cleanEndpoint.startsWith('/api/')
    ? `${API_BASE_URL}${cleanEndpoint}`
    : `${API_BASE_URL}/api${cleanEndpoint}`;

  console.log('🔧 apiCall: URL:', url);
  console.log('🔧 apiCall: Headers:', defaultHeaders);

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        throw new Error('Phiên đăng nhập đã hết hạn');
      }
      const error: any = new Error(data.message || 'Có lỗi xảy ra');
      if (data.errors) error.errors = data.errors;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Login function
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  console.log('🔧 login: Starting login process for', email);
  
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  console.log('🔧 login: API response status:', response.status);

  if (!response.ok) {
    console.error('🔧 login: Login failed:', data);
    throw new Error(data.message || 'Đăng nhập thất bại');
  }

  console.log('🔧 login: Login successful, storing token and user data');
  
  // Store token and user data
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    // Lưu token vào cookie để middleware nhận diện
    document.cookie = `token=${data.access_token}; path=/;`;
    console.log('🔧 login: Token and user data stored in localStorage');
  }

  return data;
};

// Logout function
export const logoutApi = async (): Promise<void> => {
  try {
    await apiCall('/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    logout();
  }
};

// Get user profile
export const getUserProfile = async (): Promise<any> => {
  return await apiCall('/user');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  const user = getUser();
  const authenticated = token !== null && user !== null;
  console.log('🔧 isAuthenticated:', { token: !!token, user: !!user, authenticated });
  return authenticated;
}; 

// Scrumboard API
export const scrumboardAPI = {
    // Get all projects with tasks
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/scrumboard`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    },

    // Project methods
    createProject: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/scrumboard/projects`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    updateProject: async (id: number, data: any) => {
        const response = await fetch(`${API_BASE_URL}/scrumboard/projects/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    deleteProject: async (id: number) => {
        const response = await fetch(`${API_BASE_URL}/scrumboard/projects/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    },

    clearProjectTasks: async (id: number) => {
        const response = await fetch(`${API_BASE_URL}/scrumboard/projects/${id}/tasks`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    },

    // Task methods
    createTask: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/scrumboard/tasks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    updateTask: async (id: number, data: any) => {
        const response = await fetch(`${API_BASE_URL}/scrumboard/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    deleteTask: async (id: number) => {
        const response = await fetch(`${API_BASE_URL}/scrumboard/tasks/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    },

    updateTaskOrder: async (tasks: any[]) => {
        const response = await fetch(`${API_BASE_URL}/scrumboard/tasks/order`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tasks }),
        });
        return response.json();
    },
}; 
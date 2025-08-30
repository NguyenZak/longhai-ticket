import { create } from 'zustand';
import { apiCall } from '../lib/api';

interface Booking {
  id: number;
  user_id: number;
  event_id: number;
  quantity: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  user?: any;
  event?: any;
}

interface BookingStore {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  filters: {
    status?: string;
    eventId?: number;
    userId?: number;
    dateFrom?: string;
    dateTo?: string;
  };
  
  // Actions
  fetchBookings: () => Promise<void>;
  createBooking: (bookingData: any) => Promise<void>;
  updateBooking: (id: number, data: any) => Promise<void>;
  cancelBooking: (id: number) => Promise<void>;
  confirmBooking: (id: number) => Promise<void>;
  setFilters: (filters: any) => void;
  clearFilters: () => void;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  loading: false,
  error: null,
  filters: {},
  
  fetchBookings: async () => {
    set({ loading: true, error: null });
    try {
      const filters = get().filters;
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
      
      const response = await apiCall(`/bookings?${queryParams.toString()}`);
      set({ bookings: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  createBooking: async (bookingData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });
      
      const newBooking = response.data;
      set(state => ({
        bookings: [newBooking, ...state.bookings],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  updateBooking: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiCall(`/bookings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      const updatedBooking = response.data;
      set(state => ({
        bookings: state.bookings.map(booking => 
          booking.id === id ? updatedBooking : booking
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  cancelBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiCall(`/bookings/${id}/cancel`, { method: 'POST' });
      
      set(state => ({
        bookings: state.bookings.map(booking => 
          booking.id === id 
            ? { ...booking, status: 'cancelled' }
            : booking
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  confirmBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiCall(`/bookings/${id}/confirm`, { method: 'POST' });
      
      set(state => ({
        bookings: state.bookings.map(booking => 
          booking.id === id 
            ? { ...booking, status: 'confirmed' }
            : booking
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },
  
  clearFilters: () => {
    set({ filters: {} });
  }
}));

import axios from 'axios';

const DEFAULT_API_URL = 'https://weekend-mojo.onrender.com/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DEFAULT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (username, password) => api.post('/auth/internal-login', { username, password, role: 'user' }),
  internalLogin: (username, password, role) => api.post('/auth/internal-login', { username, password, role }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updateFCMToken: (fcmToken) => api.post('/auth/fcm-token', { fcmToken }),
};

export const tripAPI = {
  getTrips: (params) => api.get('/trips', { params }),
  getTripById: (id) => api.get(`/trips/${id}`),
  createTrip: (data) => api.post('/trips', data),
  updateTrip: (id, data) => api.put(`/trips/${id}`, data),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
  getPopularTrips: () => api.get('/trips/popular'),
  searchTrips: (query) => api.get('/trips/search', { params: { q: query } }),
};

export const bookingAPI = {
  initiateBooking: (data) => api.post('/bookings/initiate', data),
  confirmPayment: (data) => api.post('/bookings/confirm-payment', data),
  getUserBookings: () => api.get('/bookings/my-bookings'),
  getSeatMap: (tripId, params) => api.get(`/bookings/seat-map/${tripId}`, { params }),
  getBookingDetails: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
};

export const trackingAPI = {
  getBusLocation: (busId) => api.get(`/tracking/bus/${busId}`),
  getTripTracking: (tripId) => api.get(`/tracking/trip/${tripId}`),
  getBookingTracking: (bookingId) => api.get(`/tracking/booking/${bookingId}`),
  getETA: (origin, destination, busId) => api.get('/tracking/eta', { params: { origin, destination, busId } }),
};

export const videoAPI = {
  uploadVideo: (formData) => api.post('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getUserVideos: () => api.get('/videos/my-videos'),
  getAllVideos: (params) => api.get('/videos/all', { params }),
  approveVideo: (videoId, status, rejectionReason) => api.put(`/videos/${videoId}/approve`, { status, rejectionReason }),
  updateMetadata: (videoId, data) => api.put(`/videos/${videoId}/metadata`, data),
  markPublished: (videoId, instagramPostId) => api.put(`/videos/${videoId}/publish`, { instagramPostId }),
};

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getRecentBookings: () => api.get('/admin/dashboard/recent-bookings'),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  getBookings: () => api.get('/admin/bookings'),
  getTrips: () => api.get('/admin/trips'),
  getBuses: () => api.get('/admin/buses'),
  createBus: (data) => api.post('/admin/buses', data),
  updateBus: (id, data) => api.put(`/admin/buses/${id}`, data),
  getFinancialSummary: (params) => api.get('/admin/finance/summary', { params }),
  getDailyRevenue: (params) => api.get('/admin/finance/daily-revenue', { params }),
  getFinancialReport: (params) => api.get('/admin/finance/report', { params }),
};

export const conductorAPI = {
  getAssignedTrips: () => api.get('/conductor/assigned-trips'),
  getPassengerList: (params) => api.get('/conductor/passenger-list', { params }),
  updateCheckinStatus: (data) => api.post('/conductor/checkin', data),
  sendReminder: (data) => api.post('/conductor/send-reminder', data),
  updateBusLocation: (data) => api.post('/conductor/update-location', data),
  getTripSummary: (params) => api.get('/conductor/trip-summary', { params }),
  getBusLocation: (busId) => api.get(`/tracking/bus/${busId}`),
};

export default api;
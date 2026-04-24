import api from './api';

export const conductorAPI = {
  getAssignedTrips: () => api.get('/conductor/assigned-trips'),
  
  getPassengerList: (params) => api.get('/conductor/passenger-list', { params }),
  
  updateCheckinStatus: (data) => api.post('/conductor/checkin', data),
  
  sendReminder: (data) => api.post('/conductor/send-reminder', data),
  
  updateBusLocation: (data) => api.post('/conductor/update-location', data),
  
  getTripSummary: (params) => api.get('/conductor/trip-summary', { params }),
  
  getBusLocation: (busId) => api.get(`/tracking/bus/${busId}`)
};
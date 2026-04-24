import api from './api';

export const editorAPI = {
  getVideosForEditing: (params) => api.get('/videos/all', { params }),
  
  updateVideoMetadata: (videoId, data) => api.put(`/videos/${videoId}/metadata`, data),
  
  markAsReadyToPublish: (videoId) => api.put(`/videos/${videoId}/ready`),
  
  publishToInstagram: (videoId, instagramPostId) => api.put(`/videos/${videoId}/publish`, { instagramPostId }),
  
  getPublishQueue: () => api.get('/videos/queue'),
  
  removeFromQueue: (videoId) => api.delete(`/videos/queue/${videoId}`)
};
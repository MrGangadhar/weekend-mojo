import { useState, useEffect } from 'react';
import { videoAPI } from '../../services/api';
import { FiSend, FiCheck, FiClock, FiInstagram, FiTrash2, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardShell } from '../../components/common/DashboardLayout';

export default function PublishQueue() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  
  useEffect(() => {
    fetchReadyVideos();
  }, []);
  
  const fetchReadyVideos = async () => {
    try {
      const response = await videoAPI.getAllVideos({ status: 'ready_to_publish' });
      setVideos(response.data.videos);
    } catch (error) {
      toast.error('Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };
  
  const publishToInstagram = async (video) => {
    try {
      // This would integrate with Instagram Graph API
      // For now, we'll simulate the publish process
      toast.loading('Publishing to Instagram...', { id: 'publish' });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await videoAPI.markPublished(video._id, `ig_${Date.now()}`);
      
      toast.success('Video published to Instagram!', { id: 'publish' });
      fetchReadyVideos();
    } catch (error) {
      toast.error('Failed to publish to Instagram', { id: 'publish' });
    }
  };
  
  const schedulePublish = async (video) => {
    if (!scheduledDate) {
      toast.error('Please select a date and time');
      return;
    }
    
    try {
      // This would schedule the post using a job queue
      await videoAPI.updateMetadata(video._id, { 
        publishScheduledAt: scheduledDate,
        status: 'scheduled' 
      });
      
      toast.success(`Video scheduled for ${new Date(scheduledDate).toLocaleString()}`);
      setSelectedVideo(null);
      fetchReadyVideos();
    } catch (error) {
      toast.error('Failed to schedule video');
    }
  };
  
  const removeFromQueue = async (videoId) => {
    if (window.confirm('Remove this video from the publishing queue?')) {
      try {
        await videoAPI.updateMetadata(videoId, { status: 'approved' });
        toast.success('Video removed from queue');
        fetchReadyVideos();
      } catch (error) {
        toast.error('Failed to remove video');
      }
    }
  };
  
  const previewVideo = (video) => {
    window.open(video.url, '_blank');
  };

  const queueMetrics = [
    {
      title: 'Ready to Publish',
      value: videos.length,
      icon: FiClock,
      color: 'bg-orange-500',
      note: 'Videos waiting in the queue',
    },
    {
      title: 'Published Today',
      value: 0,
      icon: FiCheck,
      color: 'bg-green-500',
      note: 'Auto-updated when integrations land',
    },
    {
      title: 'Scheduled',
      value: 0,
      icon: FiSend,
      color: 'bg-blue-500',
      note: 'Queued for timed publishing',
    },
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  return (
    <DashboardShell
      eyebrow="Editor Portal"
      title="Publishing Queue"
      subtitle="Manage ready-to-publish videos with scheduling, previews, and queue control."
      actions={
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg flex items-center">
          <FiInstagram className="mr-2" />
          Instagram Publisher
        </div>
      }
      metrics={queueMetrics}
    >
      <div className="space-y-4">
          {videos.map((video) => (
            <div key={video._id} className="dashboard-panel overflow-hidden hover:-translate-y-0.5 transition">
              <div className="flex flex-col md:flex-row">
                {/* Thumbnail */}
                <div className="md:w-48 h-32 bg-gray-900 relative cursor-pointer" onClick={() => previewVideo(video)}>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <FiEye className="text-white w-8 h-8" />
                  </div>
                </div>
                
                {/* Video Info */}
                <div className="flex-1 p-4">
                  <h3 className="font-semibold text-lg mb-1">{video.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">By: {video.userId?.name || video.userId?.mobile}</p>
                  
                  {video.caption && (
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Caption:</span> {video.caption}
                    </p>
                  )}
                  
                  {video.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {video.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs text-blue-600">#{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      Uploaded: {new Date(video.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex space-x-2">
                      {selectedVideo?._id === video._id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="datetime-local"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="input-field text-sm py-1"
                          />
                          <button
                            onClick={() => schedulePublish(video)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                          >
                            Schedule
                          </button>
                          <button
                            onClick={() => setSelectedVideo(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedVideo(video)}
                            className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 flex items-center"
                          >
                            <FiClock className="mr-1" />
                            Schedule
                          </button>
                          <button
                            onClick={() => publishToInstagram(video)}
                            className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-sm hover:from-pink-600 hover:to-purple-600 flex items-center"
                          >
                            <FiInstagram className="mr-1" />
                            Publish Now
                          </button>
                          <button
                            onClick={() => removeFromQueue(video._id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                          >
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {videos.length === 0 && (
          <div className="dashboard-panel p-12 text-center">
            <FiInstagram className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Videos in Queue</h3>
            <p className="text-gray-500">Videos marked as "Ready to Publish" will appear here</p>
          </div>
        )}
        
        {/* Publishing Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Publishing Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Best time to post on Instagram: 9-11 AM and 7-9 PM</li>
            <li>• Use relevant hashtags for better reach</li>
            <li>• Add engaging captions to increase engagement</li>
            <li>• Schedule posts for optimal times to maximize views</li>
          </ul>
        </div>
    </DashboardShell>
  );
}
import { useState, useEffect } from 'react';
import { videoAPI } from '../../services/api';
import { FiCheck, FiX, FiEye, FiAlertCircle, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardShell } from '../../components/common/DashboardLayout';

export default function VideoModeration() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState('pending');
  
  useEffect(() => {
    fetchVideos();
  }, [filter]);
  
  const fetchVideos = async () => {
    try {
      const response = await videoAPI.getAllVideos({ status: filter });
      setVideos(response.data.videos);
    } catch (error) {
      toast.error('Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };
  
  const approveVideo = async (videoId) => {
    try {
      await videoAPI.approveVideo(videoId, 'approved');
      toast.success('Video approved successfully');
      fetchVideos();
    } catch (error) {
      toast.error('Failed to approve video');
    }
  };
  
  const rejectVideo = async (videoId) => {
    if (!rejectionReason && !window.confirm('Reject without reason?')) {
      return;
    }
    
    try {
      await videoAPI.approveVideo(videoId, 'rejected', rejectionReason);
      toast.success('Video rejected');
      setRejectionReason('');
      setSelectedVideo(null);
      fetchVideos();
    } catch (error) {
      toast.error('Failed to reject video');
    }
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      ready_to_publish: 'bg-purple-100 text-purple-800',
      published: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const moderationMetrics = [
    {
      title: 'Pending',
      value: videos.filter((video) => video.status === 'pending').length,
      icon: FiClock,
      color: 'bg-orange-500',
      note: 'Waiting for review',
    },
    {
      title: 'Approved',
      value: videos.filter((video) => video.status === 'approved').length,
      icon: FiCheck,
      color: 'bg-green-500',
      note: 'Ready for editor workflow',
    },
    {
      title: 'Rejected',
      value: videos.filter((video) => video.status === 'rejected').length,
      icon: FiX,
      color: 'bg-red-500',
      note: 'Blocked submissions',
    },
    {
      title: 'Published',
      value: videos.filter((video) => video.status === 'published').length,
      icon: FiEye,
      color: 'bg-blue-500',
      note: 'Live in the content pipeline',
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
      eyebrow="Management Portal"
      title="Video Moderation"
      subtitle="Review uploaded videos with a faster, cleaner moderation workflow."
      actions={
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'pending' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'approved' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'rejected' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Rejected
          </button>
        </div>
      }
      metrics={moderationMetrics}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <div key={video._id} className="dashboard-panel overflow-hidden transition hover:-translate-y-0.5">
              <div className="relative h-48 bg-gray-900 cursor-pointer" onClick={() => setSelectedVideo(video)}>
                <video
                  src={video.url}
                  className="w-full h-full object-cover"
                  poster={video.thumbnail}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                  <FiEye className="text-white w-8 h-8" />
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(video.status)}`}>
                    {video.status}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{video.title}</h3>
                <p className="text-sm text-gray-600 mb-2">By: {video.userId?.name || video.userId?.mobile}</p>

                {video.caption && (
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {video.caption}
                  </p>
                )}

                {video.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {video.hashtags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs text-blue-600">#{tag}</span>
                    ))}
                    {video.hashtags.length > 3 && (
                      <span className="text-xs text-gray-400">+{video.hashtags.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span>Uploaded: {new Date(video.createdAt).toLocaleDateString()}</span>
                  <span>Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                </div>

                {video.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => approveVideo(video._id)}
                      className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600 transition flex items-center justify-center"
                    >
                      <FiCheck className="mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVideo(video);
                        setRejectionReason('');
                      }}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition flex items-center justify-center"
                    >
                      <FiX className="mr-1" />
                      Reject
                    </button>
                  </div>
                )}

                {video.status === 'approved' && (
                  <div className="text-center text-green-600 text-sm">
                    <FiCheck className="inline mr-1" />
                    Approved on {new Date(video.approvedAt).toLocaleDateString()}
                  </div>
                )}

                {video.status === 'rejected' && video.rejectionReason && (
                  <div className="text-center text-red-600 text-sm">
                    <FiAlertCircle className="inline mr-1" />
                    Reason: {video.rejectionReason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="dashboard-panel p-12 text-center">
            <FiClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Videos to Moderate</h3>
            <p className="text-gray-500">Videos uploaded by users will appear here for moderation</p>
          </div>
        )}

        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">{selectedVideo.title}</h2>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <video
                  src={selectedVideo.url}
                  controls
                  autoPlay
                  className="w-full rounded-lg mb-4"
                  poster={selectedVideo.thumbnail}
                />

                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-700">Description</h3>
                    <p className="text-gray-600">{selectedVideo.description || 'No description'}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700">Caption</h3>
                    <p className="text-gray-600">{selectedVideo.caption || 'No caption'}</p>
                  </div>

                  {selectedVideo.hashtags?.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700">Hashtags</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedVideo.hashtags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedVideo.location && (
                    <div>
                      <h3 className="font-medium text-gray-700">Location</h3>
                      <p className="text-gray-600">{selectedVideo.location.name}</p>
                    </div>
                  )}

                  {selectedVideo.status === 'pending' && (
                    <div className="border-t pt-4 mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason (Optional)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="input-field mb-3"
                        rows="3"
                        placeholder="Enter reason for rejection..."
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={() => approveVideo(selectedVideo._id)}
                          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                          Approve Video
                        </button>
                        <button
                          onClick={() => rejectVideo(selectedVideo._id)}
                          className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                        >
                          Reject Video
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
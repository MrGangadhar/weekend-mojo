import { useState, useEffect } from 'react';
import { videoAPI } from '../../services/api';
import { FiEdit2, FiCheck, FiX, FiSend, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardShell } from '../../components/common/DashboardLayout';

export default function EditorPanel() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editForm, setEditForm] = useState({ caption: '', hashtags: '' });
  
  useEffect(() => {
    fetchVideos();
  }, []);
  
  const fetchVideos = async () => {
    try {
      const response = await videoAPI.getAllVideos({ status: 'approved' });
      setVideos(response.data.videos);
    } catch (error) {
      toast.error('Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (video) => {
    setEditingVideo(video);
    setEditForm({
      caption: video.caption || '',
      hashtags: video.hashtags?.join(', ') || ''
    });
  };
  
  const handleSave = async () => {
    try {
      await videoAPI.updateMetadata(editingVideo._id, {
        caption: editForm.caption,
        hashtags: editForm.hashtags.split(',').map(h => h.trim())
      });
      toast.success('Video updated successfully');
      setEditingVideo(null);
      fetchVideos();
    } catch (error) {
      toast.error('Failed to update video');
    }
  };
  
  const handleMarkReady = async (videoId) => {
    try {
      await videoAPI.updateMetadata(videoId, { status: 'ready_to_publish' });
      toast.success('Video marked as ready to publish');
      fetchVideos();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };
  
  const handlePublish = async (videoId) => {
    try {
      await videoAPI.markPublished(videoId, `ig_${Date.now()}`);
      toast.success('Video published to Instagram queue');
      fetchVideos();
    } catch (error) {
      toast.error('Failed to publish');
    }
  };

  const editorMetrics = [
    {
      title: 'Approved Videos',
      value: videos.length,
      icon: FiCheck,
      color: 'bg-green-500',
      note: 'Ready for editor review',
    },
    {
      title: 'Ready to Publish',
      value: videos.filter((video) => video.status === 'ready_to_publish').length,
      icon: FiSend,
      color: 'bg-purple-500',
      note: 'Queued for publishing',
    },
    {
      title: 'Published',
      value: videos.filter((video) => video.status === 'published').length,
      icon: FiEye,
      color: 'bg-blue-500',
      note: 'Live or scheduled outputs',
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
      title="Approved Videos"
      subtitle="Review approved content, update metadata, and move assets through the publishing pipeline."
      metrics={editorMetrics}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <div key={video._id} className="dashboard-panel overflow-hidden">
              <div className="relative h-48 bg-gray-900">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                  <button className="bg-white rounded-full p-2">
                    <FiEye className="w-6 h-6 text-gray-800" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{video.title}</h3>
                <p className="text-sm text-gray-500 mb-2">By: {video.userId?.name || video.userId?.mobile}</p>

                {editingVideo?._id === video._id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.caption}
                      onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                      className="input-field text-sm"
                      placeholder="Caption"
                    />
                    <input
                      type="text"
                      value={editForm.hashtags}
                      onChange={(e) => setEditForm({ ...editForm, hashtags: e.target.value })}
                      className="input-field text-sm"
                      placeholder="Hashtags (comma separated)"
                    />
                    <div className="flex space-x-2">
                      <button onClick={handleSave} className="flex-1 btn-primary text-sm py-2">
                        <FiCheck className="inline mr-1" /> Save
                      </button>
                      <button onClick={() => setEditingVideo(null)} className="btn-secondary text-sm py-2">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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

                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleEdit(video)}
                        className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition"
                      >
                        <FiEdit2 className="inline mr-1" /> Edit
                      </button>
                      {video.status === 'approved' && (
                        <button
                          onClick={() => handleMarkReady(video._id)}
                          className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600 transition"
                        >
                          <FiSend className="inline mr-1" /> Ready
                        </button>
                      )}
                      {video.status === 'ready_to_publish' && (
                        <button
                          onClick={() => handlePublish(video._id)}
                          className="flex-1 bg-purple-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-600 transition"
                        >
                          <FiSend className="inline mr-1" /> Publish
                        </button>
                      )}
                    </div>
                  </>
                )}

                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  Status:
                  <span className={`ml-1 px-2 py-0.5 rounded-full ${
                    video.status === 'published' ? 'bg-green-100 text-green-700' :
                    video.status === 'ready_to_publish' ? 'bg-purple-100 text-purple-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {video.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No approved videos available for editing</p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
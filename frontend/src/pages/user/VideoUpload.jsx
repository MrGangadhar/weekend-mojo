import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI, tripAPI } from '../../services/api';
import { FiUpload, FiX, FiMapPin, FiHash, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { PublicPageShell } from '../../components/common/PublicPageShell';

export default function VideoUpload() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    caption: '',
    hashtags: '',
    location: '',
    tripId: ''
  });
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await tripAPI.getTrips({ page: 1, limit: 100 });
        setTrips(response.data.trips || []);
      } catch (error) {
        console.error('Failed to load trips for upload:', error);
      }
    };

    fetchTrips();
  }, []);
  
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      toast.error('Please select a valid video file');
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a video');
      return;
    }
    
    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }
    
    setUploading(true);
    
    const uploadData = new FormData();
    uploadData.append('video', selectedFile);
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('caption', formData.caption);
    uploadData.append('hashtags', JSON.stringify(formData.hashtags.split(',').map(h => h.trim())));
    if (formData.location) uploadData.append('location', JSON.stringify({ name: formData.location }));
    if (formData.tripId) uploadData.append('tripId', formData.tripId);
    
    try {
      const response = await videoAPI.uploadVideo(uploadData);
      toast.success('Video uploaded successfully! Waiting for approval.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <PublicPageShell
      eyebrow="User Content"
      title="Upload your travel video"
      subtitle="Share your travel moments with a polished upload flow and a clear review path."
      className="pb-12"
    >
      <div className="mx-auto max-w-4xl">
        <div className="dashboard-panel overflow-hidden">
          <div className="dashboard-panel-body space-y-8">
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-6 text-center hover:border-orange-400 transition cursor-pointer"
                 onClick={() => document.getElementById('video-input').click()}>
              {preview ? (
                <div className="relative">
                  <video
                    src={preview}
                    className="max-h-72 mx-auto rounded-2xl shadow-xl"
                    controls
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <FiX />
                  </button>
                </div>
              ) : (
                <div>
                  <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-slate-700 font-medium">Click to select video</p>
                  <p className="text-sm text-slate-500">MP4, MOV, AVI (Max 100MB)</p>
                </div>
              )}
            </div>
            <input
              id="video-input"
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="My amazing trip to..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Tell the story behind this video..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Caption</label>
                  <input
                    type="text"
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    className="input-field"
                    placeholder="A short caption for social media..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="Where was this video taken?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hashtags (comma separated)</label>
                <input
                  type="text"
                  value={formData.hashtags}
                  onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                  className="input-field"
                  placeholder="travel, adventure, weekendmojo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Related Trip (Optional)</label>
                <select
                  value={formData.tripId}
                  onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select a trip</option>
                  {trips.map(trip => (
                    <option key={trip._id} value={trip._id}>{trip.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="btn-primary w-full"
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </span>
                ) : (
                  'Upload Video'
                )}
              </button>

              <p className="text-xs text-center text-slate-500">
                By uploading, you agree to our terms and conditions. Videos will be reviewed before publishing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
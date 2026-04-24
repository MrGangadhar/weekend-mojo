import { useState, useEffect } from 'react';
import { tripAPI, adminAPI } from '../../services/api';
import { FiEdit, FiTrash2, FiPlus, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardShell } from '../../components/common/DashboardLayout';

export default function TripsManagement() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    duration: '',
    price: '',
    images: [],
    itinerary: []
  });
  
  useEffect(() => {
    fetchTrips();
  }, []);
  
  const fetchTrips = async () => {
    try {
      const response = await tripAPI.getTrips({ limit: 100 });
      setTrips(response.data.trips);
    } catch (error) {
      toast.error('Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTrip) {
        await tripAPI.updateTrip(editingTrip._id, formData);
        toast.success('Trip updated successfully');
      } else {
        await tripAPI.createTrip(formData);
        toast.success('Trip created successfully');
      }
      fetchTrips();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await tripAPI.deleteTrip(id);
        toast.success('Trip deleted successfully');
        fetchTrips();
      } catch (error) {
        toast.error('Failed to delete trip');
      }
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      duration: '',
      price: '',
      images: [],
      itinerary: []
    });
    setEditingTrip(null);
  };

  const tripMetrics = [
    {
      title: 'Total Trips',
      value: trips.length,
      icon: FiPlus,
      color: 'bg-blue-500',
      note: 'Trips currently stored',
    },
    {
      title: 'Active Trips',
      value: trips.filter((trip) => trip.status === 'active').length,
      icon: FiEye,
      color: 'bg-green-500',
      note: 'Visible to customers',
    },
    {
      title: 'Inactive Trips',
      value: trips.filter((trip) => trip.status !== 'active').length,
      icon: FiTrash2,
      color: 'bg-slate-900',
      note: 'Draft or archived entries',
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
      title="Trip Management"
      subtitle="Create, edit, and publish trip inventory with a cleaner operational overview."
      actions={
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center"
        >
          <FiPlus className="mr-2" />
          Add New Trip
        </button>
      }
      metrics={tripMetrics}
    >
      <div className="dashboard-panel overflow-hidden">
        <div className="dashboard-panel-header">
          <h2 className="dashboard-panel-title">Trips</h2>
          <p className="dashboard-panel-subtitle">A complete list of trip records with quick editing controls.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trips.map((trip) => (
                <tr key={trip._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img src={trip.thumbnail} alt={trip.title} className="w-10 h-10 rounded object-cover mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{trip.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{trip.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{trip.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{trip.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{trip.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      trip.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => {
                        setEditingTrip(trip);
                        setFormData(trip);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(trip._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit Trip */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingTrip ? 'Edit Trip' : 'Add New Trip'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="4"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration *
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 2D/1N"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL (Thumbnail)
                </label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingTrip ? 'Update' : 'Create'} Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
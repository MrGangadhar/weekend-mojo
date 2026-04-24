import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiEdit, FiTrash2, FiPlus, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardShell } from '../../components/common/DashboardLayout';

export default function BusesManagement() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    operatorName: '',
    busNumber: '',
    type: 'AC',
    totalSeats: 40,
    amenities: [],
    driverDetails: { name: '', phone: '', licenseNumber: '' },
    conductorDetails: { name: '', phone: '', employeeId: '' }
  });
  
  useEffect(() => {
    fetchBuses();
  }, []);
  
  const fetchBuses = async () => {
    try {
      const response = await adminAPI.getBuses();
      setBuses(response.data);
    } catch (error) {
      toast.error('Failed to fetch buses');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBus) {
        await adminAPI.updateBus(editingBus._id, formData);
        toast.success('Bus updated successfully');
      } else {
        await adminAPI.createBus(formData);
        toast.success('Bus created successfully');
      }
      fetchBuses();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };
  
  const resetForm = () => {
    setFormData({
      operatorName: '',
      busNumber: '',
      type: 'AC',
      totalSeats: 40,
      amenities: [],
      driverDetails: { name: '', phone: '', licenseNumber: '' },
      conductorDetails: { name: '', phone: '', employeeId: '' }
    });
    setEditingBus(null);
  };

  const busMetrics = [
    {
      title: 'Total Buses',
      value: buses.length,
      icon: FiMapPin,
      color: 'bg-blue-500',
      note: 'Fleet size across operators',
    },
    {
      title: 'Active Buses',
      value: buses.filter((bus) => bus.status === 'active').length,
      icon: FiPlus,
      color: 'bg-green-500',
      note: 'Available for assignment',
    },
    {
      title: 'Seat Capacity',
      value: buses.reduce((total, bus) => total + (bus.totalSeats || 0), 0),
      icon: FiEdit,
      color: 'bg-orange-500',
      note: 'Combined passenger capacity',
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
      title="Bus Management"
      subtitle="Keep the fleet clean, current, and ready for trip assignment."
      actions={
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center"
        >
          <FiPlus className="mr-2" />
          Add New Bus
        </button>
      }
      metrics={busMetrics}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {buses.map((bus) => (
            <div key={bus._id} className="dashboard-panel overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{bus.busNumber}</h3>
                    <p className="text-gray-600 text-sm">{bus.operatorName}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingBus(bus);
                        setFormData(bus);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{bus.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Seats:</span>
                  <span className="font-medium">{bus.totalSeats}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    bus.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {bus.status}
                  </span>
                </div>
                {bus.amenities?.length > 0 && (
                  <div className="text-sm">
                    <span className="text-gray-600">Amenities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {bus.amenities.map((amenity, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      
      {/* Modal for Add/Edit Bus */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingBus ? 'Edit Bus' : 'Add New Bus'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operator Name *
                  </label>
                  <input
                    type="text"
                    value={formData.operatorName}
                    onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bus Number *
                  </label>
                  <input
                    type="text"
                    value={formData.busNumber}
                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bus Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="AC">AC</option>
                    <option value="Non-AC">Non-AC</option>
                    <option value="Sleeper">Sleeper</option>
                    <option value="Seater">Seater</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Seats *
                  </label>
                  <input
                    type="number"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amenities (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities.join(', ')}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value.split(',').map(a => a.trim()) })}
                  className="input-field"
                  placeholder="WiFi, Charging Point, Water Bottle"
                />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Driver Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Driver Name"
                    value={formData.driverDetails?.name || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      driverDetails: { ...formData.driverDetails, name: e.target.value } 
                    })}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Driver Phone"
                    value={formData.driverDetails?.phone || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      driverDetails: { ...formData.driverDetails, phone: e.target.value } 
                    })}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Conductor Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Conductor Name"
                    value={formData.conductorDetails?.name || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      conductorDetails: { ...formData.conductorDetails, name: e.target.value } 
                    })}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Conductor Phone"
                    value={formData.conductorDetails?.phone || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      conductorDetails: { ...formData.conductorDetails, phone: e.target.value } 
                    })}
                    className="input-field"
                  />
                </div>
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
                  {editingBus ? 'Update' : 'Create'} Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
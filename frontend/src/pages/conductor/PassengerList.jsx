import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { conductorAPI } from '../../services/api';
import { FiCheckCircle, FiXCircle, FiPhone, FiBell, FiUser, FiMapPin, FiClock, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardShell } from '../../components/common/DashboardLayout';

export default function PassengerList() {
  const { tripId, busId } = useParams();
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState([]);
  const [tripDetails, setTripDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, checked, unchecked
  
  useEffect(() => {
    fetchPassengerList();
  }, [tripId, busId]);
  
  const fetchPassengerList = async () => {
    try {
      const response = await conductorAPI.getPassengerList({ tripId, busId });
      setPassengers(response.data);
      setTripDetails(response.data.tripDetails);
    } catch (error) {
      toast.error('Failed to fetch passenger list');
    } finally {
      setLoading(false);
    }
  };
  
  const updateCheckin = async (bookingId, seatNumber, checkedIn) => {
    try {
      await conductorAPI.updateCheckinStatus({ bookingId, seatNumber, checkedIn });
      toast.success(`Passenger ${checkedIn ? 'checked in' : 'marked as not checked'}`);
      fetchPassengerList();
    } catch (error) {
      toast.error('Failed to update check-in status');
    }
  };
  
  const sendReminder = async (bookingId, userId, mobile) => {
    try {
      await conductorAPI.sendReminder({ bookingId, userId, mobile });
      toast.success('Reminder sent successfully');
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };
  
  const makeCall = (mobile) => {
    window.location.href = `tel:${mobile}`;
  };
  
  const getStatistics = () => {
    const total = passengers.length;
    const checkedIn = passengers.filter(p => 
      Object.values(p.checkinStatus || {}).some(v => v === true)
    ).length;
    const notCheckedIn = total - checkedIn;
    const percentage = total > 0 ? (checkedIn / total) * 100 : 0;
    
    return { total, checkedIn, notCheckedIn, percentage };
  };
  
  const filteredPassengers = passengers.filter(passenger => {
    const matchesSearch = passenger.passengerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          passenger.mobile?.includes(searchTerm) ||
                          passenger.seats?.join(',').includes(searchTerm);
    
    if (filter === 'checked') {
      return matchesSearch && Object.values(passenger.checkinStatus || {}).some(v => v === true);
    }
    if (filter === 'unchecked') {
      return matchesSearch && !Object.values(passenger.checkinStatus || {}).some(v => v === true);
    }
    return matchesSearch;
  });
  
  const stats = getStatistics();

  const passengerMetrics = [
    {
      title: 'Total Passengers',
      value: stats.total,
      icon: FiUser,
      color: 'bg-blue-500',
      note: 'All passengers on the manifest',
    },
    {
      title: 'Checked In',
      value: stats.checkedIn,
      icon: FiCheckCircle,
      color: 'bg-green-500',
      note: 'Passengers already checked in',
    },
    {
      title: 'Not Checked',
      value: stats.notCheckedIn,
      icon: FiXCircle,
      color: 'bg-red-500',
      note: 'Passengers still pending',
    },
    {
      title: 'Completion',
      value: `${stats.percentage.toFixed(1)}%`,
      icon: FiClock,
      color: 'bg-orange-500',
      note: 'Check-in completion rate',
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
      eyebrow="Conductor Portal"
      title="Passenger Management"
      subtitle="Search, filter, and update passenger check-in status with a cleaner review flow."
      metrics={passengerMetrics}
    >
      {/* Header */}
      <div className="space-y-6">
          <button
            onClick={() => navigate('/conductor')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Trips
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Passenger Management</h1>
            {tripDetails && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center">
                  <FiMapPin className="text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Trip</p>
                    <p className="font-medium">{tripDetails.tripName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FiClock className="text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Departure</p>
                    <p className="font-medium">{new Date(tripDetails.schedule).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FiUser className="text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Bus Number</p>
                    <p className="font-medium">{tripDetails.busNumber}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500 mb-1">Total Passengers</div>
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm p-4">
            <div className="text-sm text-green-600 mb-1">Checked In</div>
            <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm p-4">
            <div className="text-sm text-red-600 mb-1">Not Checked In</div>
            <div className="text-2xl font-bold text-red-600">{stats.notCheckedIn}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm p-4">
            <div className="text-sm text-blue-600 mb-1">Completion Rate</div>
            <div className="text-2xl font-bold text-blue-600">{stats.percentage.toFixed(1)}%</div>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, mobile, or seat number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('checked')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'checked' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Checked In
              </button>
              <button
                onClick={() => setFilter('unchecked')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'unchecked' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Not Checked
              </button>
            </div>
          </div>
        </div>
        
        {/* Passenger Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passenger Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seat Numbers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPassengers.map((passenger) => {
                  const isCheckedIn = Object.values(passenger.checkinStatus || {}).some(v => v === true);
                  const allSeatsChecked = passenger.seats.every(seat => passenger.checkinStatus?.[seat] === true);
                  
                  return (
                    <tr key={passenger.bookingId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{passenger.passengerName}</div>
                          <div className="text-sm text-gray-500">{passenger.mobile}</div>
                          {passenger.email && (
                            <div className="text-xs text-gray-400">{passenger.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {passenger.seats.map((seat, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                passenger.checkinStatus?.[seat]
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {seat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FiCheckCircle className="mr-1" />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <FiXCircle className="mr-1" />
                            Not Checked In
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => makeCall(passenger.mobile)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Call"
                          >
                            <FiPhone className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => sendReminder(passenger.bookingId, passenger.userId, passenger.mobile)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            title="Send Reminder"
                          >
                            <FiBell className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end space-y-1">
                          {passenger.seats.map((seat) => (
                            <button
                              key={seat}
                              onClick={() => updateCheckin(passenger.bookingId, seat, !passenger.checkinStatus?.[seat])}
                              className={`px-3 py-1 rounded-lg text-sm transition ${
                                passenger.checkinStatus?.[seat]
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {passenger.checkinStatus?.[seat] ? `Undo ${seat}` : `Check In ${seat}`}
                            </button>
                          ))}
                          {passenger.seats.length > 1 && (
                            <button
                              onClick={() => {
                                passenger.seats.forEach(seat => {
                                  updateCheckin(passenger.bookingId, seat, !allSeatsChecked);
                                });
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              {allSeatsChecked ? 'Undo All' : 'Check All'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredPassengers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No passengers found</p>
            </div>
          )}
        </div>
        
        {/* Bulk Actions */}
        {filteredPassengers.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-medium mb-3">Bulk Actions</h3>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const uncheckedPassengers = filteredPassengers.filter(p => 
                    !Object.values(p.checkinStatus || {}).some(v => v === true)
                  );
                  if (window.confirm(`Send reminders to ${uncheckedPassengers.length} unchecked passengers?`)) {
                    uncheckedPassengers.forEach(p => {
                      sendReminder(p.bookingId, p.userId, p.mobile);
                    });
                  }
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Send Reminders to All Unchecked
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Download passenger list as CSV?')) {
                    const headers = ['Name', 'Mobile', 'Seats', 'Status'];
                    const csvData = filteredPassengers.map(p => [
                      p.passengerName,
                      p.mobile,
                      p.seats.join(','),
                      Object.values(p.checkinStatus || {}).some(v => v === true) ? 'Checked In' : 'Not Checked'
                    ]);
                    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `passengers_${tripId}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Export to CSV
              </button>
            </div>
          </div>
        )}
    </DashboardShell>
  );
}
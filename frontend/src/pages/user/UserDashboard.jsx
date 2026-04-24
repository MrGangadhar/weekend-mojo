import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI, authAPI } from '../../services/api';
import { FiCalendar, FiMapPin, FiClock, FiDownload, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { DashboardShell } from '../../components/common/DashboardLayout';

export default function UserDashboard() {
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const [bookingsRes, profileRes] = await Promise.all([
        bookingAPI.getUserBookings(),
        authAPI.getProfile()
      ]);
      setBookings(bookingsRes.data);
      setProfile(profileRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const downloadTicket = async (booking) => {
    if (booking.ticketUrl) {
      window.open(booking.ticketUrl, '_blank');
    } else {
      toast.error('Ticket not available');
    }
  };

  const dashboardMetrics = [
    {
      title: 'Bookings',
      value: bookings.length,
      icon: FiCalendar,
      color: 'bg-blue-500',
      note: 'Total trips you have booked',
    },
    {
      title: 'Confirmed',
      value: bookings.filter((booking) => booking.status === 'confirmed').length,
      icon: FiClock,
      color: 'bg-green-500',
      note: 'Confirmed reservations',
    },
    {
      title: 'Upcoming',
      value: bookings.filter((booking) => booking.status === 'confirmed').length,
      icon: FiMapPin,
      color: 'bg-orange-500',
      note: 'Trips ready for tracking',
    },
    {
      title: 'Profile',
      value: profile?.name ? 'Complete' : 'Pending',
      icon: FiUser,
      color: 'bg-slate-900',
      note: profile?.mobile || 'Update contact details',
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
      eyebrow="User Portal"
      title={`Welcome back, ${profile?.name || 'User'}`}
      subtitle="Manage bookings, profile details, and ticket access from one clean view."
      metrics={dashboardMetrics}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="dashboard-panel p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiUser className="w-12 h-12 text-white" />
                </div>
                <h3 className="font-semibold text-lg">{profile?.name || 'User'}</h3>
                <p className="text-gray-500 text-sm">{profile?.mobile}</p>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    activeTab === 'bookings' 
                      ? 'bg-orange-50 text-orange-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  My Bookings
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    activeTab === 'profile' 
                      ? 'bg-orange-50 text-orange-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Profile Settings
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'bookings' && (
              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <h2 className="dashboard-panel-title">My Bookings</h2>
                  <p className="dashboard-panel-subtitle">All active and past bookings with ticket access.</p>
                </div>
                <div className="dashboard-panel-body">
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No bookings yet</p>
                    <Link to="/" className="text-orange-500 mt-2 inline-block">
                      Browse Trips →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{booking.tripId?.title}</h3>
                            <div className="flex items-center text-gray-500 text-sm mt-1">
                              <FiMapPin className="mr-1" />
                              <span>{booking.tripId?.location}</span>
                              <FiCalendar className="ml-3 mr-1" />
                              <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-2">
                              <span className="text-sm text-gray-600">Seats: </span>
                              <span className="font-medium">{booking.selectedSeats?.join(', ')}</span>
                            </div>
                            <div className="mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {booking.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xl font-bold text-orange-500">₹{booking.finalAmount}</div>
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => downloadTicket(booking)}
                                className="mt-2 text-orange-500 hover:text-orange-600 text-sm flex items-center"
                              >
                                <FiDownload className="mr-1" />
                                Download Ticket
                              </button>
                            )}
                            {booking.status === 'confirmed' && (
                              <Link
                                to={`/tracking/${booking._id}`}
                                className="mt-1 text-blue-500 hover:text-blue-600 text-sm block"
                              >
                                Track Bus →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>
            )}
            
            {activeTab === 'profile' && profile && (
              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <h2 className="dashboard-panel-title">Profile Settings</h2>
                  <p className="dashboard-panel-subtitle">Keep your contact details current for trip updates.</p>
                </div>
                <div className="dashboard-panel-body">
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={profile.name || ''}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      value={profile.mobile}
                      disabled
                      className="input-field bg-gray-100"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await authAPI.updateProfile(profile);
                        toast.success('Profile updated successfully');
                      } catch (error) {
                        toast.error('Failed to update profile');
                      }
                    }}
                    className="btn-primary"
                  >
                    Save Changes
                  </button>
                </form>
                </div>
              </div>
            )}
          </div>
        </div>
    </DashboardShell>
  );
}
import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiUsers, FiCalendar, FiMap, FiDollarSign, FiTrendingUp, FiEye } from 'react-icons/fi';
import { BiBus } from 'react-icons/bi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardShell } from '../../components/common/DashboardLayout';

export default function ManagementDashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes, revenueRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getRecentBookings(),
        adminAPI.getDailyRevenue({ days: 30 })
      ]);
      setStats(statsRes.data);
      setRecentBookings(bookingsRes.data);
      setRevenueData(revenueRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: FiUsers, color: 'bg-blue-500' },
    { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: FiCalendar, color: 'bg-green-500' },
    { title: 'Active Buses', value: stats?.totalBuses || 0, icon: BiBus, color: 'bg-purple-500' },
    { title: 'Active Trips', value: stats?.activeTrips || 0, icon: FiMap, color: 'bg-orange-500' },
    { title: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: FiDollarSign, color: 'bg-yellow-500' },
    { title: 'Monthly Revenue', value: `₹${(stats?.monthlyRevenue || 0).toLocaleString()}`, icon: FiTrendingUp, color: 'bg-indigo-500' },
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
      title="Management Dashboard"
      subtitle="A single operational view for bookings, fleet, revenue, and content moderation."
      metrics={statCards}
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2 className="dashboard-panel-title">Revenue Trend (Last 30 Days)</h2>
            <p className="dashboard-panel-subtitle">Daily revenue movement across the last month.</p>
          </div>
          <div className="dashboard-panel-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tickFormatter={(value) => `Day ${value}`} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#FF5722" name="Revenue (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2 className="dashboard-panel-title">Recent Bookings</h2>
            <p className="dashboard-panel-subtitle">Latest customer activity and ticket sales.</p>
          </div>
          <div className="dashboard-panel-body">
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                  <div>
                    <p className="font-medium text-slate-900">{booking.tripId?.title}</p>
                    <p className="text-sm text-slate-500">{booking.userId?.name || booking.userId?.mobile}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-600">₹{booking.finalAmount}</p>
                    <p className="text-xs text-slate-500">{new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2 className="dashboard-panel-title">Quick Actions</h2>
          <p className="dashboard-panel-subtitle">Fast shortcuts for common management work.</p>
        </div>
        <div className="dashboard-panel-body">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <button className="rounded-2xl border border-orange-100 bg-orange-50/80 p-4 text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-100">
              <FiCalendar className="mx-auto mb-2 h-6 w-6" />
              <span className="text-sm font-medium">Add Trip</span>
            </button>
            <button className="rounded-2xl border border-orange-100 bg-orange-50/80 p-4 text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-100">
              <BiBus className="mx-auto mb-2 h-6 w-6" />
              <span className="text-sm font-medium">Add Bus</span>
            </button>
            <button className="rounded-2xl border border-orange-100 bg-orange-50/80 p-4 text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-100">
              <FiUsers className="mx-auto mb-2 h-6 w-6" />
              <span className="text-sm font-medium">Manage Users</span>
            </button>
            <button className="rounded-2xl border border-orange-100 bg-orange-50/80 p-4 text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-100">
              <FiEye className="mx-auto mb-2 h-6 w-6" />
              <span className="text-sm font-medium">Moderate Videos</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
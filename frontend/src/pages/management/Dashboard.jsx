import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import {
  FiUsers,
  FiCalendar,
  FiMap,
  FiDollarSign,
  FiTrendingUp,
  FiEye,
  FiDownload,
  FiPrinter,
} from 'react-icons/fi';
import { BiBus } from 'react-icons/bi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import * as XLSX from 'xlsx';
import { DashboardShell } from '../../components/common/DashboardLayout';
import toast from 'react-hot-toast';

const DETAIL_KEYS = {
  users: 'users',
  bookings: 'bookings',
  buses: 'buses',
  trips: 'trips',
  finance: 'finance',
};

export default function ManagementDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [buses, setBuses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [activeDetail, setActiveDetail] = useState(DETAIL_KEYS.users);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        statsRes,
        recentBookingsRes,
        revenueRes,
        usersRes,
        bookingsRes,
        busesRes,
        tripsRes,
        financeRes,
      ] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getRecentBookings(),
        adminAPI.getDailyRevenue({ days: 30 }),
        adminAPI.getUsers(),
        adminAPI.getBookings(),
        adminAPI.getBuses(),
        adminAPI.getTrips(),
        adminAPI.getFinancialSummary({}),
      ]);

      setStats(statsRes.data);
      setRecentBookings(recentBookingsRes.data || []);
      setRevenueData(revenueRes.data || []);
      setUsers(usersRes.data || []);
      setBookings(bookingsRes.data || []);
      setBuses(busesRes.data || []);
      setTrips(tripsRes.data || []);
      setFinanceSummary(financeRes.data || null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch management dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const detailConfig = useMemo(() => {
    switch (activeDetail) {
      case DETAIL_KEYS.users:
        return {
          title: 'User Details',
          filename: 'users_details',
          columns: ['Name', 'Mobile', 'Email', 'Role', 'Status', 'Created At', 'Last Login'],
          rows: users.map((u) => [
            u.name || '-',
            u.mobile || '-',
            u.email || '-',
            u.role || '-',
            u.isActive ? 'Active' : 'Inactive',
            u.createdAt ? new Date(u.createdAt).toLocaleString() : '-',
            u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-',
          ]),
        };
      case DETAIL_KEYS.bookings:
        return {
          title: 'Booking Details',
          filename: 'booking_details',
          columns: ['Booking ID', 'Customer', 'Mobile', 'Trip', 'Amount', 'Status', 'Created At'],
          rows: bookings.map((b) => [
            b._id,
            b.userId?.name || '-',
            b.userId?.mobile || '-',
            b.tripId?.title || '-',
            b.finalAmount ?? b.amount ?? 0,
            b.status || '-',
            b.createdAt ? new Date(b.createdAt).toLocaleString() : '-',
          ]),
        };
      case DETAIL_KEYS.buses:
        return {
          title: 'Bus Details',
          filename: 'bus_details',
          columns: ['Bus Number', 'Operator', 'Type', 'Seats', 'Status', 'Driver', 'Conductor'],
          rows: buses.map((b) => [
            b.busNumber || '-',
            b.operatorName || '-',
            b.type || '-',
            b.totalSeats ?? '-',
            b.status || '-',
            b.driverDetails?.name || '-',
            b.conductorDetails?.name || '-',
          ]),
        };
      case DETAIL_KEYS.trips:
        return {
          title: 'Trip Details',
          filename: 'trip_details',
          columns: ['Title', 'Location', 'Duration', 'Price', 'Status', 'Created At'],
          rows: trips.map((t) => [
            t.title || '-',
            t.location || '-',
            t.duration || '-',
            t.price ?? 0,
            t.status || '-',
            t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-',
          ]),
        };
      case DETAIL_KEYS.finance:
        return {
          title: 'Finance Transactions',
          filename: 'finance_transactions',
          columns: ['Date', 'Type', 'Category', 'Description', 'Amount'],
          rows: (financeSummary?.transactions || []).map((t) => [
            t.date ? new Date(t.date).toLocaleDateString() : '-',
            t.type || '-',
            t.category || '-',
            t.description || '-',
            t.amount ?? 0,
          ]),
        };
      default:
        return { title: 'Details', filename: 'details', columns: [], rows: [] };
    }
  }, [activeDetail, users, bookings, buses, trips, financeSummary]);

  const exportDetailsToExcel = () => {
    if (!detailConfig.rows.length) {
      toast.error('No data available to export');
      return;
    }

    const jsonRows = detailConfig.rows.map((row) => {
      const item = {};
      detailConfig.columns.forEach((col, idx) => {
        item[col] = row[idx];
      });
      return item;
    });

    const worksheet = XLSX.utils.json_to_sheet(jsonRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Details');
    XLSX.writeFile(workbook, `${detailConfig.filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Excel export completed');
  };

  const printDetails = () => {
    if (!detailConfig.rows.length) {
      toast.error('No data available to print');
      return;
    }

    const reportDate = new Date().toLocaleString();
    const tableRows = detailConfig.rows
      .map(
        (row) =>
          `<tr>${row
            .map((cell) => `<td style="border:1px solid #ddd;padding:8px;font-size:12px;">${String(cell)}</td>`)
            .join('')}</tr>`
      )
      .join('');

    const tableHeader = detailConfig.columns
      .map((col) => `<th style="border:1px solid #ddd;padding:8px;background:#f5f5f5;text-align:left;">${col}</th>`)
      .join('');

    const html = `
      <html>
        <head>
          <title>${detailConfig.title}</title>
        </head>
        <body style="font-family:Arial,sans-serif;padding:24px;color:#111;">
          <header style="border-bottom:2px solid #f97316;padding-bottom:12px;margin-bottom:16px;">
            <h1 style="margin:0;font-size:20px;">Weekend Mojo Travel Pvt. Ltd.</h1>
            <p style="margin:4px 0 0;color:#555;">${detailConfig.title}</p>
            <p style="margin:4px 0 0;color:#555;">Generated: ${reportDate}</p>
          </header>
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr>${tableHeader}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
          <footer style="border-top:2px solid #f97316;padding-top:12px;margin-top:16px;font-size:12px;color:#555;">
            <p style="margin:0;">Weekend Mojo Travel Pvt. Ltd. | support@weekendmojo.com | +91 90000 00000</p>
            <p style="margin:4px 0 0;">This is a system-generated report for internal management use.</p>
          </footer>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) {
      toast.error('Unable to open print window. Please allow popups.');
      return;
    }

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: 'bg-blue-500',
      onClick: () => setActiveDetail(DETAIL_KEYS.users),
      isActive: activeDetail === DETAIL_KEYS.users,
      note: 'Click to view full user records',
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: FiCalendar,
      color: 'bg-green-500',
      onClick: () => setActiveDetail(DETAIL_KEYS.bookings),
      isActive: activeDetail === DETAIL_KEYS.bookings,
      note: 'Click to view booking records',
    },
    {
      title: 'Active Buses',
      value: stats?.totalBuses || 0,
      icon: BiBus,
      color: 'bg-purple-500',
      onClick: () => setActiveDetail(DETAIL_KEYS.buses),
      isActive: activeDetail === DETAIL_KEYS.buses,
      note: 'Click to view fleet details',
    },
    {
      title: 'Active Trips',
      value: stats?.activeTrips || 0,
      icon: FiMap,
      color: 'bg-orange-500',
      onClick: () => setActiveDetail(DETAIL_KEYS.trips),
      isActive: activeDetail === DETAIL_KEYS.trips,
      note: 'Click to view trip details',
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: FiDollarSign,
      color: 'bg-yellow-500',
      onClick: () => setActiveDetail(DETAIL_KEYS.finance),
      isActive: activeDetail === DETAIL_KEYS.finance,
      note: 'Click to view finance details',
    },
    {
      title: 'Monthly Revenue',
      value: `₹${(stats?.monthlyRevenue || 0).toLocaleString()}`,
      icon: FiTrendingUp,
      color: 'bg-indigo-500',
      onClick: () => setActiveDetail(DETAIL_KEYS.finance),
      isActive: activeDetail === DETAIL_KEYS.finance,
      note: 'Click to view finance details',
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
                    <p className="font-semibold text-orange-600">₹{booking.finalAmount ?? booking.amount ?? 0}</p>
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
            <button
              className="rounded-2xl border border-orange-100 bg-orange-50/80 p-4 text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-100"
              onClick={() => navigate('/admin/trips?create=1')}
            >
              <FiCalendar className="mx-auto mb-2 h-6 w-6" />
              <span className="text-sm font-medium">Add Trip</span>
            </button>
            <button
              className="rounded-2xl border border-orange-100 bg-orange-50/80 p-4 text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-100"
              onClick={() => navigate('/admin/buses?create=1')}
            >
              <BiBus className="mx-auto mb-2 h-6 w-6" />
              <span className="text-sm font-medium">Add Bus</span>
            </button>
            <button
              className="rounded-2xl border border-orange-100 bg-orange-50/80 p-4 text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-100"
              onClick={() => setActiveDetail(DETAIL_KEYS.users)}
            >
              <FiUsers className="mx-auto mb-2 h-6 w-6" />
              <span className="text-sm font-medium">Manage Users</span>
            </button>
            <button
              className="rounded-2xl border border-orange-100 bg-orange-50/80 p-4 text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-100"
              onClick={() => navigate('/admin/videos')}
            >
              <FiEye className="mx-auto mb-2 h-6 w-6" />
              <span className="text-sm font-medium">Moderate Videos</span>
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-panel overflow-hidden">
        <div className="dashboard-panel-header flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="dashboard-panel-title">{detailConfig.title}</h2>
            <p className="dashboard-panel-subtitle">Complete detailed records for the selected metric.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={exportDetailsToExcel} className="btn-secondary flex items-center">
              <FiDownload className="mr-2" />
              Export Excel
            </button>
            <button type="button" onClick={printDetails} className="btn-primary flex items-center">
              <FiPrinter className="mr-2" />
              Print Details
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {detailConfig.columns.map((column) => (
                  <th key={column} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {detailConfig.rows.length > 0 ? (
                detailConfig.rows.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`cell-${rowIndex}-${cellIndex}`} className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={Math.max(detailConfig.columns.length, 1)} className="px-4 py-8 text-center text-sm text-slate-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}

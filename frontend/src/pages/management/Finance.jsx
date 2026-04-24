import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiDownload } from 'react-icons/fi';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardShell } from '../../components/common/DashboardLayout';

export default function Finance() {
  const [summary, setSummary] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const COLORS = ['#FF5722', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'];
  
  useEffect(() => {
    fetchFinancialData();
  }, [dateRange]);
  
  const fetchFinancialData = async () => {
    try {
      const params = {};
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;
      
      const [summaryRes, revenueRes] = await Promise.all([
        adminAPI.getFinancialSummary(params),
        adminAPI.getDailyRevenue({ days: 30 })
      ]);
      setSummary(summaryRes.data);
      setDailyRevenue(revenueRes.data);
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const financeMetrics = [
    {
      title: 'Total Income',
      value: `₹${summary?.summary?.totalIncome?.toLocaleString() || 0}`,
      icon: FiTrendingUp,
      color: 'bg-green-500',
      note: 'Cash collected across all channels',
    },
    {
      title: 'Total Expenses',
      value: `₹${summary?.summary?.totalExpenses?.toLocaleString() || 0}`,
      icon: FiTrendingDown,
      color: 'bg-red-500',
      note: 'Operational spend and overhead',
    },
    {
      title: 'Profit',
      value: `₹${summary?.summary?.profit?.toLocaleString() || 0}`,
      icon: FiDollarSign,
      color: 'bg-orange-500',
      note: `Margin ${summary?.summary?.profitMargin?.toFixed(1) || 0}%`,
    },
  ];
  
  return (
    <DashboardShell
      eyebrow="Management Portal"
      title="Financial Management"
      subtitle="Track income, expense, profit, and publishing performance from one dashboard."
      actions={
        <button className="btn-secondary flex items-center">
          <FiDownload className="mr-2" />
          Export Report
        </button>
      }
      metrics={financeMetrics}
    >
      {/* Date Range Filter */}
      <div className="dashboard-panel p-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="input-field"
              />
            </div>
            <button
              onClick={fetchFinancialData}
              className="btn-primary mt-6"
            >
              Apply Filter
            </button>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2 className="dashboard-panel-title">Revenue Trend</h2>
            <p className="dashboard-panel-subtitle">Daily revenue for the last 30 days.</p>
          </div>
          <div className="dashboard-panel-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
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
            <h2 className="dashboard-panel-title">Income by Category</h2>
            <p className="dashboard-panel-subtitle">Category mix for current financial activity.</p>
          </div>
          <div className="dashboard-panel-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summary?.incomeByCategory || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry._id}: ₹${entry.total}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {(summary?.incomeByCategory || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-panel overflow-hidden">
        <div className="dashboard-panel-header">
          <h2 className="dashboard-panel-title">Recent Transactions</h2>
          <p className="dashboard-panel-subtitle">Latest income and expense records.</p>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary?.transactions?.map((transaction, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{transaction.category}</td>
                    <td className="px-6 py-4 text-sm">{transaction.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      ₹{transaction.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </DashboardShell>
  );
}
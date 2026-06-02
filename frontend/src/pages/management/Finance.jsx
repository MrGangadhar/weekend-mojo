import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiDownload, FiPrinter } from 'react-icons/fi';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardShell } from '../../components/common/DashboardLayout';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export default function Finance() {
  const [summary, setSummary] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const COLORS = ['#FF5722', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'];

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange.start, dateRange.end]);

  const fetchFinancialData = async () => {
    try {
      const params = {};
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      const today = new Date();
      const reportParams = {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
      };

      const [summaryRes, revenueRes, reportRes] = await Promise.all([
        adminAPI.getFinancialSummary(params),
        adminAPI.getDailyRevenue({ days: 30 }),
        adminAPI.getFinancialReport(reportParams),
      ]);

      setSummary(summaryRes.data);
      setDailyRevenue(revenueRes.data || []);
      setTransactions(reportRes.data?.transactions || []);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch financial data');
    } finally {
      setLoading(false);
    }
  };

  const exportFinanceReport = () => {
    if (!transactions.length) {
      toast.error('No financial transactions available to export');
      return;
    }

    const rows = transactions.map((transaction) => ({
      Date: transaction.date ? new Date(transaction.date).toLocaleDateString() : '-',
      Type: transaction.type || '-',
      Category: transaction.category || '-',
      Description: transaction.description || '-',
      Amount: transaction.amount ?? 0,
      'Payment Method': transaction.paymentMethod || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Finance Report');
    XLSX.writeFile(workbook, `finance_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Finance report exported to Excel');
  };

  const printFinanceReport = () => {
    if (!transactions.length) {
      toast.error('No financial transactions available to print');
      return;
    }

    const rowsHtml = transactions
      .map(
        (transaction) => `
          <tr>
            <td style="border:1px solid #ddd;padding:8px;">${new Date(transaction.date).toLocaleDateString()}</td>
            <td style="border:1px solid #ddd;padding:8px;">${transaction.type || '-'}</td>
            <td style="border:1px solid #ddd;padding:8px;">${transaction.category || '-'}</td>
            <td style="border:1px solid #ddd;padding:8px;">${transaction.description || '-'}</td>
            <td style="border:1px solid #ddd;padding:8px;text-align:right;">₹${(transaction.amount || 0).toLocaleString()}</td>
          </tr>
        `
      )
      .join('');

    const html = `
      <html>
        <head>
          <title>Weekend Mojo Finance Report</title>
        </head>
        <body style="font-family:Arial,sans-serif;padding:24px;color:#111;">
          <header style="border-bottom:2px solid #f97316;padding-bottom:12px;margin-bottom:16px;">
            <h1 style="margin:0;font-size:20px;">Weekend Mojo Travel Pvt. Ltd.</h1>
            <p style="margin:4px 0 0;color:#555;">Financial Report</p>
            <p style="margin:4px 0 0;color:#555;">Generated: ${new Date().toLocaleString()}</p>
          </header>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="border:1px solid #ddd;padding:8px;background:#f5f5f5;">Date</th>
                <th style="border:1px solid #ddd;padding:8px;background:#f5f5f5;">Type</th>
                <th style="border:1px solid #ddd;padding:8px;background:#f5f5f5;">Category</th>
                <th style="border:1px solid #ddd;padding:8px;background:#f5f5f5;">Description</th>
                <th style="border:1px solid #ddd;padding:8px;background:#f5f5f5;">Amount</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <footer style="border-top:2px solid #f97316;padding-top:12px;margin-top:16px;font-size:12px;color:#555;">
            <p style="margin:0;">Weekend Mojo Travel Pvt. Ltd. | support@weekendmojo.com | +91 90000 00000</p>
            <p style="margin:4px 0 0;">This is a system-generated financial report for internal use.</p>
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
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-secondary flex items-center" onClick={exportFinanceReport}>
            <FiDownload className="mr-2" />
            Export Report
          </button>
          <button className="btn-primary flex items-center" onClick={printFinanceReport}>
            <FiPrinter className="mr-2" />
            Print Report
          </button>
        </div>
      }
      metrics={financeMetrics}
    >
      <div className="dashboard-panel p-4">
        <div className="flex flex-wrap items-end gap-4">
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
          <button onClick={fetchFinancialData} className="btn-primary">
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
                <XAxis
                  dataKey="_id"
                  tickFormatter={(value) => {
                    if (!value || typeof value !== 'object') return String(value || '');
                    return `${value.day}/${value.month}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => {
                    if (!value || typeof value !== 'object') return value;
                    return `${value.day}/${value.month}/${value.year}`;
                  }}
                />
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
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}
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
                    ₹{(transaction.amount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    No transactions found.
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

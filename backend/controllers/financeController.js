const Finance = require('../models/Finance');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

exports.getFinancialSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }
    
    const [income, expenses] = await Promise.all([
      Finance.aggregate([
        { $match: { type: 'income', ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Finance.aggregate([
        { $match: { type: 'expense', ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    
    const totalIncome = income[0]?.total || 0;
    const totalExpenses = expenses[0]?.total || 0;
    const profit = totalIncome - totalExpenses;
    
    // Get category-wise breakdown
    const incomeByCategory = await Finance.aggregate([
      { $match: { type: 'income', ...dateFilter } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);
    
    const expensesByCategory = await Finance.aggregate([
      { $match: { type: 'expense', ...dateFilter } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);
    
    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        profit,
        profitMargin: totalIncome > 0 ? (profit / totalIncome) * 100 : 0
      },
      incomeByCategory,
      expensesByCategory
    });
  } catch (error) {
    console.error('Get financial summary error:', error);
    res.status(500).json({ error: 'Failed to fetch financial summary' });
  }
};

exports.getDailyRevenue = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const revenue = await Finance.aggregate([
      {
        $match: {
          type: 'income',
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    res.json(revenue);
  } catch (error) {
    console.error('Get daily revenue error:', error);
    res.status(500).json({ error: 'Failed to fetch daily revenue' });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, vendorId, paymentMethod } = req.body;
    
    const transaction = new Finance({
      type,
      amount,
      category,
      description,
      vendorId,
      paymentMethod,
      recordedBy: req.user._id,
      date: new Date()
    });
    
    await transaction.save();
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
};

exports.getVendorPayments = async (req, res) => {
  try {
    const payments = await Finance.aggregate([
      {
        $match: {
          type: 'expense',
          category: { $in: ['operator_payment', 'hotel_payment', 'vendor_payment'] }
        }
      },
      {
        $group: {
          _id: '$vendorId',
          totalPaid: { $sum: '$amount' },
          transactions: { $push: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor'
        }
      }
    ]);
    
    res.json(payments);
  } catch (error) {
    console.error('Get vendor payments error:', error);
    res.status(500).json({ error: 'Failed to fetch vendor payments' });
  }
};

exports.generateFinancialReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const transactions = await Finance.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      bookingIncome: 0,
      operatorExpenses: 0,
      hotelExpenses: 0,
      otherExpenses: 0
    };
    
    transactions.forEach(t => {
      if (t.type === 'income') {
        summary.totalIncome += t.amount;
        if (t.category === 'booking') summary.bookingIncome += t.amount;
      } else {
        summary.totalExpenses += t.amount;
        if (t.category === 'operator_payment') summary.operatorExpenses += t.amount;
        else if (t.category === 'hotel_payment') summary.hotelExpenses += t.amount;
        else summary.otherExpenses += t.amount;
      }
    });
    
    summary.profit = summary.totalIncome - summary.totalExpenses;
    summary.profitMargin = summary.totalIncome > 0 
      ? (summary.profit / summary.totalIncome) * 100 
      : 0;
    
    res.json({
      period: { year, month },
      summary,
      transactions
    });
  } catch (error) {
    console.error('Generate financial report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};
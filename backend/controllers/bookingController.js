const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Payment = require('../models/Payment');
const Bus = require('../models/Bus');
const Trip = require('../models/Trip');
const User = require('../models/User');
const razorpay = require('../config/razorpay');
const { generateTicketPDF } = require('../utils/pdfGenerator');
const { sendNotification } = require('../utils/notifications');
const crypto = require('crypto');

const buildSeatLabel = (seatNumber, seatType) => {
  const numeric = parseInt(seatNumber, 10);

  if (seatType === 'Sleeper') {
    return numeric % 2 === 0 ? `LB ${numeric}` : `UB ${numeric}`;
  }

  return `S ${numeric}`;
};

const getSeatType = (bus) => (bus?.type === 'Sleeper' ? 'Sleeper' : 'Seater');

exports.getSeatMap = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { busId } = req.query;

    if (!busId) {
      return res.status(400).json({ error: 'busId is required' });
    }

    const trip = await Trip.findById(tripId);
    const bus = await Bus.findById(busId);

    if (!trip || !bus) {
      return res.status(404).json({ error: 'Trip or bus not found' });
    }

    const tripAssignment = bus.assignedTrips?.find((assignment) => assignment.tripId?.toString() === trip._id.toString());
    const seatType = getSeatType(bus);
    const totalSeats = bus.totalSeats || 40;
    const basePrice = tripAssignment?.price || trip.price;

    const seatNumbers = Array.from({ length: totalSeats }, (_, index) => String(index + 1));

    await Seat.updateMany(
      {
        busId: bus._id,
        tripId: trip._id,
        status: 'blocked',
        blockedUntil: { $lt: new Date() }
      },
      {
        $set: {
          status: 'available',
          bookingId: null,
          blockedUntil: null
        }
      }
    );

    const existingSeats = await Seat.find({
      busId: bus._id,
      tripId: trip._id,
      seatNumber: { $in: seatNumbers }
    }).lean();

    const existingSeatMap = new Map(existingSeats.map((seat) => [seat.seatNumber, seat]));
    const missingSeats = seatNumbers.filter((seatNumber) => !existingSeatMap.has(seatNumber));

    if (missingSeats.length > 0) {
      await Seat.insertMany(
        missingSeats.map((seatNumber) => ({
          busId: bus._id,
          tripId: trip._id,
          seatNumber,
          status: 'available',
          price: basePrice
        })),
        { ordered: false }
      ).catch(() => {});
    }

    const refreshedSeats = await Seat.find({
      busId: bus._id,
      tripId: trip._id,
      seatNumber: { $in: seatNumbers }
    }).sort({ seatNumber: 1 }).lean();

    const seatMap = refreshedSeats.map((seat, index) => ({
      ...seat,
      seatType,
      label: buildSeatLabel(seat.seatNumber, seatType),
      row: seatType === 'Sleeper' ? Math.ceil((index + 1) / 2) : Math.ceil((index + 1) / 4),
      column: seatType === 'Sleeper' ? (index % 2) + 1 : (index % 4) + 1
    }));

    res.json({
      tripId: trip._id,
      busId: bus._id,
      seatType,
      totalSeats,
      price: basePrice,
      boardingPoints: tripAssignment?.boardingPoints || [],
      seats: seatMap
    });
  } catch (error) {
    console.error('Get seat map error:', error);
    res.status(500).json({ error: 'Failed to fetch seat map' });
  }
};

exports.initiateBooking = async (req, res) => {
  try {
    const { 
      tripId, 
      busId, 
      selectedSeats, 
      passengers, 
      boardingPoint,
      droppingPoint,
      couponCode 
    } = req.body;
    
    // Validate trip and bus
    const trip = await Trip.findById(tripId);
    const bus = await Bus.findById(busId);
    
    if (!trip || !bus) {
      return res.status(404).json({ error: 'Trip or bus not found' });
    }
    
    // Calculate price with dynamic pricing
    let basePrice = trip.price;
    const isWeekend = [0, 6].includes(new Date().getDay());
    if (isWeekend) basePrice *= trip.dynamicPricing.weekendMultiplier;
    
    const totalAmount = basePrice * selectedSeats.length;
    
    // Check seat availability
    const seatPromises = selectedSeats.map(seatNumber =>
      Seat.findOne({ busId, tripId, seatNumber })
    );
    
    const existingSeats = await Promise.all(seatPromises);
    const unavailableSeats = existingSeats.filter(seat => 
      seat && seat.status !== 'available'
    );
    
    if (unavailableSeats.length > 0) {
      return res.status(400).json({ 
        error: 'Some seats are no longer available',
        unavailableSeats: unavailableSeats.map(s => s.seatNumber)
      });
    }
    
    // Create booking
    const booking = new Booking({
      userId: req.user._id,
      tripId,
      busId,
      selectedSeats,
      passengers,
      boardingPoint,
      droppingPoint,
      totalAmount,
      discount: 0,
      finalAmount: totalAmount,
      status: 'pending'
    });
    
    // Ensure bookingId is present before validation (pre-save generator may run after validation in some cases)
    if (!booking.bookingId) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      booking.bookingId = `WM${year}${month}${random}`;
    }

    await booking.save();
    
    // Block seats temporarily
    const blockPromises = selectedSeats.map(seatNumber => {
      return Seat.findOneAndUpdate(
        { busId, tripId, seatNumber },
        {
          status: 'blocked',
          bookingId: booking._id,
          blockedUntil: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        },
        { upsert: true, new: true }
      );
    });
    
    await Promise.all(blockPromises);
    
    // Create Razorpay order
    const orderOptions = {
      amount: totalAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: booking.bookingId,
      notes: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString()
      }
    };
    
    let order;
    // In development, allow a fallback when Razorpay keys are not configured
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('your_razorpay')) {
      order = { id: `dev_order_${Date.now()}` };
    } else {
      order = await razorpay.orders.create(orderOptions);
    }
    
    // Save payment record
    const payment = new Payment({
      razorpayOrderId: order.id,
      amount: totalAmount,
      bookingId: booking._id,
      userId: req.user._id,
      status: 'created'
    });
    
    await payment.save();
    
    res.json({
      bookingId: booking._id,
      bookingNumber: booking.bookingId,
      orderId: order.id,
      amount: totalAmount,
      razorpayKey: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Initiate booking error:', error);
    res.status(500).json({ error: 'Failed to initiate booking' });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingId 
    } = req.body;
    
    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }
    
    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'captured'
      },
      { new: true }
    );
    
    // Update booking
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: 'confirmed',
        paymentId: payment._id,
        paymentStatus: 'success'
      },
      { new: true }
    ).populate('tripId busId userId');
    
    // Update seats to booked
    await Seat.updateMany(
      {
        busId: booking.busId._id,
        tripId: booking.tripId._id,
        seatNumber: { $in: booking.selectedSeats }
      },
      {
        status: 'booked',
        blockedUntil: null
      }
    );
    
    // Generate PDF ticket
    const ticketUrl = await generateTicketPDF(booking);
    booking.ticketUrl = ticketUrl;
    await booking.save();
    
    // Send notifications
    await sendNotification(booking.userId.fcmToken, {
      title: 'Booking Confirmed!',
      body: `Your booking ${booking.bookingId} has been confirmed.`,
      data: { bookingId: booking._id.toString() }
    });
    
    res.json({
      success: true,
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        ticketUrl: booking.ticketUrl
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('tripId', 'title location duration thumbnail')
      .populate('busId', 'busNumber type operatorName')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

exports.getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tripId')
      .populate('busId')
      .populate('userId', 'name mobile email');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check authorization
    if (booking.userId._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'management' &&
        req.user.role !== 'conductor') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Only confirmed bookings can be cancelled' });
    }
    
    // Calculate cancellation charges (simplified)
    const hoursUntilDeparture = 24; // Calculate based on actual schedule
    let refundAmount = booking.finalAmount;
    
    if (hoursUntilDeparture < 24) {
      refundAmount = booking.finalAmount * 0.5;
    } else if (hoursUntilDeparture < 48) {
      refundAmount = booking.finalAmount * 0.75;
    }
    
    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    booking.cancelledAt = new Date();
    booking.refundAmount = refundAmount;
    await booking.save();
    
    // Free up seats
    await Seat.updateMany(
      {
        busId: booking.busId,
        tripId: booking.tripId,
        seatNumber: { $in: booking.selectedSeats }
      },
      { status: 'available', bookingId: null }
    );
    
    // Process refund via Razorpay (implement based on your needs)
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      refundAmount
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};
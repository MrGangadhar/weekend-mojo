const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const generateTicketPDF = async (booking) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        const pdfData = Buffer.concat(buffers);
        
        // Upload to Cloudinary
        const uploadResult = await new Promise((resolveUpload, rejectUpload) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              folder: 'weekend-mojo/tickets',
              public_id: `ticket_${booking.bookingId}`
            },
            (error, result) => {
              if (error) rejectUpload(error);
              else resolveUpload(result);
            }
          );
          uploadStream.end(pdfData);
        });
        
        resolve(uploadResult.secure_url);
      });
      
      // Header
      doc.fontSize(20)
        .font('Helvetica-Bold')
        .text('WEEKEND MOJO', { align: 'center' })
        .moveDown();
      
      doc.fontSize(16)
        .text('Travel Ticket', { align: 'center' })
        .moveDown();
      
      // Divider
      doc.strokeColor('#000000')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown();
      
      // Booking Details
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text(`Booking ID: ${booking.bookingId}`)
        .font('Helvetica')
        .text(`Date: ${new Date(booking.createdAt).toLocaleString()}`)
        .moveDown();
      
      // Passenger Details
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('Passenger Details')
        .moveDown(0.5);
      
      doc.fontSize(10)
        .font('Helvetica');
      
      booking.passengers.forEach((passenger, index) => {
        doc.text(`${index + 1}. ${passenger.name} - Seat: ${passenger.seatNumber}`);
      });
      
      doc.moveDown();
      
      // Trip Details
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('Trip Details')
        .moveDown(0.5);
      
      doc.fontSize(10)
        .font('Helvetica')
        .text(`Trip: ${booking.tripId.title}`)
        .text(`Duration: ${booking.tripId.duration}`)
        .text(`Location: ${booking.tripId.location}`)
        .moveDown();
      
      // Bus Details
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('Bus Details')
        .moveDown(0.5);
      
      doc.fontSize(10)
        .font('Helvetica')
        .text(`Bus Number: ${booking.busId.busNumber}`)
        .text(`Bus Type: ${booking.busId.type}`)
        .text(`Operator: ${booking.busId.operatorName}`)
        .moveDown();
      
      // Boarding Point
      if (booking.boardingPoint) {
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .text('Boarding Point')
          .moveDown(0.5);
        
        doc.fontSize(10)
          .font('Helvetica')
          .text(`Location: ${booking.boardingPoint.name}`)
          .text(`Address: ${booking.boardingPoint.address}`)
          .text(`Time: ${booking.boardingPoint.time}`);
        
        doc.moveDown();
      }
      
      // Price Summary
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('Payment Summary')
        .moveDown(0.5);
      
      doc.fontSize(10)
        .font('Helvetica')
        .text(`Total Amount: ₹${booking.totalAmount}`)
        .text(`Discount: ₹${booking.discount || 0}`)
        .text(`Final Amount: ₹${booking.finalAmount}`)
        .moveDown();
      
      // Divider
      doc.strokeColor('#000000')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown();
      
      // QR Code
      const qrCodeData = JSON.stringify({
        bookingId: booking.bookingId,
        tripId: booking.tripId._id,
        busNumber: booking.busId.busNumber,
        seats: booking.selectedSeats
      });
      
      const qrBuffer = await QRCode.toBuffer(qrCodeData);
      doc.image(qrBuffer, {
        fit: [150, 150],
        align: 'center'
      });
      
      doc.moveDown();
      doc.fontSize(8)
        .text('Please present this ticket at the time of boarding', { align: 'center' })
        .text('For any queries, contact: support@weekendmojo.com', { align: 'center' });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateTicketPDF };
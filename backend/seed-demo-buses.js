// Seed script to create demo buses assigned to demo trips
const mongoose = require('mongoose');
require('dotenv').config();
const Bus = require('./models/Bus');
const Trip = require('./models/Trip');

const busSeeds = [
  {
    busNumber: 'GA-01-MOJO-101',
    operatorName: 'Weekend Mojo Express',
    type: 'Luxury',
    totalSeats: 36,
    amenities: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Entertainment'],
    driverDetails: { name: 'Ravi Patil', phone: '9000010001', licenseNumber: 'DL-2026-GA-101' },
    conductorDetails: { name: 'Amit Naik', phone: '9000010002', employeeId: 'CON-101' },
    assignedTrips: [
      {
        tripTitle: 'Coastal Escape: Goa Weekend',
        scheduleOffsetDays: 7,
        price: 10999,
        boardingPoints: [
          { name: 'Panaji Pickup Point', address: 'Panaji, Goa', time: '07:00 AM', landmark: 'City Bus Stand' },
          { name: 'Mapusa Junction', address: 'Mapusa, Goa', time: '08:00 AM', landmark: 'Market Circle' }
        ],
        droppingPoints: [
          { name: 'Panaji Pickup Point', address: 'Panaji, Goa', time: '07:00 AM', landmark: 'City Bus Stand' }
        ]
      }
    ],
    status: 'active'
  },
  {
    busNumber: 'KA-02-MOJO-202',
    operatorName: 'Mojo Hills Travel',
    type: 'Sleeper',
    totalSeats: 32,
    amenities: ['WiFi', 'Charging Point', 'Blanket', 'Water Bottle'],
    driverDetails: { name: 'Suresh Kumar', phone: '9000020001', licenseNumber: 'DL-2026-KA-202' },
    conductorDetails: { name: 'Neha Rao', phone: '9000020002', employeeId: 'CON-202' },
    assignedTrips: [
      {
        tripTitle: 'Hill Retreat: Munnar Getaway',
        scheduleOffsetDays: 10,
        price: 7999,
        boardingPoints: [
          { name: 'Bengaluru Majestic', address: 'Kempegowda Bus Station', time: '09:00 PM', landmark: 'Platform 12' },
          { name: 'Mysuru Road', address: 'Mysuru Road, Bengaluru', time: '09:45 PM', landmark: 'Metro Exit 2' }
        ],
        droppingPoints: [
          { name: 'Bengaluru Majestic', address: 'Kempegowda Bus Station', time: '09:00 PM', landmark: 'Platform 12' }
        ]
      }
    ],
    status: 'active'
  },
  {
    busNumber: 'RJ-03-MOJO-303',
    operatorName: 'Desert Route Coaches',
    type: 'AC',
    totalSeats: 40,
    amenities: ['WiFi', 'Charging Point', 'Water Bottle', 'Entertainment'],
    driverDetails: { name: 'Mahesh Singh', phone: '9000030001', licenseNumber: 'DL-2026-RJ-303' },
    conductorDetails: { name: 'Priya Sharma', phone: '9000030002', employeeId: 'CON-303' },
    assignedTrips: [
      {
        tripTitle: 'Desert Adventure: Jaisalmer Camp',
        scheduleOffsetDays: 21,
        price: 5999,
        boardingPoints: [
          { name: 'Jodhpur Clock Tower', address: 'Clock Tower, Jodhpur', time: '04:30 PM', landmark: 'Main Square' },
          { name: 'Pali Junction', address: 'Pali, Rajasthan', time: '06:00 PM', landmark: 'Railway Crossing' }
        ],
        droppingPoints: [
          { name: 'Jodhpur Clock Tower', address: 'Clock Tower, Jodhpur', time: '04:30 PM', landmark: 'Main Square' }
        ]
      }
    ],
    status: 'active'
  }
];

const resolveTripAssignment = async (assignment) => {
  const trip = await Trip.findOne({ title: assignment.tripTitle });

  if (!trip) {
    throw new Error(`Trip not found for bus assignment: ${assignment.tripTitle}`);
  }

  const schedule = new Date(Date.now() + assignment.scheduleOffsetDays * 24 * 60 * 60 * 1000);

  return {
    tripId: trip._id,
    schedule,
    price: assignment.price,
    boardingPoints: assignment.boardingPoints,
    droppingPoints: assignment.droppingPoints
  };
};

async function seedBuses() {
  const mongoCandidates = [process.env.MONGO_URI, process.env.MONGODB_URI].filter(Boolean);

  if (mongoCandidates.length === 0) {
    throw new Error('MONGO_URI or MONGODB_URI is required to seed demo buses');
  }

  let connected = false;
  let lastError = null;

  for (const candidate of mongoCandidates) {
    try {
      await mongoose.connect(candidate, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      connected = true;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!connected) {
    throw lastError || new Error('Failed to connect to MongoDB');
  }

  for (const seed of busSeeds) {
    const assignedTrips = [];

    for (const assignment of seed.assignedTrips) {
      assignedTrips.push(await resolveTripAssignment(assignment));
    }

    await Bus.findOneAndUpdate(
      { busNumber: seed.busNumber },
      { $set: { ...seed, assignedTrips } },
      { upsert: true, new: true, runValidators: true }
    );

    console.log(`Seeded bus: ${seed.busNumber} (${seed.operatorName})`);
  }

  await mongoose.disconnect();
  console.log('All demo buses seeded.');
}

seedBuses().catch((error) => {
  console.error('Seeding buses failed:', error);
  process.exit(1);
});

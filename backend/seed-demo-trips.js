// Seed script to create demo trips with banner images
const mongoose = require('mongoose');
require('dotenv').config();
const Trip = require('./models/Trip');

const trips = [
  {
    title: 'Coastal Escape: Goa Weekend',
    description: 'Relax on golden beaches, enjoy water sports and nightlife in Goa.',
    shortDescription: '3 days beachside relaxation and adventure in Goa.',
    duration: '3 days',
    location: 'Goa',
    price: 9999,
    images: [
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop', caption: 'Sunset at the beach' },
      { url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&auto=format&fit=crop', caption: 'Coastal cliffs' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
    itinerary: [
      { day: 1, title: 'Arrival & Beach Time', places: ['Baga Beach'], activities: ['Sunset walk'], stay: { name: 'Beach Resort' } },
      { day: 2, title: 'Water Sports', places: ['Calangute'], activities: ['Jet-ski', 'Parasailing'], stay: { name: 'Beach Resort' } },
      { day: 3, title: 'Local Markets & Departure', places: ['Anjuna Flea Market'], activities: ['Shopping'] }
    ],
    inclusions: ['Stay', 'Breakfast', 'Transfers'],
    exclusions: ['Flights', 'Personal Expenses'],
    availableDates: [new Date(Date.now() + 7 * 24 * 3600 * 1000), new Date(Date.now() + 14 * 24 * 3600 * 1000)],
    status: 'active',
    maxCapacity: 40,
    tags: ['beach', 'weekend', 'adventure']
  },
  {
    title: 'Hill Retreat: Munnar Getaway',
    description: 'Tea gardens, cool weather and winding roads in Munnar.',
    shortDescription: '2 nights in the misty hills of Munnar.',
    duration: '2 days',
    location: 'Munnar',
    price: 7499,
    images: [
      { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&auto=format&fit=crop', caption: 'Misty tea gardens' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop',
    itinerary: [ { day: 1, title: 'Arrival & Sightseeing', places: ['Tea Museum'], activities: ['Valley view'] } ],
    inclusions: ['Stay', 'Breakfast'],
    exclusions: ['Lunch', 'Dinner'],
    availableDates: [new Date(Date.now() + 10 * 24 * 3600 * 1000)],
    status: 'active',
    maxCapacity: 30,
    tags: ['hills', 'nature', 'relax']
  },
  {
    title: 'Desert Adventure: Jaisalmer Camp',
    description: 'Camel safaris, desert camping and stargazing.',
    shortDescription: 'Overnight desert camp with cultural activities.',
    duration: '2 days',
    location: 'Jaisalmer',
    price: 5499,
    images: [
      { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop', caption: 'Desert dunes' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop',
    itinerary: [ { day: 1, title: 'Drive & Dune Safari', places: ['Sam Sand Dunes'], activities: ['Camel ride', 'Cultural show'] } ],
    inclusions: ['Camp stay', 'Dinner'],
    exclusions: ['Transport to Jaisalmer'],
    availableDates: [new Date(Date.now() + 21 * 24 * 3600 * 1000)],
    status: 'active',
    maxCapacity: 25,
    tags: ['desert', 'camp', 'culture']
  }
];

async function seedTrips() {
  const mongoCandidates = [process.env.MONGO_URI, process.env.MONGODB_URI].filter(Boolean);

  if (mongoCandidates.length === 0) {
    throw new Error('MONGO_URI or MONGODB_URI is required to seed demo trips');
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

  for (const t of trips) {
    await Trip.findOneAndUpdate(
      { title: t.title },
      { $set: t },
      { upsert: true, new: true }
    );
    console.log(`Seeded trip: ${t.title}`);
  }

  await mongoose.disconnect();
  console.log('All demo trips seeded.');
}

seedTrips().catch((err) => {
  console.error('Seeding trips failed:', err);
  process.exit(1);
});

// Temporary script to create demo users for all roles
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const users = [
  {
    username: 'management01',
    mobile: '9000000001',
    name: 'Demo Management',
    email: 'management@demo.com',
    role: 'management',
    password: 'demo1234',
    isActive: true
  },
  {
    username: 'conductor01',
    mobile: '9000000002',
    name: 'Demo Conductor',
    email: 'conductor@demo.com',
    role: 'conductor',
    password: 'demo1234',
    isActive: true
  },
  {
    username: 'editor01',
    mobile: '9000000003',
    name: 'Demo Editor',
    email: 'editor@demo.com',
    role: 'editor',
    password: 'demo1234',
    isActive: true
  },
  {
    username: 'user01',
    mobile: '9000000004',
    name: 'Demo User',
    email: 'user@demo.com',
    role: 'user',
    password: 'demo1234',
    isActive: true
  }
];

async function seedUsers() {
  const mongoCandidates = [process.env.MONGO_URI, process.env.MONGODB_URI].filter(Boolean);

  if (mongoCandidates.length === 0) {
    throw new Error('MONGO_URI or MONGODB_URI is required to seed demo users');
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

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await User.findOneAndUpdate(
      { mobile: u.mobile },
      { ...u, password: hash },
      { upsert: true, new: true }
    );
    console.log(`Seeded user: ${u.role} (${u.mobile} / ${u.email})`);
  }
  await mongoose.disconnect();
  console.log('All demo users seeded.');
}

seedUsers().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});

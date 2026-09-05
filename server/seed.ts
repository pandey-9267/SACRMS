import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDatabase } from './config/db';
import { Camp, Consumption, Resource, User } from './models/models';

async function seed() {
  await connectDatabase();
  await Promise.all([User.deleteMany({}), Resource.deleteMany({}), Consumption.deleteMany({}), Camp.deleteMany({})]);

  await User.insertMany([
    { name: 'Col. Abhishek Pandey', email: 'commander@logistics.node', passwordHash: await bcrypt.hash('SACRMS-ADMIN', 12), role: 'Admin', campId: null, rank: 'Headquarters Logistics Admin', serviceId: 'SVC-CMD-7709' },
  ]);
  console.log('SACRMS database seeded');
  process.exit(0);
}

seed().catch((error) => { console.error(error); process.exit(1); });

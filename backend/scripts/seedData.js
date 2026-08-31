require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Department = require('../models/Department');
const Programme = require('../models/Programme');
const Block = require('../models/Block');
const Room = require('../models/Room');
const User = require('../models/User');
const Role = require('../models/Role');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tms_test';

async function seedData() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  // Clear existing data (optional - comment out if you want to keep existing data)
  // await Department.deleteMany({});
  // await Programme.deleteMany({});
  // await Block.deleteMany({});
  // await Room.deleteMany({});
  // await User.deleteMany({});
  // await Role.deleteMany({});

  console.log('Seeding data...');

  // 1. Create Departments
  const departments = await Department.insertMany([
    { name: 'Computer Science & Engineering', shortName: 'CSE', description: 'Department of Computer Science & Engineering', isActive: true },
    { name: 'Electrical Engineering', shortName: 'EE', description: 'Department of Electrical Engineering', isActive: true },
    { name: 'Mechanical Engineering', shortName: 'ME', description: 'Department of Mechanical Engineering', isActive: true },
    { name: 'Civil Engineering', shortName: 'CE', description: 'Department of Civil Engineering', isActive: true },
    { name: 'Electronics & Communication', shortName: 'ECE', description: 'Department of Electronics & Communication', isActive: true },
  ]);
  console.log('Created departments:', departments.length);

  // 2. Create Programmes
  const programmes = await Programme.insertMany([
    { name: 'Bachelor of Technology', shortName: 'BTECH', department: departments[0]._id, description: '4-year undergraduate programme', isActive: true },
    { name: 'Master of Technology', shortName: 'MTECH', department: departments[0]._id, description: '2-year postgraduate programme', isActive: true },
    { name: 'Bachelor of Technology', shortName: 'BTECH', department: departments[1]._id, description: '4-year undergraduate programme', isActive: true },
    { name: 'Master of Technology', shortName: 'MTECH', department: departments[1]._id, description: '2-year postgraduate programme', isActive: true },
    { name: 'Bachelor of Technology', shortName: 'BTECH', department: departments[2]._id, description: '4-year undergraduate programme', isActive: true },
    { name: 'Bachelor of Technology', shortName: 'BTECH', department: departments[3]._id, description: '4-year undergraduate programme', isActive: true },
    { name: 'Bachelor of Technology', shortName: 'BTECH', department: departments[4]._id, description: '4-year undergraduate programme', isActive: true },
  ]);
  console.log('Created programmes:', programmes.length);

  // 3. Create Blocks
  const blocks = await Block.insertMany([
    { name: 'Block A - CSE', department: departments[0]._id, programme: programmes[0]._id, description: 'Computer Science Building', isActive: true },
    { name: 'Block B - CSE', department: departments[0]._id, programme: programmes[1]._id, description: 'PG Block', isActive: true },
    { name: 'Block A - EE', department: departments[1]._id, programme: programmes[2]._id, description: 'Electrical Building', isActive: true },
    { name: 'Block A - ME', department: departments[2]._id, programme: programmes[4]._id, description: 'Mechanical Building', isActive: true },
    { name: 'Block A - CE', department: departments[3]._id, programme: programmes[5]._id, description: 'Civil Building', isActive: true },
    { name: 'Block A - ECE', department: departments[4]._id, programme: programmes[6]._id, description: 'Electronics Building', isActive: true },
  ]);
  console.log('Created blocks:', blocks.length);

  // 4. Create Rooms
  const rooms = await Room.insertMany([
    { roomNumber: 'CSE-101', department: departments[0]._id, programme: programmes[0]._id, block: blocks[0]._id, floor: 1, capacity: 60, description: 'Classroom', isActive: true },
    { roomNumber: 'CSE-102', department: departments[0]._id, programme: programmes[0]._id, block: blocks[0]._id, floor: 1, capacity: 60, description: 'Classroom', isActive: true },
    { roomNumber: 'CSE-103', department: departments[0]._id, programme: programmes[0]._id, block: blocks[0]._id, floor: 2, capacity: 30, description: 'Lab', isActive: true },
    { roomNumber: 'CSE-104', department: departments[0]._id, programme: programmes[0]._id, block: blocks[0]._id, floor: 2, capacity: 30, description: 'Lab', isActive: true },
    { roomNumber: 'CSE-201', department: departments[0]._id, programme: programmes[1]._id, block: blocks[1]._id, floor: 2, capacity: 20, description: 'PG Classroom', isActive: true },
    { roomNumber: 'CSE-202', department: departments[0]._id, programme: programmes[1]._id, block: blocks[1]._id, floor: 2, capacity: 20, description: 'PG Classroom', isActive: true },
    { roomNumber: 'EE-101', department: departments[1]._id, programme: programmes[2]._id, block: blocks[2]._id, floor: 1, capacity: 60, description: 'Classroom', isActive: true },
    { roomNumber: 'EE-102', department: departments[1]._id, programme: programmes[2]._id, block: blocks[2]._id, floor: 1, capacity: 60, description: 'Classroom', isActive: true },
    { roomNumber: 'EE-LAB1', department: departments[1]._id, programme: programmes[2]._id, block: blocks[2]._id, floor: 2, capacity: 30, description: 'Electrical Lab', isActive: true },
    { roomNumber: 'ME-101', department: departments[2]._id, programme: programmes[4]._id, block: blocks[3]._id, floor: 1, capacity: 60, description: 'Classroom', isActive: true },
    { roomNumber: 'ME-WORKSHOP', department: departments[2]._id, programme: programmes[4]._id, block: blocks[3]._id, floor: 1, capacity: 25, description: 'Workshop', isActive: true },
    { roomNumber: 'CE-101', department: departments[3]._id, programme: programmes[5]._id, block: blocks[4]._id, floor: 1, capacity: 60, description: 'Classroom', isActive: true },
    { roomNumber: 'CE-LAB', department: departments[3]._id, programme: programmes[5]._id, block: blocks[4]._id, floor: 2, capacity: 30, description: 'Civil Lab', isActive: true },
    { roomNumber: 'ECE-101', department: departments[4]._id, programme: programmes[6]._id, block: blocks[5]._id, floor: 1, capacity: 60, description: 'Classroom', isActive: true },
    { roomNumber: 'ECE-LAB', department: departments[4]._id, programme: programmes[6]._id, block: blocks[5]._id, floor: 2, capacity: 30, description: 'Electronics Lab', isActive: true },
  ]);
  console.log('Created rooms:', rooms.length);

  // 5. Create Roles
  const roles = await Role.insertMany([
    { name: 'SuperAdmin', description: 'Super Administrator', permissions: ['all'] },
    { name: 'User', description: 'Regular User', permissions: ['read'] },
    { name: 'Networking Staff', description: 'Networking Department Staff', permissions: ['read', 'write', 'complaints'] },
    { name: 'Plumber', description: 'Plumbing Department Staff', permissions: ['read', 'write', 'complaints'] },
    { name: 'Electrician', description: 'Electrical Department Staff', permissions: ['read', 'write', 'complaints'] },
    { name: 'Software Developer', description: 'Software Development Team', permissions: ['read', 'write', 'complaints'] },
    { name: 'PC Hardware', description: 'Hardware Support Team', permissions: ['read', 'write', 'complaints'] },
  ]);
  console.log('Created roles:', roles.length);

  // 6. Create additional Users
  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);
  const users = await User.insertMany([
    { username: 'john_doe', email: 'john@example.com', phone: '9876543210', password: hashedPassword, role: 'User', department: departments[0]._id, programme: programmes[0]._id, isActive: true },
    { username: 'jane_smith', email: 'jane@example.com', phone: '9876543211', password: hashedPassword, role: 'Networking Staff', department: departments[0]._id, programme: programmes[0]._id, isActive: true },
    { username: 'mike_wilson', email: 'mike@example.com', phone: '9876543212', password: hashedPassword, role: 'Plumber', department: departments[2]._id, programme: programmes[4]._id, isActive: true },
    { username: 'sarah_jones', email: 'sarah@example.com', phone: '9876543213', password: hashedPassword, role: 'Electrician', department: departments[1]._id, programme: programmes[2]._id, isActive: true },
    { username: 'alex_brown', email: 'alex@example.com', phone: '9876543214', password: hashedPassword, role: 'Software Developer', department: departments[0]._id, programme: programmes[1]._id, isActive: true },
  ]);
  console.log('Created users:', users.length);

  console.log('\n✅ Sample data seeded successfully!');
  console.log('\nTest Credentials:');
  console.log('  - SuperAdmin: admin@example.com / Passw0rd!');
  console.log('  - User: john@example.com / Passw0rd!');
  console.log('  - Staff: jane@example.com / Passw0rd!');

  await mongoose.disconnect();
  console.log('\nDisconnected from DB');
}

seedData().catch((err) => {
  console.error(err);
  process.exit(1);
});

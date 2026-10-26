require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('../models/Department');
const Programme = require('../models/Programme');
const Block = require('../models/Block');
const Room = require('../models/Room');

async function addExtraData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB Atlas');

    // 1. Create 5 Departments
    const newDepartments = [
      { name: 'Information Technology', shortName: 'IT', description: 'Department of Information Technology', isActive: true },
      { name: 'Artificial Intelligence & DS', shortName: 'AIDS', description: 'Department of AI and Data Science', isActive: true },
      { name: 'Biomedical Engineering', shortName: 'BME', description: 'Department of Biomedical Engineering', isActive: true },
      { name: 'Chemical Engineering', shortName: 'CHEM', description: 'Department of Chemical Engineering', isActive: true },
      { name: 'Management Studies', shortName: 'MBA', description: 'Department of Business Administration', isActive: true },
    ];

    const createdDepts = [];
    for (const d of newDepartments) {
      let dept = await Department.findOne({ shortName: d.shortName });
      if (!dept) {
        dept = await Department.create(d);
        console.log(`Created Department: ${dept.name} (${dept.shortName})`);
      } else {
        console.log(`Department exists: ${dept.name} (${dept.shortName})`);
      }
      createdDepts.push(dept);
    }

    // 2. Create 5 Programmes for these Departments
    const newProgrammes = [
      { name: 'B.Tech Information Technology', shortName: 'BTECH-IT', department: createdDepts[0]._id, description: '4-year IT undergraduate degree', isActive: true },
      { name: 'B.Tech AI & Data Science', shortName: 'BTECH-AI', department: createdDepts[1]._id, description: '4-year AI & DS undergraduate degree', isActive: true },
      { name: 'B.E. Biomedical Engineering', shortName: 'BE-BME', department: createdDepts[2]._id, description: '4-year Biomedical degree', isActive: true },
      { name: 'B.Tech Chemical Engineering', shortName: 'BTECH-CH', department: createdDepts[3]._id, description: '4-year Chemical Engineering degree', isActive: true },
      { name: 'Master of Business Administration', shortName: 'MBA-GEN', department: createdDepts[4]._id, description: '2-year Postgraduate MBA degree', isActive: true },
    ];

    const createdProgrammes = [];
    for (const p of newProgrammes) {
      let prog = await Programme.findOne({ shortName: p.shortName, department: p.department });
      if (!prog) {
        prog = await Programme.create(p);
        console.log(`Created Programme: ${prog.name} (${prog.shortName})`);
      } else {
        console.log(`Programme exists: ${prog.name} (${prog.shortName})`);
      }
      createdProgrammes.push(prog);
    }

    // 3. Create 5 Blocks
    const newBlocks = [
      { name: 'Tech Tower - IT Block', department: createdDepts[0]._id, programme: createdProgrammes[0]._id, description: 'IT Faculty and Labs Block', isActive: true },
      { name: 'Innovation Wing - AI Hub', department: createdDepts[1]._id, programme: createdProgrammes[1]._id, description: 'AI, Machine Learning and Research Hub', isActive: true },
      { name: 'Bio-Medical Research Block', department: createdDepts[2]._id, programme: createdProgrammes[2]._id, description: 'Biomedical Engineering & Clinical Labs', isActive: true },
      { name: 'Process Engineering Block', department: createdDepts[3]._id, programme: createdProgrammes[3]._id, description: 'Chemical and Material Science Block', isActive: true },
      { name: 'MBA Executive Tower', department: createdDepts[4]._id, programme: createdProgrammes[4]._id, description: 'Management School & Seminar Complex', isActive: true },
    ];

    const createdBlocks = [];
    for (const b of newBlocks) {
      let block = await Block.findOne({ name: b.name, department: b.department });
      if (!block) {
        block = await Block.create(b);
        console.log(`Created Block: ${block.name}`);
      } else {
        console.log(`Block exists: ${block.name}`);
      }
      createdBlocks.push(block);
    }

    // 4. Create 5 Rooms
    const newRooms = [
      { roomNumber: 'IT-301', department: createdDepts[0]._id, programme: createdProgrammes[0]._id, block: createdBlocks[0]._id, floor: 3, capacity: 60, description: 'Cloud Computing & Networks Lab', isActive: true },
      { roomNumber: 'AI-204', department: createdDepts[1]._id, programme: createdProgrammes[1]._id, block: createdBlocks[1]._id, floor: 2, capacity: 50, description: 'Deep Learning & Robotics Lab', isActive: true },
      { roomNumber: 'BME-102', department: createdDepts[2]._id, programme: createdProgrammes[2]._id, block: createdBlocks[2]._id, floor: 1, capacity: 45, description: 'Bio-Instrumentation & Sensors Lab', isActive: true },
      { roomNumber: 'CHEM-G01', department: createdDepts[3]._id, programme: createdProgrammes[3]._id, block: createdBlocks[3]._id, floor: 0, capacity: 40, description: 'Unit Operations & Chemical Reaction Lab', isActive: true },
      { roomNumber: 'MBA-AUD 401', department: createdDepts[4]._id, programme: createdProgrammes[4]._id, block: createdBlocks[4]._id, floor: 4, capacity: 120, description: 'Executive Seminar Hall & Smart Classroom', isActive: true },
    ];

    for (const r of newRooms) {
      let room = await Room.findOne({ roomNumber: r.roomNumber, block: r.block });
      if (!room) {
        room = await Room.create(r);
        console.log(`Created Room: ${room.roomNumber} (${room.description})`);
      } else {
        console.log(`Room exists: ${room.roomNumber}`);
      }
    }

    console.log('\nAll 5 extra Departments, Blocks, and Rooms created successfully!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error inserting extra data:', err);
    process.exit(1);
  }
}

addExtraData();

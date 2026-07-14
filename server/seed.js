const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const User = require('./models/User');
const Department = require('./models/Department');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Leave.deleteMany({});
    await Payroll.deleteMany({});
    console.log('Old data cleared.');

    // Create departments (without manager yet)
    const departments = await Department.insertMany([
      { name: 'Engineering' },
      { name: 'Human Resources' },
      { name: 'Sales' },
      { name: 'Finance' },
    ]);
    console.log('Departments created.');

    // Create an HR Manager
    const hrManager = await User.create({
      name: 'Priya Sharma',
      email: 'priya.hr@company.com',
      password: 'password123', // plain text for now, we'll hash it later
      role: 'hr_manager',
      department: departments[1]._id, // HR department
    });

    // Assign HR manager to HR department
    departments[1].manager = hrManager._id;
    await departments[1].save();

    // Create sample employees
    const employees = [];
    for (let i = 0; i < 8; i++) {
      const randomDept = departments[Math.floor(Math.random() * departments.length)];
      const employee = await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: 'password123',
        role: 'employee',
        department: randomDept._id,
      });
      employees.push(employee);
    }
    console.log(`${employees.length} employees created.`);

    // Create sample leave requests
    for (let i = 0; i < 5; i++) {
      const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
      await Leave.create({
        employee: randomEmployee._id,
        leaveType: ['sick', 'casual', 'earned'][Math.floor(Math.random() * 3)],
        startDate: faker.date.soon({ days: 10 }),
        endDate: faker.date.soon({ days: 15 }),
        status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
        reason: 'Personal reasons',
      });
    }
    console.log('Leave requests created.');

    // Create sample payroll records
    for (const employee of employees) {
      const basicSalary = faker.number.int({ min: 30000, max: 80000 });
      const deductions = Math.floor(basicSalary * 0.1);
      await Payroll.create({
        employee: employee._id,
        month: 7,
        year: 2026,
        basicSalary,
        deductions,
        netSalary: basicSalary - deductions,
        status: 'processed',
      });
    }
    console.log('Payroll records created.');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
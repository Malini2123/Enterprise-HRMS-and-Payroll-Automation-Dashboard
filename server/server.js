const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const { protect, requireRole } = require('./middleware/authMiddleware');
const User = require('./models/User');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// General rate limiter: max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Auth routes (register/login) — login has its own stricter limiter inside authRoutes.js
app.use('/api/auth', authRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Protected route: only hr_manager or admin can view employee list
app.get('/api/employees', protect, requireRole('hr_manager', 'admin'), async (req, res) => {
  try {
    const employees = await User.aggregate([
      { $match: { role: 'employee' } },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'departmentInfo'
        }
      },
      { $unwind: '$departmentInfo' },
      {
        $lookup: {
          from: 'users',
          localField: 'departmentInfo.manager',
          foreignField: '_id',
          as: 'managerInfo'
        }
      },
      {
        $unwind: {
          path: '$managerInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          'departmentInfo.name': 1,
          'managerInfo.name': 1
        }
      }
    ]);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
const bcrypt = require('bcryptjs');
const Department = require('./models/Department');

app.post('/api/employees', protect, requireRole('hr_manager', 'admin'), async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newEmployee = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
      department,
    });

    res.status(201).json({
      message: 'Employee onboarded successfully',
      employee: {
        id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/departments', protect, async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const { protect, requireRole } = require('./middleware/authMiddleware');
const User = require('./models/User');
const Department = require('./models/Department');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll');
const generatePayslipPDF = require('./utils/generatePayslip');

const Document = require('./models/Document');
const documentUpload = require('./utils/documentUpload');
const path = require('path');
const fs = require('fs');
const Announcement = require('./models/Announcement');


const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// General rate limiter: max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Auth routes (register/login) — login has its own stricter limiter inside authRoutes.js
app.use('/api/auth', authRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ---------------- EMPLOYEES ----------------

// HR/Admin: view all employees with department + manager joined
app.get('/api/employees', protect, requireRole('hr_manager', 'admin'), async (req, res) => {
  try {
    const employees = await User.aggregate([
      { $match: { role: 'employee' } },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'departmentInfo',
        },
      },
      { $unwind: '$departmentInfo' },
      {
        $lookup: {
          from: 'users',
          localField: 'departmentInfo.manager',
          foreignField: '_id',
          as: 'managerInfo',
        },
      },
      {
        $unwind: {
          path: '$managerInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          'departmentInfo.name': 1,
          'managerInfo.name': 1,
        },
      },
    ]);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// HR/Admin: onboard a new employee
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

// ---------------- DEPARTMENTS ----------------

app.get('/api/departments', protect, async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------------- LEAVES ----------------

// Employee: submit a leave request
app.post('/api/leaves', protect, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const leave = await Leave.create({
      employee: req.user.id,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({ message: 'Leave request submitted', leave });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Employee: view their own leave requests
app.get('/api/leaves/my', protect, async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// HR Manager: view all pending leave requests (with employee info joined)
app.get('/api/leaves/pending', protect, requireRole('hr_manager', 'admin'), async (req, res) => {
  try {
    const leaves = await Leave.aggregate([
      { $match: { status: 'pending' } },
      {
        $lookup: {
          from: 'users',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeInfo',
        },
      },
      { $unwind: '$employeeInfo' },
      {
        $project: {
          leaveType: 1,
          startDate: 1,
          endDate: 1,
          reason: 1,
          status: 1,
          createdAt: 1,
          'employeeInfo.name': 1,
          'employeeInfo.email': 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// HR Manager: approve or reject a leave request
app.patch('/api/leaves/:id', protect, requireRole('hr_manager', 'admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.json({ message: `Leave ${status}`, leave });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// ---------------- DOCUMENTS ----------------

// Employee: upload a document
app.post('/api/documents', protect, documentUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { name, category } = req.body;

    const document = await Document.create({
      employee: req.user.id,
      name: name || req.file.originalname,
      category: category || 'other',
      fileName: req.file.originalname,
      filePath: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
    });

    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Employee: view their own documents
app.get('/api/documents/my', protect, async (req, res) => {
  try {
    const documents = await Document.find({ employee: req.user.id }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// HR/Admin: view all documents (with employee info)
app.get('/api/documents', protect, requireRole('hr_manager', 'admin'), async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('employee', 'name email')
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download a document (employee: own only; HR/admin: any)
app.get('/api/documents/:id/download', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (req.user.role === 'employee' && document.employee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = path.join(__dirname, 'uploads', 'documents', document.filePath);
    res.download(filePath, document.fileName);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a document (employee: own only; HR/admin: any)
app.delete('/api/documents/:id', protect, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (req.user.role === 'employee' && document.employee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = path.join(__dirname, 'uploads', 'documents', document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.deleteOne();
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------------- PAYROLL ----------------

// HR/Admin: get all payroll records
app.get('/api/payroll', protect, requireRole('hr_manager', 'admin'), async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate('employee', 'name email');
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Employee: get their own payroll records
app.get('/api/payroll/my', protect, async (req, res) => {
  try {
    const records = await Payroll.find({ employee: req.user.id }).sort({ year: -1, month: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download a payslip PDF (employee can only download their own; HR/admin can download any)
app.get('/api/payroll/:id/payslip', protect, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employee', 'name email');

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    if (
      req.user.role === 'employee' &&
      payroll.employee._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    generatePayslipPDF(res, payroll, payroll.employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// ---------------- ANNOUNCEMENTS ----------------

// Everyone: view all announcements (most recent first)
app.get('/api/announcements', protect, async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// HR/Admin: post a new announcement
app.post('/api/announcements', protect, requireRole('hr_manager', 'admin'), async (req, res) => {
  try {
    const { title, message } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      postedBy: req.user.id,
    });

    res.status(201).json({ message: 'Announcement posted', announcement });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// HR/Admin: delete an announcement
app.delete('/api/announcements/:id', protect, requireRole('hr_manager', 'admin'), async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
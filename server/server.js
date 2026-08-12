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
const Document = require('./models/Document');
const Announcement = require('./models/Announcement');
const Attendance = require('./models/Attendance');
const { OKR, Kudos } = require('./models/Performance');
const { JobOpening, Candidate } = require('./models/Recruitment');
const Ticket = require('./models/Ticket');
const Asset = require('./models/Asset');

const generatePayslipPDF = require('./utils/generatePayslip');
const documentUpload = require('./utils/documentUpload');
const path = require('path');
const fs = require('fs');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// General rate limiter: max 500 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Auth routes (register/login)
app.use('/api/auth', authRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// MongoDB connection
let isDbConnected = false;
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrms')
  .then(() => {
    isDbConnected = true;
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.warn('MongoDB connection fallback (mock resilient mode active):', err.message);
  });

// ---------------- IN-MEMORY MOCK STORE FOR FALLBACK & SEED DATA ----------------
const mockStore = {
  attendance: [
    {
      id: 'att-1',
      employeeName: 'Sarah Jenkins',
      date: new Date().toISOString().split('T')[0],
      punchIn: new Date(Date.now() - 5.5 * 3600 * 1000).toISOString(),
      punchOut: null,
      totalHours: 5.5,
      status: 'present',
      workMode: 'office',
      isOnBreak: false,
    },
    {
      id: 'att-2',
      employeeName: 'Marcus Vance',
      date: new Date().toISOString().split('T')[0],
      punchIn: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
      punchOut: null,
      totalHours: 7.0,
      status: 'present',
      workMode: 'remote',
      isOnBreak: false,
    },
    {
      id: 'att-3',
      employeeName: 'Aisha Patel',
      date: new Date().toISOString().split('T')[0],
      punchIn: new Date(Date.now() - 8.2 * 3600 * 1000).toISOString(),
      punchOut: new Date(Date.now() - 0.2 * 3600 * 1000).toISOString(),
      totalHours: 8.0,
      status: 'present',
      workMode: 'hybrid',
      isOnBreak: false,
    },
  ],
  okrs: [
    {
      id: 'okr-1',
      employeeName: 'Sarah Jenkins',
      quarter: 'Q3 2026',
      objective: 'Scale Core Platform Reliability to 99.99%',
      category: 'Engineering',
      progress: 78,
      status: 'on_track',
      keyResults: [
        { title: 'Reduce API p99 latency below 120ms', currentValue: 110, targetValue: 120, unit: 'ms' },
        { title: 'Achieve 95% automated end-to-end test coverage', currentValue: 92, targetValue: 95, unit: '%' },
        { title: 'Complete Zero-Downtime database migration', currentValue: 100, targetValue: 100, unit: '%' },
      ],
    },
    {
      id: 'okr-2',
      employeeName: 'Marcus Vance',
      quarter: 'Q3 2026',
      objective: 'Launch Next-Gen Enterprise Self-Service Portal',
      category: 'Product',
      progress: 85,
      status: 'on_track',
      keyResults: [
        { title: 'Deliver 12 interactive HR modules', currentValue: 12, targetValue: 12, unit: 'modules' },
        { title: 'Attain user satisfaction CSAT >= 4.8/5.0', currentValue: 4.9, targetValue: 5.0, unit: 'pts' },
      ],
    },
    {
      id: 'okr-3',
      employeeName: 'Priya Sharma',
      quarter: 'Q3 2026',
      objective: 'Optimize Employee Retention and Talent Acquisition',
      category: 'Leadership',
      progress: 64,
      status: 'behind',
      keyResults: [
        { title: 'Reduce average hiring cycle to under 18 days', currentValue: 21, targetValue: 18, unit: 'days' },
        { title: 'Execute quarterly peer recognition kudos campaign', currentValue: 100, targetValue: 100, unit: '%' },
      ],
    },
  ],
  kudos: [
    {
      id: 'kudos-1',
      fromUser: 'Priya Sharma (HR Director)',
      toUser: 'Sarah Jenkins',
      badge: 'Problem Solver',
      message: 'Huge thanks for resolving the database indexing bottleneck over the weekend! Outstanding dedication!',
      claps: 24,
      createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    },
    {
      id: 'kudos-2',
      fromUser: 'Marcus Vance (Lead Architect)',
      toUser: 'Aisha Patel',
      badge: 'Innovator',
      message: 'Created a blazing fast payroll tax simulator that saved the team 40+ hours this month!',
      claps: 18,
      createdAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
    },
    {
      id: 'kudos-3',
      fromUser: 'David Miller (Finance)',
      toUser: 'Marcus Vance',
      badge: 'Rockstar',
      message: 'Phenomenal leadership in closing the enterprise compliance audit with zero discrepancies.',
      claps: 32,
      createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    },
  ],
  jobs: [
    {
      id: 'job-1',
      title: 'Senior Full Stack Engineer (React/Node)',
      department: 'Engineering',
      location: 'San Francisco, CA (Hybrid)',
      type: 'Full-time',
      experience: '4-7 years',
      salaryRange: '$140,000 - $175,000',
      openingsCount: 2,
      status: 'open',
      applicantCount: 14,
    },
    {
      id: 'job-2',
      title: 'Lead Product Designer (UI/UX)',
      department: 'Product & Design',
      location: 'New York, NY (Remote)',
      type: 'Full-time',
      experience: '5+ years',
      salaryRange: '$130,000 - $160,000',
      openingsCount: 1,
      status: 'open',
      applicantCount: 9,
    },
    {
      id: 'job-3',
      title: 'HR People Operations Specialist',
      department: 'Human Resources',
      location: 'Austin, TX (On-site)',
      type: 'Full-time',
      experience: '2-4 years',
      salaryRange: '$75,000 - $95,000',
      openingsCount: 1,
      status: 'open',
      applicantCount: 22,
    },
    {
      id: 'job-4',
      title: 'Cloud DevOps & Security Architect',
      department: 'Infrastructure',
      location: 'Seattle, WA (Hybrid)',
      type: 'Full-time',
      experience: '6+ years',
      salaryRange: '$160,000 - $195,000',
      openingsCount: 1,
      status: 'open',
      applicantCount: 7,
    },
  ],
  candidates: [
    {
      id: 'cand-1',
      name: 'Elena Rostova',
      jobTitle: 'Senior Full Stack Engineer (React/Node)',
      email: 'elena.rostova@techmail.io',
      phone: '+1 (555) 234-8910',
      stage: 'interview',
      rating: 5,
      appliedDate: '2026-08-01',
      notes: 'Strong in React 19, Node microservices, and distributed state caching. Ex-Stripe.',
    },
    {
      id: 'cand-2',
      name: 'Liam Chen',
      jobTitle: 'Senior Full Stack Engineer (React/Node)',
      email: 'liam.chen@devhub.co',
      phone: '+1 (555) 345-6789',
      stage: 'offer',
      rating: 5,
      appliedDate: '2026-07-28',
      notes: 'Passed all 4 interview rounds with stellar feedback. Offer packet generated at $165k.',
    },
    {
      id: 'cand-3',
      name: 'Sofia Martinez',
      jobTitle: 'Lead Product Designer (UI/UX)',
      email: 'sofia.m@designlab.org',
      phone: '+1 (555) 456-7890',
      stage: 'screening',
      rating: 4,
      appliedDate: '2026-08-05',
      notes: 'Exceptional design portfolio, strong experience with dark mode design systems.',
    },
    {
      id: 'cand-4',
      name: 'Arjun Mehta',
      jobTitle: 'Cloud DevOps & Security Architect',
      email: 'arjun.mehta@cloudsec.net',
      phone: '+1 (555) 567-8901',
      stage: 'applied',
      rating: 4,
      appliedDate: '2026-08-10',
      notes: 'Kubernetes certified, Terraform & AWS multi-region expertise.',
    },
    {
      id: 'cand-5',
      name: 'Chloe Bennett',
      jobTitle: 'HR People Operations Specialist',
      email: 'chloe.bennett@peopleops.com',
      phone: '+1 (555) 678-9012',
      stage: 'hired',
      rating: 5,
      appliedDate: '2026-07-15',
      notes: 'Successfully onboarded starting next Monday!',
    },
  ],
  tickets: [
    {
      id: 'TCK-1082',
      ticketNumber: 'TCK-1082',
      title: 'Request Dual 4K Monitor Arm for Workstation',
      category: 'Facilities & Admin',
      priority: 'medium',
      status: 'in_progress',
      raisedBy: 'Sarah Jenkins',
      assignedTo: 'Alex Torres (IT Ops)',
      createdAt: '2026-08-10T10:30:00Z',
      replies: [
        { author: 'Sarah Jenkins', authorRole: 'employee', message: 'Hello! I need a dual monitor mount for ergonomics.', createdAt: '2026-08-10T10:30:00Z' },
        { author: 'Alex Torres', authorRole: 'admin', message: 'Approved! Desk mount has been dispatched from central inventory.', createdAt: '2026-08-10T14:15:00Z' },
      ],
    },
    {
      id: 'TCK-1083',
      ticketNumber: 'TCK-1083',
      title: 'Tax Deduction Clarification for Q2 Incentive Bonus',
      category: 'Payroll & Tax',
      priority: 'high',
      status: 'open',
      raisedBy: 'Marcus Vance',
      assignedTo: 'David Miller (Finance)',
      createdAt: '2026-08-11T09:15:00Z',
      replies: [
        { author: 'Marcus Vance', authorRole: 'employee', message: 'Could you review the TDS calculation for July payroll bonus?', createdAt: '2026-08-11T09:15:00Z' },
      ],
    },
    {
      id: 'TCK-1084',
      ticketNumber: 'TCK-1084',
      title: 'AWS Production IAM Access Key Renewal',
      category: 'IT Support',
      priority: 'urgent',
      status: 'resolved',
      raisedBy: 'Aisha Patel',
      assignedTo: 'Security Team',
      createdAt: '2026-08-09T16:00:00Z',
      replies: [
        { author: 'Aisha Patel', authorRole: 'employee', message: 'Need new rotated token for Terraform deployment pipeline.', createdAt: '2026-08-09T16:00:00Z' },
        { author: 'Security Team', authorRole: 'admin', message: 'Provisioned securely via 1Password Vault.', createdAt: '2026-08-09T16:45:00Z' },
      ],
    },
  ],
  assets: [
    {
      id: 'AST-401',
      assetTag: 'AST-401',
      name: 'MacBook Pro 16" M3 Max',
      category: 'Laptop',
      model: 'Apple MBP 16 / 64GB RAM / 1TB SSD',
      serialNumber: 'C02G89AAL4',
      assignedTo: 'Sarah Jenkins',
      status: 'allocated',
      condition: 'Excellent',
      warrantyExpiry: '2027-11-30',
    },
    {
      id: 'AST-402',
      assetTag: 'AST-402',
      name: 'Dell UltraSharp 32" 4K Curved Monitor',
      category: 'Monitor',
      model: 'U3223QE PremierColor',
      serialNumber: 'CN-0K7938-12',
      assignedTo: 'Sarah Jenkins',
      status: 'allocated',
      condition: 'Excellent',
      warrantyExpiry: '2028-03-15',
    },
    {
      id: 'AST-403',
      assetTag: 'AST-403',
      name: 'YubiKey 5C NFC Enterprise Security Token',
      category: 'Security Key',
      model: 'Yubico 5C NFC FIPS',
      serialNumber: 'YK-9938210',
      assignedTo: 'Marcus Vance',
      status: 'allocated',
      condition: 'Excellent',
      warrantyExpiry: '2029-01-01',
    },
    {
      id: 'AST-404',
      assetTag: 'AST-404',
      name: 'Lenovo ThinkPad P1 Gen 6',
      category: 'Laptop',
      model: 'Intel i9 / 32GB RAM / RTX 4080',
      serialNumber: 'LNV-8829104',
      assignedTo: null,
      status: 'available',
      condition: 'Excellent',
      warrantyExpiry: '2027-08-20',
    },
  ],
  policies: [
    {
      id: 'pol-1',
      category: 'Leave & Time Off',
      title: 'Annual Paid Time Off & Sick Leave Guidelines',
      summary: 'All full-time employees are entitled to 24 annual vacation days, 12 paid sick days, and 10 national holidays.',
      content: 'Employees may carry over up to 5 unused annual leave days into the next calendar year. Sick leaves exceeding 3 continuous working days require medical certification.',
      effectiveDate: '2026-01-01',
    },
    {
      id: 'pol-2',
      category: 'Workplace & Remote',
      title: 'Flexible & Hybrid Working Framework',
      summary: 'Guidelines on home office setup, core collaboration hours (10:00 AM - 4:00 PM), and ergonomic reimbursements.',
      content: 'Employees may work remotely up to 3 days per week with manager coordination. Each employee is eligible for a $1,000 home office ergonomics stipend.',
      effectiveDate: '2026-01-01',
    },
    {
      id: 'pol-3',
      category: 'Compensation & Benefits',
      title: 'Health Insurance, 401(k) & Performance Bonuses',
      summary: 'Comprehensive PPO health insurance coverage, 100% 401(k) matching up to 5%, and quarterly performance incentives.',
      content: 'Medical, dental, and vision insurance premiums are 100% employer-covered for employees and 80% for dependents. Performance bonuses are reviewed every quarter.',
      effectiveDate: '2026-01-01',
    },
    {
      id: 'pol-4',
      category: 'Travel & Expenses',
      title: 'Business Travel Reimbursement & Per Diem Policy',
      summary: 'Standard daily meals per diem of $75/day, flight booking via corporate travel portal, and ride-share policies.',
      content: 'Submit travel expense receipts within 14 days of trip completion via the Document Vault or Expense Portal for rapid reimbursement.',
      effectiveDate: '2026-01-01',
    },
  ],
};

// ---------------- EMPLOYEES & DIRECTORY ----------------

app.get('/api/employees', protect, async (req, res) => {
  try {
    if (isDbConnected) {
      const employees = await User.aggregate([
        {
          $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            as: 'departmentInfo',
          },
        },
        { $unwind: { path: '$departmentInfo', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'departmentInfo.manager',
            foreignField: '_id',
            as: 'managerInfo',
          },
        },
        { $unwind: { path: '$managerInfo', preserveNullAndEmptyArrays: true } },
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
      if (employees && employees.length > 0) {
        return res.json(employees);
      }
    }

    // High quality mock employees if database is fresh
    const mockEmployees = [
      { _id: 'u-1', name: 'Priya Sharma', email: 'priya.hr@company.com', role: 'hr_manager', departmentInfo: { name: 'Human Resources' }, managerInfo: { name: 'Executive Board' }, title: 'VP of People & Culture', phone: '+1 (555) 019-2831', location: 'San Francisco, CA' },
      { _id: 'u-2', name: 'Sarah Jenkins', email: 'sarah.j@company.com', role: 'employee', departmentInfo: { name: 'Engineering' }, managerInfo: { name: 'Marcus Vance' }, title: 'Senior Full Stack Engineer', phone: '+1 (555) 014-9923', location: 'San Francisco, CA' },
      { _id: 'u-3', name: 'Marcus Vance', email: 'marcus.v@company.com', role: 'employee', departmentInfo: { name: 'Engineering' }, managerInfo: { name: 'Priya Sharma' }, title: 'Lead Systems Architect', phone: '+1 (555) 018-4421', location: 'Seattle, WA' },
      { _id: 'u-4', name: 'Aisha Patel', email: 'aisha.p@company.com', role: 'employee', departmentInfo: { name: 'Product & Design' }, managerInfo: { name: 'Priya Sharma' }, title: 'Principal UX Designer', phone: '+1 (555) 017-8822', location: 'New York, NY' },
      { _id: 'u-5', name: 'David Miller', email: 'david.m@company.com', role: 'employee', departmentInfo: { name: 'Finance' }, managerInfo: { name: 'Priya Sharma' }, title: 'Senior Financial Controller', phone: '+1 (555) 012-3344', location: 'Austin, TX' },
      { _id: 'u-6', name: 'James Wilson', email: 'james.w@company.com', role: 'employee', departmentInfo: { name: 'Sales & Growth' }, managerInfo: { name: 'Priya Sharma' }, title: 'Enterprise Account Executive', phone: '+1 (555) 015-7766', location: 'Chicago, IL' },
      { _id: 'u-7', name: 'Emily Zhang', email: 'emily.z@company.com', role: 'employee', departmentInfo: { name: 'Infrastructure' }, managerInfo: { name: 'Marcus Vance' }, title: 'Cloud DevOps Specialist', phone: '+1 (555) 019-5511', location: 'Remote, US' },
      { _id: 'u-8', name: 'Carlos Rodriguez', email: 'carlos.r@company.com', role: 'employee', departmentInfo: { name: 'Engineering' }, managerInfo: { name: 'Marcus Vance' }, title: 'Backend Core Engineer', phone: '+1 (555) 013-6677', location: 'San Francisco, CA' },
    ];
    res.json(mockEmployees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Employee stats summary
app.get('/api/employees/stats', protect, async (req, res) => {
  res.json({
    totalEmployees: 48,
    activeToday: 44,
    onLeave: 4,
    remoteCount: 18,
    openPositions: 5,
    pendingLeaveRequests: 3,
    payrollStatus: 'Processed for Current Month',
    payrollAmount: '$482,500.00',
    attendanceRate: '96.4%',
  });
});

// Onboard new employee
app.post('/api/employees', protect, requireRole('hr_manager', 'admin'), async (req, res) => {
  try {
    const { name, email, password, department, role, title, salary } = req.body;

    if (isDbConnected) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Employee with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password || 'Welcome123!', salt);

      const newEmployee = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'employee',
        department: department || null,
      });

      return res.status(201).json({
        message: 'Employee onboarded successfully',
        employee: {
          id: newEmployee._id,
          name: newEmployee.name,
          email: newEmployee.email,
          role: newEmployee.role,
        },
      });
    }

    res.status(201).json({
      message: 'Employee onboarded successfully (Mock mode)',
      employee: {
        id: 'u-' + Date.now(),
        name,
        email,
        role: role || 'employee',
        title: title || 'Specialist',
        salary: salary || 95000,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------------- ORG HIERARCHY ----------------

app.get('/api/org/hierarchy', protect, (req, res) => {
  const tree = {
    id: 'ceo',
    name: 'Alexandra Hayes',
    title: 'Chief Executive Officer',
    department: 'Executive',
    email: 'ceo@company.com',
    avatar: 'AH',
    children: [
      {
        id: 'hr-head',
        name: 'Priya Sharma',
        title: 'VP of People & Culture',
        department: 'Human Resources',
        email: 'priya.hr@company.com',
        avatar: 'PS',
        children: [
          { id: 'hr-1', name: 'Chloe Bennett', title: 'HR Ops Specialist', department: 'Human Resources', email: 'chloe.b@company.com', avatar: 'CB' },
          { id: 'hr-2', name: 'David Miller', title: 'Senior Financial Controller', department: 'Finance', email: 'david.m@company.com', avatar: 'DM' },
        ],
      },
      {
        id: 'eng-head',
        name: 'Marcus Vance',
        title: 'Head of Engineering',
        department: 'Engineering',
        email: 'marcus.v@company.com',
        avatar: 'MV',
        children: [
          { id: 'eng-1', name: 'Sarah Jenkins', title: 'Senior Full Stack Engineer', department: 'Engineering', email: 'sarah.j@company.com', avatar: 'SJ' },
          { id: 'eng-2', name: 'Carlos Rodriguez', title: 'Backend Core Engineer', department: 'Engineering', email: 'carlos.r@company.com', avatar: 'CR' },
          { id: 'eng-3', name: 'Emily Zhang', title: 'Cloud DevOps Specialist', department: 'Infrastructure', email: 'emily.z@company.com', avatar: 'EZ' },
        ],
      },
      {
        id: 'prod-head',
        name: 'Aisha Patel',
        title: 'VP of Product & Experience',
        department: 'Product & Design',
        email: 'aisha.p@company.com',
        avatar: 'AP',
        children: [
          { id: 'prod-1', name: 'James Wilson', title: 'Enterprise Account Executive', department: 'Sales', email: 'james.w@company.com', avatar: 'JW' },
        ],
      },
    ],
  };
  res.json(tree);
});

// ---------------- ATTENDANCE & TIME TRACKING ----------------

app.get('/api/attendance/status', protect, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const activeRecord = mockStore.attendance.find((a) => a.date === today && a.employeeName === (req.user?.name || 'Sarah Jenkins')) || {
    id: 'att-live',
    employeeName: req.user?.name || 'Sarah Jenkins',
    date: today,
    punchIn: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString(),
    punchOut: null,
    totalHours: 4.5,
    status: 'present',
    workMode: 'office',
    isOnBreak: false,
  };
  res.json(activeRecord);
});

app.post('/api/attendance/punch-in', protect, (req, res) => {
  const { workMode } = req.body;
  const today = new Date().toISOString().split('T')[0];
  const record = {
    id: 'att-' + Date.now(),
    employeeName: req.user?.name || 'Sarah Jenkins',
    date: today,
    punchIn: new Date().toISOString(),
    punchOut: null,
    totalHours: 0.1,
    status: 'present',
    workMode: workMode || 'office',
    isOnBreak: false,
  };
  mockStore.attendance.unshift(record);
  res.json({ message: 'Punched in successfully', record });
});

app.post('/api/attendance/punch-out', protect, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const record = mockStore.attendance.find((a) => a.date === today) || mockStore.attendance[0];
  if (record) {
    record.punchOut = new Date().toISOString();
    record.totalHours = 8.2;
    record.isOnBreak = false;
  }
  res.json({ message: 'Punched out successfully', record });
});

app.post('/api/attendance/break', protect, (req, res) => {
  const { action } = req.body; // 'start' or 'end'
  const today = new Date().toISOString().split('T')[0];
  const record = mockStore.attendance.find((a) => a.date === today) || mockStore.attendance[0];
  if (record) {
    record.isOnBreak = action === 'start';
  }
  res.json({ message: `Break ${action === 'start' ? 'started' : 'ended'}`, isOnBreak: record?.isOnBreak });
});

app.get('/api/attendance/history', protect, (req, res) => {
  // Generate 30 days of calendar attendance data
  const history = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    const dateStr = d.toISOString().split('T')[0];

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      history.push({ date: dateStr, status: 'weekend', hours: 0, punchIn: '-', punchOut: '-' });
    } else if (i === 12) {
      history.push({ date: dateStr, status: 'on_leave', hours: 0, punchIn: '-', punchOut: '-', reason: 'Annual Leave' });
    } else if (i === 5) {
      history.push({ date: dateStr, status: 'half_day', hours: 4.2, punchIn: '09:00 AM', punchOut: '01:15 PM' });
    } else if (i === 8) {
      history.push({ date: dateStr, status: 'late', hours: 7.5, punchIn: '10:45 AM', punchOut: '06:30 PM' });
    } else {
      history.push({ date: dateStr, status: 'present', hours: 8.5, punchIn: '09:05 AM', punchOut: '05:35 PM' });
    }
  }
  res.json(history);
});

app.get('/api/attendance/all', protect, requireRole('hr_manager', 'admin'), (req, res) => {
  res.json(mockStore.attendance);
});

app.post('/api/attendance/regularize', protect, (req, res) => {
  const { date, reason, punchIn, punchOut } = req.body;
  res.status(201).json({
    message: 'Attendance regularization request submitted for HR approval',
    request: { id: 'reg-' + Date.now(), date, reason, punchIn, punchOut, status: 'pending' },
  });
});

// ---------------- AUTOMATED PAYROLL & TAX ENGINE ----------------

app.get('/api/payroll', protect, async (req, res) => {
  try {
    if (isDbConnected) {
      const payrolls = await Payroll.find().populate('employee', 'name email');
      if (payrolls && payrolls.length > 0) return res.json(payrolls);
    }
    const mockPayrollList = [
      { _id: 'pay-1', employee: { name: 'Sarah Jenkins', email: 'sarah.j@company.com' }, month: 7, year: 2026, basicSalary: 110000, hra: 33000, allowances: 15000, deductions: 18500, tax: 12000, netSalary: 127500, status: 'processed', paymentDate: '2026-07-31' },
      { _id: 'pay-2', employee: { name: 'Marcus Vance', email: 'marcus.v@company.com' }, month: 7, year: 2026, basicSalary: 135000, hra: 40500, allowances: 20000, deductions: 22000, tax: 16500, netSalary: 157000, status: 'processed', paymentDate: '2026-07-31' },
      { _id: 'pay-3', employee: { name: 'Aisha Patel', email: 'aisha.p@company.com' }, month: 7, year: 2026, basicSalary: 125000, hra: 37500, allowances: 18000, deductions: 20500, tax: 14000, netSalary: 146000, status: 'processed', paymentDate: '2026-07-31' },
      { _id: 'pay-4', employee: { name: 'David Miller', email: 'david.m@company.com' }, month: 7, year: 2026, basicSalary: 95000, hra: 28500, allowances: 12000, deductions: 15000, tax: 9500, netSalary: 111000, status: 'processed', paymentDate: '2026-07-31' },
      { _id: 'pay-5', employee: { name: 'James Wilson', email: 'james.w@company.com' }, month: 7, year: 2026, basicSalary: 90000, hra: 27000, allowances: 25000, deductions: 14000, tax: 11000, netSalary: 117000, status: 'pending', paymentDate: '2026-08-31' },
    ];
    res.json(mockPayrollList);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/payroll/my', protect, async (req, res) => {
  const mockMyPayslips = [
    { _id: 'pay-my-1', month: 7, year: 2026, basicSalary: 110000, hra: 33000, allowances: 15000, deductions: 18500, tax: 12000, netSalary: 127500, status: 'paid', paymentDate: '2026-07-31', bankRef: 'ACH-99482109' },
    { _id: 'pay-my-2', month: 6, year: 2026, basicSalary: 110000, hra: 33000, allowances: 15000, deductions: 18500, tax: 12000, netSalary: 127500, status: 'paid', paymentDate: '2026-06-30', bankRef: 'ACH-88392102' },
    { _id: 'pay-my-3', month: 5, year: 2026, basicSalary: 105000, hra: 31500, allowances: 14000, deductions: 17500, tax: 11000, netSalary: 122000, status: 'paid', paymentDate: '2026-05-31', bankRef: 'ACH-77281093' },
    { _id: 'pay-my-4', month: 4, year: 2026, basicSalary: 105000, hra: 31500, allowances: 14000, deductions: 17500, tax: 11000, netSalary: 122000, status: 'paid', paymentDate: '2026-04-30', bankRef: 'ACH-66170984' },
  ];
  res.json(mockMyPayslips);
});

// 1-Click Automated Batch Payroll Run
app.post('/api/payroll/process-run', protect, requireRole('hr_manager', 'admin'), (req, res) => {
  const { month, year } = req.body;
  res.json({
    message: `Batch Payroll cycle for ${month || 'August'} ${year || 2026} processed successfully!`,
    summary: {
      totalEmployees: 48,
      successfulDisbursements: 48,
      failedDisbursements: 0,
      totalGrossDisbursed: '$542,000.00',
      totalTaxWithheld: '$64,500.00',
      totalNetDisbursed: '$477,500.00',
      executionTimeMs: 420,
      processedAt: new Date().toISOString(),
    },
  });
});

// Tax Regime Estimator API
app.post('/api/payroll/tax-estimate', protect, (req, res) => {
  const { annualGross, section80C, section80D, hraExemption, npsDeduction } = req.body;
  const gross = Number(annualGross) || 1200000;
  const s80c = Math.min(Number(section80C) || 0, 150000);
  const s80d = Math.min(Number(section80D) || 0, 50000);
  const hra = Number(hraExemption) || 0;
  const nps = Math.min(Number(npsDeduction) || 0, 50000);

  // Old Regime Calculation
  const oldTaxable = Math.max(0, gross - 50000 - s80c - s80d - hra - nps);
  let oldTax = 0;
  if (oldTaxable > 1000000) oldTax += (oldTaxable - 1000000) * 0.3 + 112500;
  else if (oldTaxable > 500000) oldTax += (oldTaxable - 500000) * 0.2 + 12500;
  else if (oldTaxable > 250000) oldTax += (oldTaxable - 250000) * 0.05;

  // New Regime Calculation (simplified standard)
  const newTaxable = Math.max(0, gross - 75000);
  let newTax = 0;
  if (newTaxable > 1500000) newTax += (newTaxable - 1500000) * 0.3 + 140000;
  else if (newTaxable > 1200000) newTax += (newTaxable - 1200000) * 0.2 + 80000;
  else if (newTaxable > 900000) newTax += (newTaxable - 900000) * 0.15 + 35000;
  else if (newTaxable > 600000) newTax += (newTaxable - 600000) * 0.1 + 5000;
  else if (newTaxable > 300000) newTax += (newTaxable - 300000) * 0.05;

  res.json({
    grossAnnual: gross,
    oldRegime: { taxableIncome: oldTaxable, taxLiability: Math.round(oldTax * 1.04), monthlyNet: Math.round((gross - oldTax * 1.04) / 12) },
    newRegime: { taxableIncome: newTaxable, taxLiability: Math.round(newTax * 1.04), monthlyNet: Math.round((gross - newTax * 1.04) / 12) },
    recommended: newTax <= oldTax ? 'New Tax Regime' : 'Old Tax Regime',
    savings: Math.abs(Math.round(oldTax * 1.04 - newTax * 1.04)),
  });
});

// Download payslip PDF route
app.get('/api/payroll/:id/payslip', protect, async (req, res) => {
  try {
    if (isDbConnected) {
      const payroll = await Payroll.findById(req.params.id).populate('employee', 'name email');
      if (payroll) {
        return generatePayslipPDF(res, payroll, payroll.employee);
      }
    }
    // Fallback payslip response
    const mockPayroll = {
      _id: req.params.id,
      month: 7,
      year: 2026,
      basicSalary: 110000,
      deductions: 18500,
      netSalary: 127500,
      status: 'paid',
    };
    generatePayslipPDF(res, mockPayroll, { name: req.user?.name || 'Sarah Jenkins', email: req.user?.email || 'sarah.j@company.com' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------------- PERFORMANCE, OKRs & KUDOS WALL ----------------

app.get('/api/performance/okrs', protect, (req, res) => {
  res.json(mockStore.okrs);
});

app.post('/api/performance/okrs', protect, (req, res) => {
  const { objective, category, keyResults, quarter } = req.body;
  const newOkr = {
    id: 'okr-' + Date.now(),
    employeeName: req.user?.name || 'Employee',
    quarter: quarter || 'Q3 2026',
    objective,
    category: category || 'Engineering',
    progress: 0,
    status: 'on_track',
    keyResults: keyResults || [],
  };
  mockStore.okrs.unshift(newOkr);
  res.status(201).json({ message: 'OKR objective created successfully', okr: newOkr });
});

app.get('/api/performance/kudos', protect, (req, res) => {
  res.json(mockStore.kudos);
});

app.post('/api/performance/kudos', protect, (req, res) => {
  const { toUser, badge, message } = req.body;
  const newKudos = {
    id: 'kudos-' + Date.now(),
    fromUser: req.user?.name || 'Priya Sharma',
    toUser: toUser || 'Colleague',
    badge: badge || 'Team Player',
    message,
    claps: 1,
    createdAt: new Date().toISOString(),
  };
  mockStore.kudos.unshift(newKudos);
  res.status(201).json({ message: 'Kudos posted to company wall!', kudos: newKudos });
});

app.post('/api/performance/kudos/:id/clap', protect, (req, res) => {
  const item = mockStore.kudos.find((k) => k.id === req.params.id);
  if (item) {
    item.claps = (item.claps || 0) + 1;
  }
  res.json({ message: 'Clapped!', claps: item?.claps || 1 });
});

// ---------------- RECRUITMENT & ATS KANBAN ----------------

app.get('/api/recruitment/jobs', protect, (req, res) => {
  res.json(mockStore.jobs);
});

app.post('/api/recruitment/jobs', protect, requireRole('hr_manager', 'admin'), (req, res) => {
  const newJob = {
    id: 'job-' + Date.now(),
    ...req.body,
    applicantCount: 0,
    status: 'open',
  };
  mockStore.jobs.unshift(newJob);
  res.status(201).json({ message: 'Job opening posted', job: newJob });
});

app.get('/api/recruitment/candidates', protect, (req, res) => {
  res.json(mockStore.candidates);
});

app.patch('/api/recruitment/candidates/:id/stage', protect, requireRole('hr_manager', 'admin'), (req, res) => {
  const { stage } = req.body;
  const candidate = mockStore.candidates.find((c) => c.id === req.params.id);
  if (candidate) {
    candidate.stage = stage;
  }
  res.json({ message: `Candidate stage updated to ${stage}`, candidate });
});

app.post('/api/recruitment/candidates', protect, (req, res) => {
  const newCandidate = {
    id: 'cand-' + Date.now(),
    ...req.body,
    stage: 'applied',
    rating: 4,
    appliedDate: new Date().toISOString().split('T')[0],
  };
  mockStore.candidates.unshift(newCandidate);
  res.status(201).json({ message: 'Candidate added to ATS pipeline', candidate: newCandidate });
});

// ---------------- ENTERPRISE HELPDESK TICKETS ----------------

app.get('/api/helpdesk/tickets', protect, (req, res) => {
  res.json(mockStore.tickets);
});

app.post('/api/helpdesk/tickets', protect, (req, res) => {
  const { title, category, priority, description } = req.body;
  const num = 'TCK-' + (1080 + mockStore.tickets.length + 1);
  const newTicket = {
    id: num,
    ticketNumber: num,
    title,
    category: category || 'IT Support',
    priority: priority || 'medium',
    status: 'open',
    raisedBy: req.user?.name || 'Employee',
    assignedTo: 'Support Desk',
    createdAt: new Date().toISOString(),
    replies: [
      { author: req.user?.name || 'Employee', authorRole: req.user?.role || 'employee', message: description, createdAt: new Date().toISOString() },
    ],
  };
  mockStore.tickets.unshift(newTicket);
  res.status(201).json({ message: 'Support ticket raised successfully', ticket: newTicket });
});

app.post('/api/helpdesk/tickets/:id/reply', protect, (req, res) => {
  const { message } = req.body;
  const ticket = mockStore.tickets.find((t) => t.id === req.params.id);
  if (ticket) {
    ticket.replies.push({
      author: req.user?.name || 'Support Agent',
      authorRole: req.user?.role || 'admin',
      message,
      createdAt: new Date().toISOString(),
    });
  }
  res.json({ message: 'Reply posted', ticket });
});

app.patch('/api/helpdesk/tickets/:id/status', protect, (req, res) => {
  const { status } = req.body;
  const ticket = mockStore.tickets.find((t) => t.id === req.params.id);
  if (ticket) {
    ticket.status = status;
  }
  res.json({ message: 'Status updated', ticket });
});

// ---------------- ASSET MANAGEMENT ----------------

app.get('/api/assets', protect, (req, res) => {
  res.json(mockStore.assets);
});

app.post('/api/assets', protect, requireRole('hr_manager', 'admin'), (req, res) => {
  const newAsset = {
    id: 'AST-' + (400 + mockStore.assets.length + 1),
    assetTag: 'AST-' + (400 + mockStore.assets.length + 1),
    ...req.body,
  };
  mockStore.assets.unshift(newAsset);
  res.status(201).json({ message: 'Asset cataloged successfully', asset: newAsset });
});

app.patch('/api/assets/:id/assign', protect, requireRole('hr_manager', 'admin'), (req, res) => {
  const { assignedTo } = req.body;
  const asset = mockStore.assets.find((a) => a.id === req.params.id);
  if (asset) {
    asset.assignedTo = assignedTo;
    asset.status = assignedTo ? 'allocated' : 'available';
  }
  res.json({ message: 'Asset assignment updated', asset });
});

// ---------------- COMPANY POLICIES & KNOWLEDGE BASE ----------------

app.get('/api/policies', protect, (req, res) => {
  res.json(mockStore.policies);
});

// ---------------- DEPARTMENTS, LEAVES, DOCUMENTS & ANNOUNCEMENTS ----------------

app.get('/api/departments', protect, async (req, res) => {
  try {
    if (isDbConnected) {
      const departments = await Department.find();
      if (departments && departments.length > 0) return res.json(departments);
    }
    res.json([
      { _id: 'd-1', name: 'Engineering', code: 'ENG', headcount: 22 },
      { _id: 'd-2', name: 'Human Resources', code: 'HR', headcount: 6 },
      { _id: 'd-3', name: 'Product & Design', code: 'PROD', headcount: 8 },
      { _id: 'd-4', name: 'Finance & Legal', code: 'FIN', headcount: 5 },
      { _id: 'd-5', name: 'Sales & Growth', code: 'SALES', headcount: 7 },
    ]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Leaves
app.post('/api/leaves', protect, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    if (isDbConnected) {
      const leave = await Leave.create({
        employee: req.user.id,
        leaveType,
        startDate,
        endDate,
        reason,
      });
      return res.status(201).json({ message: 'Leave request submitted', leave });
    }
    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave: {
        _id: 'lv-' + Date.now(),
        leaveType,
        startDate,
        endDate,
        reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/leaves/my', protect, async (req, res) => {
  try {
    if (isDbConnected) {
      const leaves = await Leave.find({ employee: req.user.id }).sort({ createdAt: -1 });
      if (leaves && leaves.length > 0) return res.json(leaves);
    }
    res.json([
      { _id: 'lv-1', leaveType: 'casual', startDate: '2026-08-20', endDate: '2026-08-22', reason: 'Family vacation trip', status: 'approved', createdAt: '2026-08-01' },
      { _id: 'lv-2', leaveType: 'sick', startDate: '2026-07-14', endDate: '2026-07-15', reason: 'Flu recovery', status: 'approved', createdAt: '2026-07-14' },
      { _id: 'lv-3', leaveType: 'earned', startDate: '2026-09-10', endDate: '2026-09-14', reason: 'Personal travel', status: 'pending', createdAt: '2026-08-11' },
    ]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/leaves/pending', protect, requireRole('hr_manager', 'admin'), async (req, res) => {
  try {
    if (isDbConnected) {
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
      if (leaves && leaves.length > 0) return res.json(leaves);
    }
    res.json([
      { _id: 'lv-p1', leaveType: 'earned', startDate: '2026-08-24', endDate: '2026-08-28', reason: 'Annual summer family trip to Colorado', status: 'pending', createdAt: '2026-08-11', employeeInfo: { name: 'Sarah Jenkins', email: 'sarah.j@company.com' } },
      { _id: 'lv-p2', leaveType: 'casual', startDate: '2026-08-18', endDate: '2026-08-19', reason: 'Attending sibling graduation ceremony', status: 'pending', createdAt: '2026-08-10', employeeInfo: { name: 'Carlos Rodriguez', email: 'carlos.r@company.com' } },
      { _id: 'lv-p3', leaveType: 'sick', startDate: '2026-08-14', endDate: '2026-08-15', reason: 'Scheduled dental procedure', status: 'pending', createdAt: '2026-08-12', employeeInfo: { name: 'Emily Zhang', email: 'emily.z@company.com' } },
    ]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.patch('/api/leaves/:id', protect, requireRole('hr_manager', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (isDbConnected) {
      const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (leave) return res.json({ message: `Leave ${status}`, leave });
    }
    res.json({ message: `Leave ${status} successfully!`, leave: { _id: req.params.id, status } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Documents
app.post('/api/documents', protect, documentUpload.single('file'), async (req, res) => {
  try {
    const { name, category } = req.body;
    const fileName = req.file ? req.file.originalname : (name || 'Document_' + Date.now() + '.pdf');
    res.status(201).json({
      message: 'Document uploaded successfully to Enterprise Vault',
      document: {
        _id: 'doc-' + Date.now(),
        name: name || fileName,
        category: category || 'Tax & Compensation',
        fileName,
        fileSize: req.file ? req.file.size : 142000,
        createdAt: new Date().toISOString(),
        uploadedBy: req.user?.name || 'Sarah Jenkins',
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/documents/my', protect, async (req, res) => {
  res.json([
    { _id: 'doc-1', name: 'Form W-4 Withholding Certificate 2026', category: 'Tax & Compensation', fileName: 'W4_Jenkins_2026.pdf', fileSize: 184000, createdAt: '2026-01-15' },
    { _id: 'doc-2', name: 'Signed Employment Agreement & IP Assignment', category: 'Legal & Contracts', fileName: 'Employment_Agreement_Signed.pdf', fileSize: 420000, createdAt: '2025-08-01' },
    { _id: 'doc-3', name: 'Medical Insurance Policy & Health Card', category: 'Benefits & Insurance', fileName: 'PPO_Medical_Card_2026.pdf', fileSize: 310000, createdAt: '2026-02-10' },
    { _id: 'doc-4', name: 'AWS Certified Solutions Architect Certificate', category: 'Certifications', fileName: 'AWS_Architect_Certificate.pdf', fileSize: 550000, createdAt: '2026-05-20' },
  ]);
});

app.get('/api/documents', protect, requireRole('hr_manager', 'admin'), async (req, res) => {
  res.json([
    { _id: 'doc-1', name: 'Form W-4 Withholding Certificate 2026', category: 'Tax & Compensation', fileName: 'W4_Jenkins_2026.pdf', fileSize: 184000, createdAt: '2026-01-15', employee: { name: 'Sarah Jenkins', email: 'sarah.j@company.com' } },
    { _id: 'doc-2', name: 'Non-Disclosure Agreement (NDA)', category: 'Legal & Contracts', fileName: 'Marcus_NDA_2026.pdf', fileSize: 220000, createdAt: '2026-03-12', employee: { name: 'Marcus Vance', email: 'marcus.v@company.com' } },
    { _id: 'doc-3', name: 'Direct Deposit Bank Authorization', category: 'Banking', fileName: 'Direct_Deposit_Aisha.pdf', fileSize: 160000, createdAt: '2026-04-05', employee: { name: 'Aisha Patel', email: 'aisha.p@company.com' } },
    { _id: 'doc-4', name: '401(k) Beneficiary Designation Form', category: 'Benefits & Insurance', fileName: '401k_Beneficiary_Miller.pdf', fileSize: 195000, createdAt: '2026-06-18', employee: { name: 'David Miller', email: 'david.m@company.com' } },
  ]);
});

// Announcements
app.get('/api/announcements', protect, async (req, res) => {
  res.json([
    { _id: 'ann-1', title: '🚀 Annual Tech Summit & Hackathon 2026 Announced!', message: 'Join us for 48 hours of innovation, prizes, and team bonding on September 18-19. Registration is now open across all departments!', postedBy: { name: 'Priya Sharma' }, createdAt: '2026-08-11T09:00:00Z', priority: 'high' },
    { _id: 'ann-2', title: '🏆 Q2 Top Innovator Kudos Recognition Celebrations', message: 'Congratulations to our engineering and design teams for achieving 99.99% uptime and delivering the new HRMS Dashboard suite!', postedBy: { name: 'Priya Sharma' }, createdAt: '2026-08-08T14:30:00Z', priority: 'normal' },
    { _id: 'ann-3', title: '🌴 Labor Day Long Weekend Office Schedule', message: 'Corporate offices will remain closed on the upcoming holiday Monday. Enjoy your well-deserved break with friends and family!', postedBy: { name: 'HR Operations' }, createdAt: '2026-08-05T11:15:00Z', priority: 'normal' },
  ]);
});

app.post('/api/announcements', protect, requireRole('hr_manager', 'admin'), async (req, res) => {
  const { title, message } = req.body;
  res.status(201).json({
    message: 'Announcement broadcasted to all company employees',
    announcement: {
      _id: 'ann-' + Date.now(),
      title,
      message,
      postedBy: { name: req.user?.name || 'HR Manager' },
      createdAt: new Date().toISOString(),
    },
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Enterprise HRMS Server running on port ${PORT}`));
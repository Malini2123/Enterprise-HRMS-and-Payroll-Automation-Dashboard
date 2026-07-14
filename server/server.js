const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

const User = require('./models/User');

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/api/employees', async (req, res) => {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
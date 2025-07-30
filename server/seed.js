const mongoose = require('mongoose');
const Department = require('./models/Department');
const Designation = require('./models/Designation');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initial departments data
const initialDepartments = [
  {
    departmentId: 'DEPT001',
    departmentName: 'Engineering',
    description: 'Software development and technical operations',
    status: 'active'
  },
  {
    departmentId: 'DEPT002',
    departmentName: 'Human Resources',
    description: 'HR management and employee relations',
    status: 'active'
  },
  {
    departmentId: 'DEPT003',
    departmentName: 'Sales',
    description: 'Sales and business development',
    status: 'active'
  },
  {
    departmentId: 'DEPT004',
    departmentName: 'Marketing',
    description: 'Marketing and brand management',
    status: 'active'
  },
  {
    departmentId: 'DEPT005',
    departmentName: 'Finance',
    description: 'Financial management and accounting',
    status: 'active'
  }
];

// Initial designations data
const initialDesignations = [
  {
    designationId: 'DES001',
    designationName: 'Software Engineer',
    departmentId: 'DEPT001',
    level: 'L1',
    description: 'Develop and maintain software applications',
    status: 'active'
  },
  {
    designationId: 'DES002',
    designationName: 'Senior Software Engineer',
    departmentId: 'DEPT001',
    level: 'L2',
    description: 'Lead development projects and mentor junior developers',
    status: 'active'
  },
  {
    designationId: 'DES003',
    designationName: 'Tech Lead',
    departmentId: 'DEPT001',
    level: 'L3',
    description: 'Lead technical architecture and team direction',
    status: 'active'
  },
  {
    designationId: 'DES004',
    designationName: 'HR Manager',
    departmentId: 'DEPT002',
    level: 'Manager',
    description: 'Manage HR operations and employee relations',
    status: 'active'
  },
  {
    designationId: 'DES005',
    designationName: 'HR Executive',
    departmentId: 'DEPT002',
    level: 'L1',
    description: 'Support HR operations and recruitment',
    status: 'active'
  },
  {
    designationId: 'DES006',
    designationName: 'Sales Executive',
    departmentId: 'DEPT003',
    level: 'L1',
    description: 'Generate sales and maintain client relationships',
    status: 'active'
  },
  {
    designationId: 'DES007',
    designationName: 'Sales Manager',
    departmentId: 'DEPT003',
    level: 'Manager',
    description: 'Lead sales team and strategy',
    status: 'active'
  },
  {
    designationId: 'DES008',
    designationName: 'Marketing Specialist',
    departmentId: 'DEPT004',
    level: 'L1',
    description: 'Execute marketing campaigns and strategies',
    status: 'active'
  },
  {
    designationId: 'DES009',
    designationName: 'Marketing Manager',
    departmentId: 'DEPT004',
    level: 'Manager',
    description: 'Lead marketing strategy and campaigns',
    status: 'active'
  },
  {
    designationId: 'DES010',
    designationName: 'Financial Analyst',
    departmentId: 'DEPT005',
    level: 'L1',
    description: 'Analyze financial data and prepare reports',
    status: 'active'
  }
];

async function seedDatabase() {
  try {
    // Clear existing data
    await Department.deleteMany({});
    await Designation.deleteMany({});
    console.log('Cleared existing data');

    // Insert departments
    const departments = await Department.insertMany(initialDepartments);
    console.log(`Inserted ${departments.length} departments`);

    // Insert designations
    const designations = await Designation.insertMany(initialDesignations);
    console.log(`Inserted ${designations.length} designations`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require('../models/Company');
const Department = require('../models/Department');
const Designation = require('../models/Designation');

const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');

// POST /register
router.post("/register", async (req, res) => {
  const { email, password, fullName, role, ...rest } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email, password: hashedPassword, fullName, role: role || "employee",
      status: "pending",
      ...rest
    });

    await newUser.save();

    res.status(201).json({ message: "Registration submitted for HR approval" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.status !== "approved") {
      return res.status(403).json({ message: "Account not yet approved by HR" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// GET /pending
router.get("/pending", verifyToken, checkRole("hr"), async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' });
    res.json(pendingUsers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /companies
router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.find({}, 'registrationNumber name address city district country');
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /employees - Get all employees for Employee Master
router.get("/employees", verifyToken, checkRole("hr"), async (req, res) => {
  try {
    const employees = await User.find({}).select("-password");
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /employee/:id - Update employee data
router.put("/employee/:id", verifyToken, checkRole("hr"), async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedEmployee = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(updatedEmployee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /user/:id/status
router.patch("/user/:id/status", verifyToken, checkRole("hr"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    await User.findByIdAndUpdate(id, { status });
    res.json({ message: `User status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /me
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== DEPARTMENT ENDPOINTS ====================

// GET /departments - Get all departments
router.get("/departments", verifyToken, async (req, res) => {
  try {
    const departments = await Department.find().sort({ departmentId: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /departments - Create new department
router.post("/departments", verifyToken, checkRole("hr"), async (req, res) => {
  const { departmentId, departmentName, description, status } = req.body;

  try {
    // Check if department ID already exists
    const existingDept = await Department.findOne({ departmentId });
    if (existingDept) {
      return res.status(400).json({ message: "Department ID already exists" });
    }

    const newDepartment = new Department({
      departmentId,
      departmentName,
      description,
      status: status || 'active'
    });

    await newDepartment.save();
    res.status(201).json(newDepartment);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /departments/:id - Update department
router.put("/departments/:id", verifyToken, checkRole("hr"), async (req, res) => {
  const { id } = req.params;
  const { departmentName, description, status } = req.body;

  try {
    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      { departmentName, description, status, updatedOn: new Date() },
      { new: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json(updatedDepartment);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /departments/:id - Delete department
router.delete("/departments/:id", verifyToken, checkRole("hr"), async (req, res) => {
  const { id } = req.params;

  try {
    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /departments/:id/status - Toggle department status
router.patch("/departments/:id/status", verifyToken, checkRole("hr"), async (req, res) => {
  const { id } = req.params;

  try {
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    department.status = department.status === 'active' ? 'inactive' : 'active';
    department.updatedOn = new Date();
    await department.save();

    res.json(department);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== DESIGNATION ENDPOINTS ====================

// GET /designations - Get all designations
router.get("/designations", verifyToken, async (req, res) => {
  try {
    const designations = await Designation.find().sort({ designationId: 1 });
    res.json(designations);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /designations - Create new designation
router.post("/designations", verifyToken, checkRole("hr"), async (req, res) => {
  const { designationId, designationName, departmentId, level, description, status } = req.body;

  try {
    // Check if designation ID already exists
    const existingDesig = await Designation.findOne({ designationId });
    if (existingDesig) {
      return res.status(400).json({ message: "Designation ID already exists" });
    }

    // Verify department exists
    const department = await Department.findOne({ departmentId });
    if (!department) {
      return res.status(400).json({ message: "Department not found" });
    }

    const newDesignation = new Designation({
      designationId,
      designationName,
      departmentId,
      level,
      description,
      status: status || 'active'
    });

    await newDesignation.save();
    res.status(201).json(newDesignation);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /designations/:id - Update designation
router.put("/designations/:id", verifyToken, checkRole("hr"), async (req, res) => {
  const { id } = req.params;
  const { designationName, departmentId, level, description, status } = req.body;

  try {
    // Verify department exists if departmentId is being updated
    if (departmentId) {
      const department = await Department.findOne({ departmentId });
      if (!department) {
        return res.status(400).json({ message: "Department not found" });
      }
    }

    const updatedDesignation = await Designation.findByIdAndUpdate(
      id,
      { designationName, departmentId, level, description, status, updatedOn: new Date() },
      { new: true }
    );

    if (!updatedDesignation) {
      return res.status(404).json({ message: "Designation not found" });
    }

    res.json(updatedDesignation);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /designations/:id - Delete designation
router.delete("/designations/:id", verifyToken, checkRole("hr"), async (req, res) => {
  const { id } = req.params;

  try {
    const designation = await Designation.findByIdAndDelete(id);
    if (!designation) {
      return res.status(404).json({ message: "Designation not found" });
    }

    res.json({ message: "Designation deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /designations/:id/status - Toggle designation status
router.patch("/designations/:id/status", verifyToken, checkRole("hr"), async (req, res) => {
  const { id } = req.params;

  try {
    const designation = await Designation.findById(id);
    if (!designation) {
      return res.status(404).json({ message: "Designation not found" });
    }

    designation.status = designation.status === 'active' ? 'inactive' : 'active';
    designation.updatedOn = new Date();
    await designation.save();

    res.json(designation);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

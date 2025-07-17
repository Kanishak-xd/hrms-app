const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// POST /api/register
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


// GET /pending-users
router.get("/pending-users", verifyToken, checkRole("hr"), async (req, res) => {
  try {
    const users = await User.find({ status: "pending" });
    res.json(users);
  } catch (err) {
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

module.exports = router;

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { verifyToken, checkRole } = require("./middleware/auth");

dotenv.config({ path: './.env' });
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", require("./routes/authRoutes"));

app.get("/api/protected", verifyToken, (req, res) => {
    res.json({ message: "Access granted", user: req.user });
});
  
app.get("/api/admin-only", verifyToken, checkRole("admin"), (req, res) => {
    res.json({ message: "Hello Admin!", user: req.user });
});

const PORT = process.env.PORT;
app.listen(PORT, ()=> {console.log(`backend running @${PORT}`)});
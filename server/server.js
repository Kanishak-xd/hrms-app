const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", require("./routes/authRoutes"));

const PORT = process.env.PORT;
app.listen(PORT, ()=> {console.log(`backend running @${PORT}`)});
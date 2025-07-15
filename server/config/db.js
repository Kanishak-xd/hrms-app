const mongoose = require("mongoose");

const connectDB = async()=> {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected MongoDB Atlas successfully");
    } catch (err) {
        console.log("Failed to connect MongoDB", err.message);
        process.exit(1);
    };
};

module.exports = connectDB;
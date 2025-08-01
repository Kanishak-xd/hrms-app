const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    console.log('Authorization header:', req.headers["authorization"]);

    if (!token) return res.status(401).json({message: "Access denied. No token"});

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        res.status(400).json({message: "Invalid token"});
    };
};

const checkRole = (...roles) => (req, res, next) => {
    console.log('Checking role. User role:', req.user.role, 'Required roles:', roles);
    if (!roles.includes(req.user.role)) {
        console.log('Access denied. User role:', req.user.role, 'Required roles:', roles);
        return res.status(403).json({message: "Access denied. No role"});
    }
    next();
};

module.exports = { verifyToken, checkRole };
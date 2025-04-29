// Middleware for authentication and role-based access control
const jwt = require("jsonwebtoken");

const authenticationUtil = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Please login to verify yourself", error: error });
  }
};

module.exports = authenticationUtil;

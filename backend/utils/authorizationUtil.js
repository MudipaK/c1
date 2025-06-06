const authorizationUtil = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Access forbidden" });
  }
  next();
};

module.exports = authorizationUtil;

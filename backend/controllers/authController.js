const { User } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      throw Error("Username, email and password are required");
    }
    if (!validator.isAlphanumeric(username)) {
      throw Error("Username can only contain letters and numbers");
    }
    if (!validator.isEmail(email)) {
      throw Error("Please provide a valid email");
    }
    if (!validator.isStrongPassword(password)) {
      throw Error("Please provide a strong password");
    }
  

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword,role});
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    switch (error.code) {
      case 11000:
        res.status(500).json({
          message: "Email provided already has an account.",
          error: error,
        });
        break;
      default:
        res.status(500).json({ message: error.message, error: error });
    }
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validator.isEmail(email)) {
      throw Error("Please provide a valid email");
    }
    if (!validator.isStrongPassword(password)) {
      throw Error("Please provide a valid password");
    }

    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw Error("Invalid Credentials");
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error });
  }
};

const changeRole = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      throw Error("Please provide an email and a role");
    }
    if (!validator.isEmail(email)) {
      throw Error("Please provide a valid email");
    }
    if (role != "user" && role != "staff admin" && role != "staff advisor" && role != "organizer") {
      throw Error("Please provide a valid role");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw Error("Provided email does not have an account");
    }

    if (user.role == role) {
      throw Error("Role cannot be changed to the current role");
    }
    await User.updateOne({ email }, { role });

    res.json({ message: "Role changed" });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error });
  }
};

const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      throw Error(
        "Please provide an email, previous password and the new password"
      );
    }
    if (!validator.isEmail(email)) {
      throw Error("Please provide a valid email");
    }
    if (oldPassword == newPassword) {
      throw Error("Nw password cannot be same as old password");
    }
    if (
      !validator.isStrongPassword(oldPassword) ||
      !validator.isStrongPassword(newPassword)
    ) {
      throw Error("Please provide a valid passwords");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw Error("Provided email does not have an account");
    }
    if (!bcrypt.compareSync(oldPassword, user.password)) {
      throw Error("Previous password provided is invalid");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne(
      { email },
      {
        password: hashedPassword,
      }
    );

    res.json({ message: "Password changed" });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      throw Error("Invalid Request");
    }

    const userDetails = await User.findById(user.id);

    res.json({
      username: userDetails.username,
      email: userDetails.email,
      role: userDetails.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, error: error });
  }
};

module.exports = {
  login,
  register,
  changeRole,
  changePassword,
  getUserDetails,
};

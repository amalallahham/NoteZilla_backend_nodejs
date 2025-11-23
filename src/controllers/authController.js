const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiResponse = require("../utils/response");

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json(ApiResponse.error("Missing required fields", 400));
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res
        .status(409)
        .json(ApiResponse.error("Email already registered", 409));
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      role: role || "user",
    });

    const user = await User.findById(result.lastID);

    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json(
      ApiResponse.success(
        data = {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
       "Registration successful",
      )
    );
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(ApiResponse.error("Email and password are required", 400));
    }
    const user = await User.findByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json(ApiResponse.error("Invalid credentials", 401));
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res
        .status(401)
        .json(ApiResponse.error("Invalid credentials", 401));
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json(
      ApiResponse.success(
        data = {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      "Login successful",
      )
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
};

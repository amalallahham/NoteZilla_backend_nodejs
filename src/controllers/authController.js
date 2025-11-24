// Authentication controller for user registration and login
// AI Assistant: Authentication logic and validation generated with assistance from GitHub Copilot

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiResponse = require("../utils/response");
const messages = require("../lang/messages");

const JWT_SECRET = process.env.JWT_SECRET;

// Email validation regex - RFC 5322 compliant
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const validateEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json(ApiResponse.error(messages.auth.missingFields, 400));
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json(ApiResponse.error(messages.auth.invalidEmail, 400));
    }

    // Validate password length
    if (password.length < 6) {
      return res
        .status(400)
        .json(ApiResponse.error(messages.auth.passwordTooShort, 400));
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res
        .status(409)
        .json(ApiResponse.error(messages.auth.emailExists, 409));
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

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
        messages.auth.registrationSuccess,
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
        .json(ApiResponse.error(messages.auth.emailPasswordRequired, 400));
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json(ApiResponse.error(messages.auth.invalidEmail, 400));
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json(ApiResponse.error(messages.auth.invalidCredentials, 401));
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res
        .status(401)
        .json(ApiResponse.error(messages.auth.invalidCredentials, 401));
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
        messages.auth.loginSuccess,
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

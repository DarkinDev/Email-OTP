const User = require("../models/user.model");
const Credentials = require("../models/credentials.model");
const Token = require("../models/token.model");
const sendMsg = require("../utilities/sendEmail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

const otpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);

// Signup function
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Email already used?
    const existingCredentials = await Credentials.findOne({ email });
    if (existingCredentials) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Create hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create credentials
    const credentials = await Credentials.create({
      email,
      password: hashedPassword,
    });

    // Generate OTP
    const code = generateOTP();
    const expires = otpExpiry();

    // Create user with OTP
    const user = await User.create({
      name,
      credentials_id: credentials._id,
      verificationCode: code,
      verificationExpires: expires,
    });

    // Send OTP email
    await sendMsg({
      to: email,
      subject: "Verify your email",
      text: `Your verification code is: ${code}`,
      OTP: code,
    });

    res
      .status(201)
      .json({ message: "Signup successful. Please verify your email." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login function
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const credentials = await Credentials.findOne({ email });
    if (!credentials) {
      return res.status(404).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, credentials.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = await User.findOne({ credentials_id: credentials._id });
    if (!user || !user.isVerified) {
      return res.status(403).json({ message: "Email not verified." });
    }

    // Generate tokens
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "15m",
      }
    );

    // Store refresh token
    const tokenDoc = await Token.create({ refreshToken });

    // Update user's token_id reference
    user.token_id = tokenDoc._id;
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify email function
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const credentials = await Credentials.findOne({ email });
    if (!credentials) {
      return res.status(404).json({ message: "Email not found." });
    }

    const user = await User.findOne({ credentials_id: credentials._id });
    if (!user || user.isVerified) {
      return res
        .status(400)
        .json({ message: "Already verified or user not found." });
    }

    if (
      user.verificationCode !== Number(code) ||
      user.verificationExpires < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Resend OTP function
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const credentials = await Credentials.findOne({ email });
    if (!credentials) {
      return res.status(404).json({ message: "Email not found." });
    }

    const user = await User.findOne({ credentials_id: credentials._id });
    if (!user || user.isVerified) {
      return res
        .status(400)
        .json({ message: "User not found or already verified." });
    }

    const code = generateOTP();
    const expires = otpExpiry();

    user.verificationCode = code;
    user.verificationExpires = expires;
    await user.save();

    await sendMsg({
      to: email,
      subject: "Your new OTP code",
      text: `Your new OTP is: ${code}`,
      OTP: code,
    });

    res.json({ message: "OTP resent to your email." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout function
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required." });
    }

    const tokenDoc = await Token.findOneAndDelete({ refreshToken });
    if (!tokenDoc) {
      return res.status(404).json({ message: "Invalid refresh token." });
    }

    res.json({ message: "Logged out successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

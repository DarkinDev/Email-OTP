const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  credentials_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Credentials",
    required: true,
  },
  token_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Token",
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: Number,
  },
  verificationExpires: {
    type: Date,
  },
});

module.exports = mongoose.model("User", userSchema);

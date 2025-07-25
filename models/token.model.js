const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  refreshToken: { type: String },
});

module.exports = mongoose.model("Token", tokenSchema);

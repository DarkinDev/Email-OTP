const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/verify", authController.verifyEmail);
router.post("/resend", authController.resendOTP);
router.post("/logout", authController.logout);

module.exports = router;

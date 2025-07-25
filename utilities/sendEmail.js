const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMsg = async ({ to, from, subject, text, OTP }) => {
  const message = {
    to,
    from: { email: process.env.EMAIL_USER, name: "OTP Verification" },
    subject,
    text: `Your OTP is ${OTP}`,
    html: `<h2>Your OTP is: <strong>${OTP}</strong></h2>`,
  };

  try {
    await sgMail.send(message);
  } catch (error) {
    console.error("SendGrid Error:", error.response?.body || error.message);
    throw error;
  }
};

module.exports = sendMsg;

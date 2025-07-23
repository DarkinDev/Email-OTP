require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMsg = ({ to, from, subject, text, OTP }) => {
  const message = { to, from, subject, text, html: `<p>${OTP}</p>` };
  return sgMail.send(message);
};

module.exports = sendMsg;

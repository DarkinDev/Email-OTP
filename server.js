const express = require("express");
const app = express();
const cors = require("cors");
const sendEmail = require("./utilities/sendEmail");
const bodyParser = require("body-parser");
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const OTP =
    Date.now().toString(36) + Math.random().toString(36).substring(13);
  try {
    await sendEmail({ ...req.body, OTP });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./databases/mongo.database");
const bodyParser = require("body-parser");
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};
const authRoutes = require("./routes/auth.route");

db();

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

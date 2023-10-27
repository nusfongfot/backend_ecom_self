const express = require("express");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 3000;
const host = "0.0.0.0";
require("dotenv").config();

const authRoute = require("./routes/authRoute");
const commentRoute = require("./routes/commentRoute");
const uploadRoute = require("./routes/uploadRoute");
const profileRoute = require("./routes/profileRoute");
const productRoute = require("./routes/productRoute");
const addressRoute = require("./routes/addressRoute");
const orderRoute = require("./routes/orderRoute");
const adminRoute = require("./routes/adminRoute");

const authenticate = require("./middleware/authenticate");

// Allow,Parser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRoute);
app.use("/api/v1", commentRoute);
app.use("/api/v1", addressRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1", productRoute);
app.use("/api/v1", authenticate, uploadRoute);
app.use("/api/v1", authenticate, profileRoute);

app.listen(PORT, host, () => {
  console.log(`Listening on ${PORT}`);
});

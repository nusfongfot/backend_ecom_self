const jwt = require("jsonwebtoken");
const client = require("../connect_db");

module.exports = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer")) {
      return res.status(401).json({ message: "unauthenticated" });
    }
    const token = authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "unauthenticated" });
    }

    const privateKey = process.env.JSONWEB_SECRET;
    const payload = jwt.verify(token, privateKey);
    //find user
    const userId = payload.userId;
    client.query(
      `SELECT email,role FROM customers WHERE email = ?`,
      [userId.email],
      function (err, results, fields) {
        if (results?.length == 0) {
          return res.status(401).json({ message: "unauthenticated" });
        }
      }
    );
    next();
  } catch (error) {
    next(error);
    console.log(error);
  }
};

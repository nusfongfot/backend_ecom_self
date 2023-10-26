const jwt = require("jsonwebtoken");
const client = require("../connect_db");
const bcrypt = require("bcrypt");

const genToken = (payload) => {
  const privateKey = process.env.JSONWEB_SECRET;
  const options = { expiresIn: "1d" };
  const token = jwt.sign(payload, privateKey, options);
  return token;
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (username.trim() === "" || password.trim() === "") {
      return res
        .status(400)
        .send({ message: "username or password is required" });
    }

    client.query(
      `SELECT username,password FROM admin WHERE username = ?`,
      [username],
      async function (err, results, fields) {
        const findUsername = results.length > 0;
        if (!findUsername) {
          return res
            .status(404)
            .json({ message: "username or password is not correct" });
        }
        const hashedPassword = results[0].password;
        const isCorrect = await bcrypt.compare(password, hashedPassword);
        if (!isCorrect) {
          return res
            .status(401)
            .json({ message: "username or password is not correct" });
        }
        const admin = results[0];
        const paylod = { userId: admin };
        const token = genToken(paylod);

        client.query(
          `SELECT admin_id,username,role FROM admin WHERE username = ?`,
          [username],
          function (err, results, fields) {
            const admin = results[0];
            return res
              .status(200)
              .json({ message: "Login successfully", token, admin });
          }
        );
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { username, password, confirmPassword } = req.body;
    if (password.trim() === "") {
      return res.status(400).send({
        message: "password is required",
      });
    }
    if (confirmPassword.trim() === "") {
      return res.status(400).send({
        message: "confirmPassword is required",
      });
    }
    if (username.trim() === "") {
      return res.status(400).send({
        message: "username is required",
      });
    }
    if (password.trim() != confirmPassword.trim()) {
      return res.status(400).send({ message: "password don't match" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    client.query(
      `SELECT username FROM admin WHERE username = ?`,
      [username],
      function (err, results, fields) {
        const findUsername = results.filter(
          (item) => item.username == username
        );
        if (findUsername.length > 0) {
          return res
            .status(400)
            .json({ message: "This username already exists" });
        } else {
          client.query(
            `INSERT INTO admin (username, password) VALUES (?,?)`,
            [username, hashedPassword],
            function (err, results, fields) {
              return res
                .status(200)
                .json({ message: "Create admin Successfully" });
            }
          );
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.deleteAdminById = async (req, res, next) => {
  try {
    const id = req.params.id;
    client.query(
      "SELECT admin_id FROM admin WHERE admin_id = ?",
      [id],
      function (err, results, fields) {
        if (results.length > 0) {
          client.query(
            "UPDATE admin SET deleted = 1 WHERE admin_id = ?",
            [id],
            function (err, results, fields) {
              return res.status(200).json({ message: "Delete successfully" });
            }
          );
        } else {
          return res.status(400).json({ message: "admin not found" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.getAllAdmins = async (req, res, next) => {
  try {
    client.query(
      "SELECT admin_id, username FROM admin WHERE deleted = 0",
      function (err, results, fields) {
        const total = results.length;
        return res
          .status(200)
          .json({ message: "successfully", total, results });
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

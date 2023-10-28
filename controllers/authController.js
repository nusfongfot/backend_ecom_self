const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const client = require("../connect_db");

const genToken = (payload) => {
  const privateKey = process.env.JSONWEB_SECRET;
  const options = { expiresIn: "1d" };
  const token = jwt.sign(payload, privateKey, options);
  return token;
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const isEmail = validator.isEmail(email);

    if (email.trim() === "" || password.trim() === "") {
      return res.status(400).send({ message: "email or password is required" });
    }
    if (!isEmail) {
      return res.status(400).send({ message: "Invalid email address" });
    }

    client.query(
      `SELECT email,password FROM customers WHERE email = ?`,
      [email],
      async function (err, results, fields) {
        const findEmail = results?.length > 0;
        if (!findEmail) {
          return res
            .status(404)
            .send({ message: "email or password is not correct" });
        }
        const hashedPassword = results[0]?.password;
        const isCorrect = await bcrypt.compare(password, hashedPassword);
        if (!isCorrect) {
          return res
            .send({
              res_code: "1500",
              message: "Email or password is not correct",
            });
        }
        const user = results[0];
        const paylod = { userId: user };
        const token = genToken(paylod);

        client.query(
          `SELECT cus_id,name,surname,phone,email,username,photo_user FROM customers WHERE email = ?`,
          [email],
          function (err, results, fields) {
            const user = results[0];
            return res.status(200).send({
              res_code: "0000",
              message: "Login successfully",
              token,
              user,
            });
          }
        );
      }
    );
  } catch (error) {
    next(error);
    res.send({ message: error.message})
  }
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, confirmPassword, username } = req.body;
    if (!email.trim()) {
      return res.status(400).send({
        message: "email is required",
      });
    }

    if (!password.trim()) {
      return res.status(400).send({
        message: "password is required",
      });
    }
    if (!username.trim()) {
      return res.status(400).send({
        message: "username is required",
      });
    }

    if (password.trim() != confirmPassword.trim()) {
      return res.status(400).send({ message: "password don't match" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    client.query(
      `SELECT email, username FROM customers WHERE email = ? OR username = ?`,
      [email, username],
      function (err, results, fields) {
        const findEmail = results?.filter((item) => item.email == email);
        if (findEmail?.length > 0) {
          return res
            .status(400)
            .send({ message: "This email or username already exists" });
        } else {
          client.query(
            `INSERT INTO customers (username,email, password) VALUES (?,?,?)`,
            [username, email, hashedPassword],
            function (err, results, fields) {
              console.log(err);
              if (!!results) {
                return res
                  .status(200)
                  .send({ res_code: "0000", message: "Register Successfully" });
              } else {
                return res
                  .status(400)
                  .send({ res_code: "1500", message: "Can not register" });
              }
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

const fs = require("fs");
const client = require("../connect_db");
const UploadServices = require("../services/uploadServices");
const bcrypt = require("bcrypt");

exports.getAllProfile = async (req, res, next) => {
  try {
    const { limit, offSet } = req.query;

    client.query(
      "SELECT cus_id,name,surname,phone,email,username,photo_user,created_at FROM customers WHERE deleted = 0 ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [parseInt(limit), parseInt(offSet)],
      function (err, results, fields) {
        const total = results.length;
        res.status(200).json({ total, results });
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.getProfileById = async (req, res, next) => {
  try {
    const id = req.params.id;
    client.query(
      "SELECT cus_id,name,surname,phone,email,username,photo_user FROM customers WHERE cus_id = ? AND deleted = 0",
      [id],
      function (err, results, fields) {
        if (results.length > 0) {
          res.status(200).json({ message: "successfully", results });
        } else {
          res.status(404).json({ message: "user not found" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.updateProfileByID = async (req, res, next) => {
  try {
    const { name, surname, phone, password, username, confirmPassword } =
      req.body;
    const id = parseInt(req.params.id);

    let secureUrl;
    if (req.file) {
      secureUrl = await UploadServices.upload(req.file.path);
      client.query(
        `UPDATE customers SET photo_user = ? WHERE cus_id = ?`,
        [secureUrl, id],
        function (err, results, fields) {
          if (results.affectedRows == 0) {
            return res.status(400).json({ message: "user not found" });
          }
          client.query(
            `SELECT *,NULL AS password FROM customers WHERE cus_id = ?`,
            [id],
            function (err, results, fields) {
              return res
                .status(200)
                .json({ message: "Update successfully", results });
            }
          );
        }
      );
      return;
    }

    if (!name) {
      return res.status(400).json({ message: "name is required!" });
    }
    if (!surname) {
      return res.status(400).json({ message: "surname is required!" });
    }
    if (!password) {
      return res.status(400).json({ message: "password is required!" });
    }
    if (!phone) {
      return res.status(400).json({ message: "phone is required!" });
    }
    if (!username) {
      return res.status(400).json({ message: "username is required!" });
    }
    if (password != confirmPassword) {
      return res.status(400).send({ message: "password don't match" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const updateQuery = `
    UPDATE customers
    SET name = ?, surname = ?, phone = ?, password = ?, username = ?
    WHERE cus_id = ?
  `;
    const values = [name, surname, phone, hashedPassword, username, id];
    client.query(updateQuery, values, function (err, results, fields) {
      if (results.affectedRows == 0) {
        return res.status(400).json({ message: "user not found" });
      }
      client.query(
        `SELECT *,NULL AS password FROM customers WHERE cus_id = ?`,
        [id],
        function (err, results, fields) {
          return res
            .status(200)
            .json({ message: "Update successfully", results });
        }
      );
    });
  } catch (error) {
    next(error);
    console.log(error);
  } finally {
    //remove file from device
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
};

exports.deleteProfileByID = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    client.query(
      "SELECT cus_id FROM customers WHERE cus_id = ?",
      [id],
      function (err, results, fields) {
        if (results.length > 0) {
          client.query(
            "UPDATE customers SET deleted = 1 WHERE cus_id = ?",
            [id],
            function (err, resultsDe, fields) {
              return res.status(200).json({ message: "Delete successfully" });
            }
          );
        } else {
          return res.status(400).json({ message: "can not delete" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

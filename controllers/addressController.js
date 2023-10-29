const client = require("../connect_db");
const jwt = require("jsonwebtoken");

exports.getAddressById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    client.query(
      "SELECT *, NULL AS deleted FROM address WHERE cus_id = ? AND deleted = 0",
      [id],
      function (err, results, fields) {
        const total = results?.length;
        if (results.length > 0) {
          return res.status(200).json({ res_code: "0000", total, results });
        } else {
          return res.status(404).json({ message: "address not found" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.getSelectedAddress = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    client.query(
      `SELECT *, NULL AS deleted FROM address WHERE cus_id = ? AND deleted = 0 AND isFirst = "true"`,
      [id],
      function (err, results, fields) {
        const total = results?.length;
        return res.status(200).json({ res_code: "0000", total, results });
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.updatedSelectedAddress = async (req, res, next) => {
  try {
    const { add_id } = req.body;
    const id = parseInt(req.params.id);

    if (!add_id) {
      return res.status(400).json({ message: "add_id is required!" });
    }

    client.query(
      `SELECT add_id, isFirst FROM address WHERE cus_id = ? AND deleted = 0`,
      [id],
      function (err, results, fields) {
        const findisFirst = results.find((item) => item.isFirst === "true");

        if (findisFirst) {
          client.query(
            `UPDATE address SET isFirst = "false" WHERE cus_id = ? AND deleted = 0`,
            [id],
            function (err, resultsOne, fields) {
              client.query(
                `UPDATE address SET isFirst = "true" WHERE add_id = ? AND cus_id = ? AND deleted = 0`,
                [add_id, id],
                function (err, resultsTwo, fields) {
                  if (resultsTwo.affectedRows === 0) {
                    return res
                      .status(404)
                      .json({ message: "Address not found" });
                  }

                  return res.status(200).json({
                    res_code: "0000",
                    message: "Updated successfully",
                  });
                }
              );
            }
          );
        } else {
          client.query(
            `UPDATE address SET isFirst = "true" WHERE add_id = ? AND cus_id = ? AND deleted = 0`,
            [add_id, id],
            function (err, resultsTwo, fields) {
              if (resultsTwo.affectedRows === 0) {
                return res.status(404).json({ message: "Address not found" });
              }
              return res
                .status(200)
                .json({ res_code: "0000", message: "Updated successfully" });
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

exports.createAddress = async (req, res, next) => {
  try {
    const { cus_id, home_no, amphoe, tambon, road, province, zipcode, detail } =
      req.body;

    if (!cus_id) {
      return res.status(400).json({ message: "cus_id is required!" });
    }
    if (!home_no) {
      return res.status(400).json({ message: "home_no is required!" });
    }
    if (!amphoe) {
      return res.status(400).json({ message: "amphoe is required!" });
    }
    if (!tambon) {
      return res.status(400).json({ message: "tambon is required!" });
    }
    if (!road) {
      return res.status(400).json({ message: "road is required!" });
    }
    if (!province) {
      return res.status(400).json({ message: "province is required!" });
    }
    if (!zipcode) {
      return res.status(400).json({ message: "zipcode is required!" });
    }

    client.query(
      "SELECT cus_id FROM customers WHERE cus_id = ?",
      [cus_id],
      function (err, results, fields) {
        if (results.length == 0) {
          return res.status(404).json({ message: "user not found" });
        } else {
          client.query(
            "INSERT INTO address (cus_id, home_no, amphoe, tambon, road, province, zipcode, detail) VALUES (?,?,?,?,?,?,?,?)",
            [cus_id, home_no, amphoe, tambon, road, province, zipcode, detail],
            function (err, resultsCreate, fields) {
              if (!!resultsCreate) {
                return res
                  .status(200)
                  .json({ res_code: "0000", message: "Create successfully" });
              }
              return res.status(400).json({ message: "cannot duplicate" });
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

exports.deleteAddress = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { authorization } = req.headers;
    const { add_id } = req.body;

    const token = authorization.split(" ")[1];
    const privateKey = process.env.JSONWEB_SECRET;
    const payload = jwt.verify(token, privateKey);
    const userId = payload.userId.email;

    if (!add_id) {
      return res.status(400).json({ message: "add_id is required!" });
    }

    client.query(
      "SELECT email,cus_id FROM customers WHERE email = ?",
      [userId],
      function (err, results, fields) {
        const cusId = results[0]?.cus_id;
        if (cusId == id) {
          client.query(
            "SELECT add_id FROM address WHERE add_id = ? AND cus_id = ?",
            [add_id, cusId],
            function (err, results, fields) {
              if (results.length == 0) {
                return res.status(404).json({ message: "Address not found" });
              } else {
                client.query(
                  "UPDATE address SET deleted = 1 WHERE add_id = ? AND deleted = 0",
                  [add_id],
                  function (err, results, fields) {
                    return res.status(200).json({
                      res_code: "0000",
                      message: "Delete successfully",
                    });
                  }
                );
              }
            }
          );
        } else {
          return res
            .status(400)
            .json({ message: "Can not delete address other person" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const { add_id, home_no, amphoe, tambon, road, province, zipcode, detail } =
      req.body;
    const id = parseInt(req.params.id);
    const { authorization } = req.headers;

    const token = authorization.split(" ")[1];
    const privateKey = process.env.JSONWEB_SECRET;
    const payload = jwt.verify(token, privateKey);
    const userId = payload.userId.email;
    if (!add_id) {
      return res.status(400).json({ message: "add_id is required!" });
    }
    if (!home_no) {
      return res.status(400).json({ message: "home_no is required!" });
    }
    if (!amphoe) {
      return res.status(400).json({ message: "amphoe is required!" });
    }
    if (!tambon) {
      return res.status(400).json({ message: "tambon is required!" });
    }
    if (!road) {
      return res.status(400).json({ message: "road is required!" });
    }
    if (!province) {
      return res.status(400).json({ message: "province is required!" });
    }
    if (!zipcode) {
      return res.status(400).json({ message: "zipcode is required!" });
    }

    client.query(
      "SELECT email,cus_id FROM customers WHERE email = ?",
      [userId],
      function (err, results, fields) {
        const cusID = results[0]?.cus_id;
        if (cusID !== id) {
          return res.status(400).json({ message: "Can not edit other person" });
        } else {
          client.query(
            "SELECT add_id FROM address WHERE add_id = ? AND deleted = 0 AND cus_id = ?",
            [add_id, id],
            function (err, resultsSelect, fields) {
              if (resultsSelect.length > 0) {
                client.query(
                  "UPDATE address SET  home_no = ?, amphoe = ?, tambon = ?, road = ?, province = ?, zipcode = ?, detail = ? WHERE add_id = ?",
                  [
                    home_no,
                    amphoe,
                    tambon,
                    road,
                    province,
                    zipcode,
                    detail,
                    add_id,
                  ],
                  function (err, resultsCreate, fields) {
                    if (!!resultsCreate) {
                      return res.status(200).json({
                        res_code: "0000",
                        message: "Update successfully",
                      });
                    }
                  }
                );
              } else {
                return res.status(404).json({ message: "Address not found" });
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
exports.getProvinces = async (req, res, next) => {
  try {
    const { province, amphoe, tambon } = req.query;
    client.query(
      `SELECT DISTINCT province FROM tambons `,
      function (err, results, fieldsDb) {
        return res.status(200).json({ res_code: "0000", results });
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.getAmphoe = async (req, res, next) => {
  try {
    const { province, amphoe } = req.query;
    client.query(
      `SELECT DISTINCT amphoe FROM tambons 
        WHERE province = ? OR amphoe = ?
        `,
      [province, amphoe],
      function (err, results, fieldsDb) {
        return res.status(200).json({ res_code: "0000", results });
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.getTambon = async (req, res, next) => {
  try {
    const { province, amphoe, tambon } = req.query;
    client.query(
      `SELECT DISTINCT tambon FROM tambons 
          WHERE province = ? AND amphoe = ? 
          `,
      [province, amphoe],
      function (err, results, fieldsDb) {
        return res.status(200).json({ res_code: "0000", results });
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.getZipCode = async (req, res, next) => {
  try {
    const { province, amphoe, tambon } = req.query;
    client.query(
      `SELECT * FROM tambons 
       WHERE province = ? AND amphoe = ? AND tambon = ?
      `,
      [province, amphoe, tambon],
      function (err, results, fieldsDb) {
        if (results.length > 0) {
          return res
            .status(200)
            .json({ res_code: "0000", zipcode: results[0].zipcode });
        } else {
          return res.status(400).json({ message: "Not found" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

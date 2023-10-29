const client = require("../connect_db");

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
    const {  isFirst } = req.body;
    const id = parseInt(req.params.id)

  
    if (!isFirst) {
      return res.status(400).json({ message: "isFirst is required!" });
    }

    client.query(
      `SELECT add_id FROM address WHERE add_id = ? AND deleted = 0`,
      [id],
      function (err, results, fields) {
        if (results.length > 0) {
          client.query(
            `UPDATE address SET isFirst = ? WHERE add_id = ? AND deleted = 0`,
            [isFirst, id],
            function (err, results, fields) {
              return res.status(200).json({ res_code: "0000",  message: "Updated successfully" });
            }
          );
        } else {
          return res.status(404).json({ message: "Address not found" });
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
    client.query(
      "SELECT add_id FROM address WHERE add_id = ?",
      [id],
      function (err, results, fields) {
        if (results.length > 0) {
          client.query(
            "UPDATE address SET deleted = 1 WHERE add_id = ? AND deleted = 0",
            [id],
            function (err, results, fields) {
              return res
                .status(200)
                .json({ res_code: "0000", message: "Delete successfully" });
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

exports.updateAddress = async (req, res, next) => {
  try {
    const { cus_id, home_no, amphoe, tambon, road, province, zipcode, detail } =
      req.body;
    const id = parseInt(req.params.id);

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
            "SELECT add_id FROM address WHERE add_id = ? AND deleted = 0",
            [id],
            function (err, resultsSelect, fields) {
              if (resultsSelect.length > 0) {
                client.query(
                  "UPDATE address SET cus_id = ?, home_no = ?, amphoe = ?, tambon = ?, road = ?, province = ?, zipcode = ?, detail = ? WHERE add_id = ?",
                  [
                    cus_id,
                    home_no,
                    amphoe,
                    tambon,
                    road,
                    province,
                    zipcode,
                    detail,
                    id,
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

const client = require("../connect_db");

exports.createComment = (req, res, next) => {
  try {
    const { cus_id, star, details, pro_id } = req.body;
    if (!cus_id) {
      return res.status(400).json({ message: "cus_id is required!" });
    }
    if (!star) {
      return res.status(400).json({ message: "star is required!" });
    }
    if (!details.trim()) {
      return res.status(400).json({ message: "details is required!" });
    }
    if (!pro_id) {
      return res.status(400).json({ message: "pro_id is required!" });
    }
    client.query(
      `SELECT cus_id, pro_id FROM comments WHERE cus_id = ?`,
      [cus_id],
      function (err, results, fieldsDb) {
        if (results.length > 0) {
          return res.status(400).json({ message: "You alredy review!" });
        } else {
          client.query(
            `INSERT INTO comments (cus_id,star,details,pro_id) VALUES (?,?,?,?)`,
            [cus_id, star, details, pro_id],
            function (err, results, fieldsDb) {
              return res.status(200).json({ message: "Review successfully" });
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

exports.getCommentByProductID = (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    client.query(
      `
      WITH AvgStar AS (
        SELECT AVG(star) AS avg_star
        FROM comments
      )      
      SELECT c.*,cs.username,avg_star FROM AvgStar,comments c
      INNER JOIN products p ON p.pro_id = c.pro_id
      INNER JOIN customers cs ON cs.cus_id = c.cus_id
      WHERE p.pro_id = ?`,
      [id],
      function (err, results, fieldsDb) {
        if (results?.length > 0) {
          return res.status(200).json({ results });
        } else {
          return res.status(400).json({ message: "comment not found" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

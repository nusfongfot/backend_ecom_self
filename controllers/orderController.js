const client = require("../connect_db");

exports.getAllOrders = async (req, res, next) => {
  try {
    const { limit, offSet } = req.query;
    client.query(
      "SELECT ord.order_id,ord.created_at,ord.status_order,ord.items,c.name,c.surname,c.phone ,p.title,p.description,p.price,p.image ,ad.home_no,ad.amphoe,ad.tambon,ad.road,ad.province,ad.zipcode,ad.detail,ad.isFirst FROM orders ord INNER JOIN customers c ON ord.cus_id = c.cus_id INNER JOIN products p ON ord.pro_id = p.pro_id INNER JOIN address ad ON ord.add_id = ad.add_id ORDER BY ord.created_at DESC",
      [parseInt(limit), parseInt(offSet)],
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

exports.getOrderById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    client.query(
      "SELECT ord.order_id,ord.created_at,ord.status_order,ord.items,c.name,c.surname,c.phone ,p.title,p.description,p.price,p.image ,ad.home_no,ad.amphoe,ad.tambon,ad.road,ad.province,ad.zipcode,ad.detail,ad.isFirst FROM orders ord INNER JOIN customers c ON ord.cus_id = c.cus_id INNER JOIN products p ON ord.pro_id = p.pro_id INNER JOIN address ad ON ord.add_id = ad.add_id WHERE ord.order_id = ?  ORDER BY ord.created_at DESC",
      [id],
      function (err, results, fields) {
        if (results.length > 0) {
          return res.status(200).json({ res_code: "0000", results });
        } else {
          return res.status(404).json({ message: "order not found" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.getHistoryOrderID = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    client.query(
      "SELECT ord.order_id,ord.cus_id,ord.created_at,ord.status_order,ord.items,c.name,c.surname,c.phone ,p.title,p.description,p.price,p.image ,ad.home_no,ad.amphoe,ad.tambon,ad.road,ad.province,ad.zipcode,ad.detail,ad.isFirst FROM orders ord INNER JOIN customers c ON ord.cus_id = c.cus_id INNER JOIN products p ON ord.pro_id = p.pro_id INNER JOIN address ad ON ord.add_id = ad.add_id WHERE ord.cus_id = ? ORDER BY ord.created_at DESC",
      [id],
      function (err, results, fields) {
        const total = results.length;
        if (results.length > 0) {
          return res.status(200).json({ res_code: "0000", total, results });
        } else {
          return res.status(404).json({ message: "order not found" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { cus_id, pro_id, add_id, items } = req.body;

    if (!cus_id) {
      return res.status(400).json({ message: "cus_id is required!" });
    }
    if (!pro_id) {
      return res.status(400).json({ message: "pro_id is required!" });
    }
    if (!add_id) {
      return res.status(400).json({ message: "add_id is required!" });
    }
    if (!items) {
      return res.status(400).json({ message: "items is required!" });
    }

    client.query(
      `INSERT INTO orders (cus_id, pro_id, add_id,items) VALUES (?,?,?,?)`,
      [cus_id, pro_id, add_id, items],
      function (err, results, fieldsDb) {
        if (!!results) {
          return res
            .status(200)
            .json({ res_code: "0000", message: "Create order successfully" });
        } else {
          return res.status(400).json({ message: "Can not create order" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.cancelOrderById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    client.query(
      `SELECT order_id FROM orders WHERE order_id = ? AND status_order = "Already ordered"`,
      [id],
      function (err, results, fieldsDb) {
        if (!!results && results.length > 0) {
          client.query(
            `UPDATE orders
             SET status_order = "Cancel order"
             WHERE order_id = ?`,
            [id]
          );
          return res
            .status(200)
            .json({ res_code: "0000", message: "Cancel order successfully" });
        } else {
          return res.status(400).json({ message: "Can not cancel this order" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.changeStatusOrderById = async (req, res, next) => {
  try {
    const { id, status } = req.query;
    client.query(
      `SELECT order_id FROM orders WHERE order_id = ?`,
      [id],
      function (err, results, fieldsDb) {
        if (results.length > 0) {
          client.query(
            `UPDATE orders
             SET status_order = ?
             WHERE order_id = ?`,
            [status, id]
          );
          return res
            .status(200)
            .json({ res_code: "0000", message: "Change status successfully" });
        } else {
          return res.status(400).json({ message: "Can not change status" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

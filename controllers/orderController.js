const client = require("../connect_db");

exports.getAllOrders = async (req, res, next) => {
  try {
    const { limit, offSet } = req.query;

    client.query(
      `SELECT ord.order_id,ord.created_at,ord.status_order,ord.items,c.name,c.surname,c.phone ,p.title,p.description,p.price,p.image ,ad.home_no,ad.amphoe,ad.tambon,ad.road,ad.province,ad.zipcode,ad.detail,ad.isFirst FROM orders ord INNER JOIN customers c ON ord.cus_id = c.cus_id INNER JOIN products p ON ord.pro_id = p.pro_id INNER JOIN address ad ON ord.add_id = ad.add_id WHERE ord.status_order != "Cancel order" ORDER BY ord.created_at DESC`,
      [parseInt(limit), parseInt(offSet)],
      function (err, results, fields) {
        const total = results?.length;
        const calPrice = results?.reduce((acc, val) => {
          const price = parseFloat(val.price);
          const items = parseFloat(val.items);
          const total = price * items;
          return acc + total;
        }, 0);
        const total_price = calPrice.toLocaleString("en-US");
        return res
          .status(200)
          .json({ res_code: "0000", total_price, total, results });
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
      `SELECT ord.order_id,ord.created_at,ord.status_order,ord.items,c.name,c.surname,c.phone ,p.title,p.description,p.price,p.image ,ad.home_no,ad.amphoe,ad.tambon,ad.road,ad.province,ad.zipcode,ad.detail,ad.isFirst FROM orders ord INNER JOIN customers c ON ord.cus_id = c.cus_id INNER JOIN products p ON ord.pro_id = p.pro_id INNER JOIN address ad ON ord.add_id = ad.add_id WHERE ord.order_id = ? AND ord.status_order != "Cancel order" ORDER BY ord.created_at DESC`,
      [id],
      function (err, results, fields) {
        const calPrice = results?.reduce((acc, val) => {
          const price = parseFloat(val.price);
          const items = parseFloat(val.items);
          const total = price * items;
          return acc + total;
        }, 0);
        const total_price = calPrice.toLocaleString("en-US");
        if (results.length > 0) {
          return res
            .status(200)
            .json({ res_code: "0000", total_price, results });
        } else {
          return res.status(200).json({ message: "Order not found" });
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
        const calPrice = results?.reduce((acc, val) => {
          const price = parseFloat(val.price);
          const items = parseFloat(val.items);
          const total = price * items;
          return acc + total;
        }, 0);
        const total_price = calPrice.toLocaleString("en-US");
        if (results.length > 0) {
          return res
            .status(200)
            .json({ res_code: "0000", total_price, total, results });
        } else {
          return res.status(200).json({ message: "Order not found" });
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
    const { orders } = req.body;
    if (orders.length == 0) {
      return res.status(400).json({ message: "orders is required!" });
    }

    const processOrders = orders.map((order) => {
      return new Promise((resolve, reject) => {
        const { cus_id, pro_id, add_id, items } = order;
        client.query(
          "SELECT pro_id FROM products WHERE pro_id = ?",
          [pro_id],
          (err, results, fieldsDb) => {
            if (err) {
              reject(err);
            } else if (results?.length === 0) {
              reject("Product not found");
            } else {
              client.query(
                "INSERT INTO orders (cus_id, pro_id, add_id, items) VALUES (?, ?, ?, ?)",
                [cus_id, pro_id, add_id, items],
                (err, results, fieldsDb) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve();
                  }
                }
              );
            }
          }
        );
      });
    });

    Promise.all(processOrders)
      .then(() => {
        return res.status(200).json({
          res_code: "0000",
          message: "Create order successfully",
        });
      })
      .catch((error) => {
        return res.status(400).json({ message: "Error creating orders" });
      });
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

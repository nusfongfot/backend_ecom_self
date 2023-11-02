const client = require("../connect_db");
const formidable = require("formidable");
const UploadServices = require("../services/uploadServices");
const fs = require("fs");

exports.getAllProduct = async (req, res, next) => {
  try {
    const { limit, offSet } = req.query;
    // calculate new stock
    client.query(
      `SELECT p.stock, ord.items, ord.pro_id FROM products p INNER JOIN orders ord ON p.pro_id = ord.pro_id WHERE ord.status_order = "Successful delivery"`,
      async function (err, results, fields) {
        const products = results?.reduce((acc, val) => {
          const total = val.stock - val.items;
          acc.push({ pro_id: val.pro_id, stock: total });
          return acc;
        }, []);

        const pro_id = products?.map((item) => item.pro_id);

        let total = 0;
        client.query(
          "SELECT * FROM products WHERE deleted = 0 ORDER BY created_at DESC",
          function (err, resultsTotal, fields) {
            total = resultsTotal.length;
            client.query(
              "SELECT * FROM products WHERE deleted = 0 ORDER BY created_at DESC LIMIT ? OFFSET ?",
              [parseInt(limit), parseInt(offSet)],
              function (err, results, fields) {
                const newStock = products?.map((item) => item.stock);
                const data = results?.map((item, index) => {
                  const productIndex = pro_id.indexOf(item.pro_id);
                  if (pro_id.includes(item.pro_id)) {
                    return {
                      ...item,
                      stock: newStock[productIndex],
                    };
                  }
                  return item;
                });
                return res.status(200).json({
                  res_code: "0000",
                  total,
                  products: data,
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.getProductByID = async (req, res, next) => {
  try {
    const id = req.params.id;
    client.query(
      "SELECT * FROM products WHERE pro_id = ? AND deleted = 0",
      [id],
      function (err, results, fields) {
        if (results.length > 0) {
          res.status(200).json({
            res_code: "0000",
            message: "successfully",
            products: results,
          });
        } else {
          res.status(404).json({ message: "product not found" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.getProductByPriceRange = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    client.query(
      "SELECT * FROM products WHERE price >= ? AND price <= ? AND deleted = 0 ORDER BY price ASC",
      [start, end],
      function (err, results, fields) {
        const total = results?.length;
        if (results.length > 0) {
          res.status(200).json({
            res_code: "0000",
            total,
            message: "successfully",
            products: results,
          });
        } else {
          res
            .status(200)
            .json({ products: results, message: "product not found" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.getProductByCate = async (req, res, next) => {
  try {
    const { cate, offSet, limit } = req.query;
    const sqlQuery = `SELECT * FROM products WHERE category = ? AND deleted = 0 LIMIT ? OFFSET ?`;
    client.query(
      sqlQuery,
      [cate, parseInt(limit), parseInt(offSet)],
      (err, results) => {
        const total = results?.length;
        return res
          .status(200)
          .json({ res_code: "0000", total, products: results });
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.getProductBySearch = async (req, res, next) => {
  try {
    const { q, offSet, limit } = req.query;
    const sqlQuery = `
      SELECT * FROM products 
      WHERE LOWER(title) LIKE ? AND deleted = 0 
      LIMIT ? OFFSET ?;
    `;

    const queryParam = "%" + q.toLowerCase().trim() + "%";
    const queryLimit = parseInt(limit);
    const queryOffset = parseInt(offSet);
    const results = await new Promise((resolve, reject) => {
      client.query(
        sqlQuery,
        [queryParam, queryLimit, queryOffset],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    });

    if (results.length === 0) {
      return res
        .status(200)
        .json({ products: [], message: "Product not found!" });
    } else {
      const total = results.length;
      return res
        .status(200)
        .json({ res_code: "0000", total, products: results });
    }
  } catch (error) {
    next(error);
    console.error(error);
  }
};

exports.updateProductByID = async (req, res, next) => {
  try {
    const { title, description, stock, price, category, brand } = req.body;
    const id = parseInt(req.params.id);

    if (!title) {
      return res.status(400).json({ message: "title is required!" });
    }
    if (!description) {
      return res.status(400).json({ message: "description is required!" });
    }
    if (!stock) {
      return res.status(400).json({ message: "stock is required!" });
    }
    if (!price) {
      return res.status(400).json({ message: "price is required!" });
    }
    if (!category) {
      return res.status(400).json({ message: "category is required!" });
    }
    if (!brand) {
      return res.status(400).json({ message: "brand is required!" });
    }

    client.query(
      `SELECT pro_id FROM products WHERE pro_id = ? AND deleted = 0`,
      [id],
      function (err, results, fieldsDb) {
        console.log(results);
        if (results.length > 0) {
          client.query(
            `UPDATE products SET title = ?,description = ?,stock = ?,price = ?,category = ?,brand = ?
            WHERE pro_id = ?`,
            [title, description, stock, price, category, brand, id],
            function (err, fields, fieldsDb) {
              return res.status(200).json({
                res_code: "0000",
                message: "Update product successfully",
              });
            }
          );
        } else {
          return res.status(400).json({ message: "product not found" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) return res.send({ message: err.message });

      for (const key in fields) {
        fields[key] = fields[key][0];
      }

      if (!fields.title.trim()) {
        return res.status(400).json({ message: "title is required!" });
      }
      if (!fields.description.trim()) {
        return res.status(400).json({ message: "description is required!" });
      }
      if (!fields.stock) {
        return res.status(400).json({ message: "stock is required!" });
      }
      if (!fields.price) {
        return res.status(400).json({ message: "price is required!" });
      }
      if (!fields.category.trim()) {
        return res.status(400).json({ message: "category is required!" });
      }
      if (!fields.brand.trim()) {
        return res.status(400).json({ message: "brand is required!" });
      }
      if (Object.keys(files).length === 0) {
        return res.status(400).json({ message: "files is required!" });
      }

      //upload for multiple images
      const uploader = async (path) =>
        await UploadServices.uploads(path, "Products");
      const urls = [];

      try {
        const pathUpload = files.images.map((item) => item.filepath);
        for (const path of pathUpload) {
          const newPath = await uploader(path);
          urls.push(newPath);
        }
      } catch (error) {
        next(error);
        console.log(error);
      }

      const imageUpload = urls?.map((item) => item.url).join(",");
      fields.image = imageUpload;
      //upload for multiple images
      client.query(
        `INSERT INTO products (title,description,stock,price,category,brand,image) VALUES (?,?,?,?,?,?,?)`,
        [
          fields.title,
          fields.description,
          fields.stock,
          fields.price,
          fields.category,
          fields.brand,
          fields.image,
        ],
        function (err, results, fieldsDb) {
          return res.status(200).json({
            res_code: "0000",
            message: "Create product successfully",
            products: fields,
          });
        }
      );
    });
  } catch (error) {
    next(error);
    console.log(error);
  } finally {
    // if (req.file) {
    //   fs.unlinkSync(req.file.path);
    // }
  }
};

exports.deleteProductByID = async (req, res, next) => {
  try {
    const id = req.params.id;
    client.query(
      "SELECT * FROM products WHERE pro_id = ?",
      [id],
      function (err, results, fields) {
        if (results.length > 0) {
          client.query(
            "UPDATE products SET deleted = 1 WHERE pro_id = ?",
            [id],
            function (err, results, fields) {
              return res
                .status(200)
                .json({ res_code: "0000", message: "Delete successfully" });
            }
          );
        } else {
          return res.status(404).json({ message: "product not found" });
        }
      }
    );
  } catch (error) {
    next(error);
    console.log(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = [
      "smartphones",
      "laptops",
      "fragrances",
      "skincare",
      "home-decoration",
      "furniture",
      "tops",
      "womens-shirts",
      "womens-dresses",
      "womens-shoes",
      "mens-shirts",
      "mens-shoes",
      "mens-watches",
      "womens-watches",
      "womens-bags",
      "sunglasses",
      "lighting",
      "other",
    ];
    return res.status(200).json({ res_code: "0000", categories });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

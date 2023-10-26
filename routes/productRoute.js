const express = require("express");
const productController = require("../controllers/productController");
const router = express.Router();

router.get("/products/category", productController.getProductByCate);
router.get("/products/categories", productController.getCategories);
router.get("/products/search", productController.getProductBySearch);
router.post("/products", productController.createProduct);
router.get("/products", productController.getAllProduct);
router.get("/products/:id", productController.getProductByID);
router.patch("/products/:id", productController.updateProductByID);
router.delete("/products/:id", productController.deleteProductByID);

module.exports = router;

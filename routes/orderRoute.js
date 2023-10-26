const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.patch("/orders/status", orderController.changeStatusOrderById);
router.get("/orders/history/:id", orderController.getHistoryOrderID);
router.get("/orders", orderController.getAllOrders);
router.post("/orders", orderController.createOrder);
router.get("/orders/:id", orderController.getOrderById);
router.patch("/orders/:id", orderController.cancelOrderById);

module.exports = router;

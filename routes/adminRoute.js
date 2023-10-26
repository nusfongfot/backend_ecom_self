const express = require("express");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.get("/", adminController.getAllAdmins);
router.post("/login", adminController.login);
router.post("/register", adminController.register);
router.delete("/delete/:id", adminController.deleteAdminById);

module.exports = router;

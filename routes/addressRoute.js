const express = require("express");
const addressController = require("../controllers/addressController");

const router = express.Router();

router.get("/address/province", addressController.getProvinces);
router.get("/address/amphoe", addressController.getAmphoe);
router.get("/address/tambon", addressController.getTambon);
router.get("/address/zipcode", addressController.getZipCode);

router.post("/address/selected/:id", addressController.updatedSelectedAddress);
router.get("/address/selected/:id", addressController.getSelectedAddress);
router.post("/address", addressController.createAddress);
router.patch("/address/:id", addressController.updateAddress);
router.get("/address/:id", addressController.getAddressById);
router.delete("/address/:id", addressController.deleteAddress);

module.exports = router;

const express = require("express");
const uploadController = require("../controllers/uploadController");
const uploadMiddleware = require("../middleware/upload");

const router = express.Router();

router.post(
  "/upload",
  uploadMiddleware.single("file"),
  uploadController.uploadSingleImage
);

router.post(
  "/uploads",
  uploadMiddleware.array("images", 10),
  uploadController.uploadMultipleImages
);

module.exports = router;

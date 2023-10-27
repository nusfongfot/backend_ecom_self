const express = require("express");
const profileController = require("../controllers/profileController");
const uploadMiddleware = require("../middleware/upload");

const router = express.Router();

router.get("/profile", profileController.getAllProfile);
router.get("/profile/search", profileController.searchProfileUsers);
router.get("/profile/:id", profileController.getProfileById);
router.put(
  "/profile/:id",
  uploadMiddleware.single("file"),
  profileController.updateProfileByID
);
router.delete("/profile/:id", profileController.deleteProfileByID);

module.exports = router;

const express = require("express");
const commentController = require("../controllers/commentController");

const router = express.Router();

router.get("/comments/:id", commentController.getCommentByProductID);
router.post("/comments", commentController.createComment);

module.exports = router;

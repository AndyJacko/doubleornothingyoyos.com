const express = require("express");

const PostController = require("../controllers/posts");
const checkAuth = require("../middleware/check-auth");
const imageUpload = require("../middleware/image-upload");

const router = express.Router();

router.get("", PostController.getAllPosts);

router.get("/:id", PostController.getOnePost);

router.post("", checkAuth, imageUpload, PostController.createPost);

router.put("/:id", checkAuth, imageUpload, PostController.editPost);

router.delete("/:id", checkAuth, PostController.deletePost);

module.exports = router;

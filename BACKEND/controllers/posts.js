const Post = require("../models/post");

exports.getAllPosts = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then((posts) => {
      fetchedPosts = posts;
      return Post.count();
    })
    .then((count) => {
      res.status(200).json({
        message: "All Posts Fetched",
        posts: fetchedPosts,
        totalPosts: count,
      });
    })
    .catch((error) => {
      res.status(500).json({ message: "Fetching All Posts Failed" });
    });
};

exports.getOnePost = (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(400).json({ message: "Post Not Found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "Fetching Post Failed" });
    });
};

exports.createPost = (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    postType: req.body.postType,
    imageURL: url + "/images/" + req.file.filename,
    videoURL: req.body.videoURL,
    creator: req.userData.userId,
  });

  post
    .save()
    .then((newPost) => {
      res.status(201).json({
        message: "Post Created",
        post: {
          ...newPost,
          id: newPost._id,
        },
      });
    })
    .catch((error) => {
      res.status(500).json({ message: "Create Post Failed" });
    });
};

exports.editPost = (req, res, next) => {
  let imageURL = req.body.imageURL;

  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imageURL = url + "/images/" + req.file.filename;
  }

  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    postType: req.body.postType,
    imageURL: imageURL,
    videoURL: req.body.videoURL,
    creator: req.userData.userId,
  });

  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({ message: "Post Updated" });
      } else {
        res.status(401).json({ message: "Not Authorised" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "Update Post Failed" });
    });
};

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      if (result.n > 0) {
        res.status(200).json({ message: "Post Deleted" });
      } else {
        res.status(401).json({ message: "Not Authorised" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "Delete Post Failed" });
    });
};

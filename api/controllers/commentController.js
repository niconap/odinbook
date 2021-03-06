const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const async = require('async');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

exports.comment_create = [
  (req, res, next) => {
    jwt.verify(req.token, process.env.SESSION_SECRET, function (err, authData) {
      if (err) {
        res.sendStatus(403);
        return;
      } else {
        req.authData = authData;
        next();
      }
    });
  },

  body('content', 'Your comment cannot be empty')
    .trim()
    .escape()
    .isLength({ min: 1 }),
  body('content', 'Your comment cannot be longer than 250 characters')
    .trim()
    .escape()
    .isLength({ max: 250 }),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({
        message: 'Something went wrong while trying to create a new comment',
        errors: errors.array(),
      });
      return;
    } else {
      async.parallel(
        {
          post: function (callback) {
            Post.findById(req.params.id).exec(callback);
          },
        },
        function (err, results) {
          if (err) return next(err);
          if (results.post == null) {
            res.sendStatus(404);
            return;
          }

          let comment = new Comment({
            user: req.authData._id,
            username: req.authData.username,
            content: req.body.content,
            timeStamp: new Date(),
            post: results.post._id,
          }).save((err, newComment) => {
            if (err) return next(err);
            Post.findOneAndUpdate(
              { _id: results.post._id },
              {
                $push: {
                  comments: newComment._id,
                },
              },
              function (err) {
                if (err) return next(err);
                res.json({
                  message: `A new comment has succesfully been added to ${results.post.title}`,
                  comment: newComment,
                });
              }
            );
          });
        }
      );
    }
  },
];

exports.comment_delete = function (req, res, next) {
  jwt.verify(req.token, process.env.SESSION_SECRET, function (err, authData) {
    if (err) {
      res.sendStatus(403);
      return;
    } else {
      async.parallel(
        {
          post: function (callback) {
            Post.findById(req.params.postid).exec(callback);
          },
          comment: function (callback) {
            Comment.findById(req.params.commentid).exec(callback);
          },
        },
        function (err, results) {
          if (err) return next(err);
          if (results.post == null || results.comment == null) {
            res.sendStatus(404);
            return;
          }
          if (authData._id != results.comment.user) {
            res.sendStatus(403);
            return;
          }
          Post.findByIdAndUpdate(
            req.params.postid,
            {
              $pull: {
                comments: req.params.commentid,
              },
            },
            function (err) {
              if (err) return next(err);
            }
          );
          Comment.findByIdAndRemove(
            req.params.commentid,
            function (err, comment) {
              if (err) return next(err);
              res.json({
                message: `A comment on a post called ${results.post.title} has been removed`,
                comment: comment,
              });
            }
          );
        }
      );
    }
  });
};

const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const async = require('async');
const bcrypt = require('bcryptjs');

exports.user_signup = [
  body('username', 'Username must be longer than 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body('username', 'Username is already taken').custom((value, { req }) => {
    return new Promise((resolve, reject) => {
      User.findOne({ username: req.body.username }, function (err, user) {
        if (err) return next(err);
        if (user && user.username == value) {
          reject(new Error('Username is already taken'));
        }
        resolve(true);
      });
    });
  }),
  body('firstName', 'First name cannot be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('lastName', 'Last name cannot be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('email', 'E-mail cannot be empty').trim().isLength({ min: 1 }),
  body('email', 'Enter a valid e-mail').isEmail(),
  body('password', 'Password must be 8 characters or longer').isLength({
    min: 8,
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({
        message:
          'Something went wrong while trying to validate the entered data',
        errors: errors.array(),
      });
    } else {
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) return next(err);
        var user = new User({
          username: req.body.username,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: hashedPassword,
          friends: [],
          requests: [],
          posts: [],
        }).save((err, newUser) => {
          if (err) return next(err);
          res.json({
            message: 'Signup completed succesfully',
            username: newUser.username,
            id: newUser._id,
          });
        });
      });
    }
  },
];
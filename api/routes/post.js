const express = require('express');
const router = express.Router();
const {
  post_create,
  post_get_general,
} = require('../controllers/postController');

router.post('/new', verifyToken, post_create);

router.get('/get/general', post_get_general);

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader != 'undefined') {
    const bearer = bearerHeader.split(' ')[1];
    req.token = bearer;
    next();
  } else {
    res.sendStatus(403);
  }
}

module.exports = router;

require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
var session = require('express-session');
const mongoose = require('mongoose');
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');

var User = require('./models/user');

var app = express();

dev_db_url = process.env.CONNECTION_STRING;
var mongoDB = dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

passport.use(
  new FacebookTokenStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      fbGraphVersion: 'v3.0',
    },
    function (accessToken, refreshToken, profile, done) {
      User.exists({ facebookId: profile.id }, function (err, user) {
        if (err) return done(err);
        if (user) {
          done(null, user);
        } else {
          User.create(
            {
              displayName: `${profile.name.givenName} ${profile.name.familyName}`,
              facebookId: profile.id,
              token: accessToken,
              email: profile.emails[0].value,
              picture: profile.photos
                ? profile.photos[0].value
                : '/img/faces/unknown-user-pic.jpg',
              friends: [],
              posts: [],
              requests: [],
            },
            function (err, newUser) {
              if (err) return done(err);
              return done(null, newUser);
            }
          );
        }
      });
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: 'http://localhost:3000/auth/facebook/redirect',
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
    },
    function (accessToken, refreshToken, profile, done) {
      User.exists({ facebookId: profile.id }, function (err, user) {
        if (err) return done(err);
        if (user) {
          done(null, user);
        } else {
          User.create(
            {
              displayName: `${profile.name.givenName} ${profile.name.familyName}`,
              facebookId: profile.id,
              token: accessToken,
              email: profile.emails[0].value,
              picture: profile.photos
                ? profile.photos[0].value
                : '/img/faces/unknown-user-pic.jpg',
              friends: [],
              posts: [],
              requests: [],
            },
            function (err, newUser) {
              if (err) return done(err);
              return done(null, newUser);
            }
          );
        }
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, foundUser) {
    if (err) done(err);
    done(null, foundUser);
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.session());

app.use('/', indexRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json('error');
});

module.exports = app;
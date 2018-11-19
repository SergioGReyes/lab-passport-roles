const express = require('express');
const router  = express.Router();

const User = require('../models/User');

const bcrypt = require('bcrypt');
const bcryptSalt = 10;

const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;

const ensureLogin = require("connect-ensure-login");

const checkTA  = checkRoles('TA');
const checkDev = checkRoles('Developer');
const checkBoss  = checkRoles('Boss');

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/login', (req, res, next) => {
  res.render('passport/login');
});

router.get('/private', ensureLogin.ensureLoggedIn(), (req, res) => {
  console.log(req.user);
  res.render('passport/private', { user: req.user });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

router.get('/private/new', checkRoles('Boss'), (req, res, next) => {
  res.render('passport/new', {user: req.user});
});


router.get('/private/users', (req, res, next) => {

  User.find()
    .then(user => {
      res.render("users/users", { user });
    })
    .catch(error => {
      console.error(err);
      next(err);
    })
});

router.post('/login', passport.authenticate("local", {
  successRedirect: "/private",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.post('/private/new', checkRoles('Boss'),(req, res, next) => {
  const newUser = new User();

  if (req.body.username == '' || req.body.password == '' || req.body.role == '') {
    console.log("NINGUN CAMPO INTRODUCIDO");
    res.redirect('/private/new');
  }

  newUser.username = req.body.username;
  newUser.password = req.body.password;
  newUser.role = req.body.role;

  newUser.save()
    .then(user => {
      res.redirect('/private/users');
    })
    .catch(err => console.log(err));
});

router.post('/private/users/:id/delete', checkRoles('Boss'), (req, res, next) => {
  User.findByIdAndRemove(req.params.id)
    .then(user => {
      res.redirect('/private/users');
    })
    .catch(err => console.log(err));
});


function checkRoles(role) {
  return function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    } else {
      res.redirect('/login')
    }
  }
}

module.exports = router;

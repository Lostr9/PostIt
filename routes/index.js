var express = require('express');
var router = express.Router();
var passport = require('../auth');
var mongoose = require('mongoose');
var User = require('../models/user');

router.get('/', function(req,res){
  if (req.user){
    res.redirect('/profile');
  }else{
    res.render('index', {LoginError: '', RegisterError: ''});
  }
});

router.post('/login', function(req, res) {
  console.log(req.body);
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.render('index', {LoginError: 'Неверное имя пользователя или пароль', RegisterError: ''});}//res.render('authPage', {loginError: 'Неверное имя пользователя или пароль', regError: ''}); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res);
});

router.post('/registration', function(req, res) {
  if (req.body.password == req.body.password1){
    User.register(new User({ username : req.body.username, email: req.body.email }), req.body.password, function(err, user) {
      if (err) {
        return res.render('index', {LoginError: '', RegisterError: err});//res.render('authPage', {loginError: '', regError: err});
      }
      console.log('Зареган');
      passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.render('index', {LoginError: 'Неверное имя пользователя или пароль', RegisterError: ''});}//res.render('authPage', {loginError: 'Неверное имя пользователя или пароль', regError: ''}); }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect('/');
        });
      })(req, res);
    });
  }
  else{
    res.render('index', {LoginError: '', RegisterError: 'Пароли не совпадают'});
  }
});

router.get('/profile', function(req, res) {
  res.render('profile');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});


module.exports = router;

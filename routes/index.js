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
<<<<<<< HEAD
        return res.render('index', {LoginError: '', RegisterError: err});//res.render('authPage', {loginError: '', regError: err});
      }
      console.log('Зареган');
=======
        if ('MongoError' == err.name){
          return res.render('index', {LoginError: '', RegisterError: 'Email уже используется'});
        }else if ('UserExistsError' == err.name){
          return res.render('index', {LoginError: '', RegisterError: 'Имя занято'});
        }else if ('MissingUsernameError' == err.name){
          return res.render('index', {LoginError: '', RegisterError: 'Заполните все поля'});
        }
        //res.render('authPage', {loginError: '', regError: err});
      }
>>>>>>> 357c3619e3f956719bf82bb0e3fc9c305542535c
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

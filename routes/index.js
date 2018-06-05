var express = require('express');
var router = express.Router();
var passport = require('../auth');
var mongoose = require('mongoose');
var User = require('../models/user');

/* GET home page. */
/*router.get('/trash', function(req, res, next) {
  res.cookie('login', 'Dimas', {maxAge: 100000});
  console.log(req.session)
  console.log("Куки установлены");
  next();
}, function(req, res, next){
  console.log("Вторая функция");
  res.render('index', { title: 'Express ', title1: 'Express ', title2: 'Express' });
});*/

router.get('/', function(req,res){
  if (req.user){
    res.redirect('/profile');
    res.render('index', {info: req.user});
  }else{
    res.render('authPage', {loginError: '', regError: ''});
  }
});

router.post('/login', function(req, res) {
  console.log(req.body);
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.render('authPage', {loginError: 'Неверное имя пользователя или пароль', regError: ''}); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res);
});

router.get('/register', function(req, res) {
  res.render('test_reg', {error: ''});
});

router.post('/register', function(req, res) {
  console.log(req.body);
  User.register(new User({ username : req.body.username, email: req.body.email }), req.body.password1, function(err, user) {
    if (err) {
      return res.render('authPage', {loginError: '', regError: err});
    }
    console.log('Зареган');
    passport.authenticate('local')(req, res, function () {
      res.redirect('/');
    });
  });
});

router.get('/logout', function(req, res) {
  req.logout();
  res.render('index', { info: 'Вы вышли из своей учётной записи'});
});




module.exports = router;

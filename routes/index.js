var express = require('express');
var router = express.Router();
var passport = require('../auth');
var mongoose = require('mongoose');
var User = require('../models/user');

/* GET home page. */
router.get('/trash', function(req, res, next) {
  res.cookie('login', 'Dimas', {maxAge: 100000});
  console.log(req.session)
  console.log("Куки установлены");
  next();
}, function(req, res, next){
  console.log("Вторая функция");
  res.render('index', { title: 'Express ', title1: 'Express ', title2: 'Express' });
});

router.get('/login', function(req, res) {
  res.render('test_log');
});

router.post('/login', function(req, res) {
  res.render('test_log');
});

router.get('/register', function(req, res) {
  res.render('test_reg');
});

router.post('/register', function(req, res) {
  console.log(req.body);
  User.register(new User({ username : req.body.username, email: req.body.email }), req.body.password, function(err, user) {
    if (err) {
      console.log('Ничего не вышло');
      return res.render('test_reg');
    }

    passport.authenticate('local')(req, res, function () {
      res.render('index', { title: 'Усё ', title1: 'прошло ', title2: 'нормально' });
    });
  });
});

module.exports = router;

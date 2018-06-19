var express = require('express');
var router = express.Router();
var passport = require('../auth');
var mongoose = require('mongoose');
var urlParser = require('url');
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

router.get('/login', function(req, res) {
  res.redirect('/');
});

router.post('/registration', function(req, res) {
  if (req.body.password == req.body.password1){
    User.register(new User({ username : req.body.username, email: req.body.email }), req.body.password, function(err, user) {
      if (err) {
        if ('MongoError' == err.name){
          return res.render('index', {LoginError: '', RegisterError: 'Email уже используется'});
        }else if ('UserExistsError' == err.name){
          return res.render('index', {LoginError: '', RegisterError: 'Имя занято'});
        }else if ('MissingUsernameError' == err.name){
          return res.render('index', {LoginError: '', RegisterError: 'Заполните все поля'});
        }else {
          return res.render('index', {LoginError: '', RegisterError: 'Ошибка регистрации'});
        }
      }
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

router.get('/registration', function(req, res) {
  res.redirect('/');
});

router.get('/profile', function(req, res) {
  if(req.user){
    res.render('profile', {Username: req.user.username, Email: req.user.email, Post: req.user.posts, SocialNetworks: req.user.networks.length});
  }else{
    res.redirect('/');
  }
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/history', function(req, res) {
  if(req.user){
    res.render('history', {posts: ''});
  }else{
    res.redirect('/');
  }
});

router.get('/networks', function(req, res) {
  //myurls = new url.URL ('https://oauth.vk.com/blank.html#access_token=19d113a81c0f853835288c8ec054a250c5c01e86d32559456bd49f75bbd62f61b975c54b73640931be7ee&expires_in=0&user_id=61486425&state=123456');
  //console.log(myurls.searchParams.get('access_token'));
  url = urlParser.parse('https://oauth.vk.com/blank.html#access_token=19d113a81c0f853835288c8ec054a250c5c01e86d32559456bd49f75bbd62f61b975c54b73640931be7ee&expires_in=0&user_id=61486425&state=123456');

  //console.log(url.searchParams('access_token'));
  tmp = url.hash.split('&');
  console.log(tmp);
  token = tmp[0].split("=");
  id_user = tmp[2].split("=");
  console.log('Переход');
  res.send(id_user);
});

router.post('/networks', function(req, res) {
  console.log(req);
});

module.exports = router;

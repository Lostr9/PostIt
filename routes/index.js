var express = require('express');
var router = express.Router();
var passport = require('../auth');
var mongoose = require('mongoose');
var urlParser = require('url');
var User = require('../models/user');
var request = require('request');
var md5 = require('md5');
var base64 = require('base-64');
var utf8 = require('utf8');

router.get('/', function(req,res){
  if (req.user){
    res.redirect('/profile');
  }else{
    res.render('index', {LoginError: '', RegisterError: '', username: '', email: '', regUsername: ''});
  }
});

router.post('/login', function(req, res) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.render('index', {LoginError: 'Неверное имя пользователя или пароль', RegisterError: '', username: req.body.username, email: '', regUsername: ''});}//res.render('authPage', {loginError: 'Неверное имя пользователя или пароль', regError: ''}); }
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
          return res.render('index', {LoginError: '', RegisterError: 'Email уже используется', username: '', email: req.body.email, regUsername: req.body.username});
        }else if ('UserExistsError' == err.name){
          return res.render('index', {LoginError: '', RegisterError: 'Имя занято', username: '', email: req.body.email, regUsername: req.body.username});
        }else if ('MissingUsernameError' == err.name){
          return res.render('index', {LoginError: '', RegisterError: 'Заполните все поля', username: '', email: req.body.email, regUsername: req.body.username});
        }else {
          return res.render('index', {LoginError: '', RegisterError: 'Ошибка регистрации', username: '', email: req.body.email, regUsername: req.body.username});
        }
      }
      passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.render('index', {LoginError: 'Неверное имя пользователя или пароль', RegisterError: '', username: req.body.username, email: '', regUsername: ''});}//res.render('authPage', {loginError: 'Неверное имя пользователя или пароль', regError: ''}); }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect('/');
        });
      })(req, res);
    });
  }
  else{
    res.render('index', {LoginError: '', RegisterError: 'Пароли не совпадают', username: '', email: req.body.email, regUsername: req.body.username});
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

router.get('/networks', function(req, res){
  if (!req.user) res.redirect('/');
  res.render('networks');
});

router.get('/networks/vk', function(req, res){
  if (!req.user) res.redirect('/');
  res.render('vk');
});

router.post('/networks/vk', function(req, res){
  //console.log(req.body);
  url =  req.body.url.split('#');
  url_hash = url[1].split('&')
  token = url_hash[0].split('=');
  id = url_hash[2].split('=');

  request({
      method: 'POST',
      uri: 'https://api.vk.com/method/users.get?user_ids=' + id[1] + '&fields=first_name,last_name&v=5.80&access_token=' + token[1]
  }, function (error, response, body) {
    if(error) console.log("Произошла ошибка");
    response.body = JSON.parse(response.body);
    User.findOne({'username': req.user.username}, function (err, user) {//,'networks.name': 'Valera'}, function (err, user) {
      isNew = true;
      for (i = 0; i < user.networks.length; i++){
        if (user.networks[i].title == 'VK'){
          if(user.networks[i].id == id[1]){
            user.networks.token = token[1];
            isNew = false;
          }
        }
      }
      if(isNew){
        user.networks.push({
                                name: response.body.response[0].first_name,
                                surname: response.body.response[0].last_name,
                                title: 'VK',
                                access_token:token[1],
                                id: id[1]
                              })
        console.log("Аккаунт добавлен");
      }else{
        console.log("Такой аккаунт уже есть");
      }
      user.save(function (err) {
        if (err) return handleError(err)
        console.log('Запись изменена');
        res.redirect('/post');
      });
    });
  });
});

router.get('/post', function(req, res){
  if (!req.user) res.redirect('/');
  res.render('post');
});

router.post('/post', function(req, res){
  //req.body.post
  postUrlEncode = encodeURI(req.body.post);
  User.findOne({'username': req.user.username}, function (err, user) {//,'networks.name': 'Valera'}, function (err, user) {
    for (i = 0; i < user.networks.length; i++){
      if (user.networks[i].title == 'VK'){
        console.log('https://api.vk.com/method/wall.post?' + 'owner_ids=' + user.networks[i].id + '&message=' + postUrlEncode + '&signed=1&v=5.80&access_token=' + user.networks[i].access_token);
        request({
            method: 'POST',
            uri: 'https://api.vk.com/method/wall.post?' + 'owner_ids=' + user.networks[i].id + '&message=' + postUrlEncode + '&signed=1&v=5.80&access_token=' + user.networks[i].access_token
        }, function (error, response, body) {
          if (error) console.log(error);
          response.body = JSON.parse(response.body);
          console.log(response.body);
          if(response.body.response.id){
            console.log('Запись размещена');
          }else {
            console.log('Произошла ошибка');
          }
        });
      }
    }
  });
});








/*router.get('/networks', function(req, res) {
  //myurls = new url.URL ('https://oauth.vk.com/blank.html#access_token=19d113a81c0f853835288c8ec054a250c5c01e86d32559456bd49f75bbd62f61b975c54b73640931be7ee&expires_in=0&user_id=61486425&state=123456');
  //console.log(myurls.searchParams.get('access_token'));
  //  url = urlParser.parse('https://oauth.vk.com/blank.html#access_token=19d113a81c0f853835288c8ec054a250c5c01e86d32559456bd49f75bbd62f61b975c54b73640931be7ee&expires_in=0&user_id=61486425&state=123456');

  //console.log(url.searchParams('access_token'));
  //tmp = url.hash.split('&');
  //console.log(tmp);
  //token = tmp[0].split("=");
  //id_user = tmp[2].split("=");
  //console.log("Начало url");
  //console.log(req.url);
  //console.log("конец url");
  code = req.url.split('=');
  console.log(code[1]);
  request({
      method: 'POST',
      uri: 'https://api.ok.ru/oauth/token.do?client_id=1267916544&client_secret=515B5D2D805C1BFF510F58B1&redirect_uri=http://127.0.0.1:5000/networks&grant_type=authorization_code&code=' + code[1]
  }, function (error, response, body) {
    console.log(response.url);
    console.log(response.body);
    console.log(body);
  });
  //res.redirect('https://api.ok.ru/oauth/token.do?client_id=1267916544&client_secret=515B5D2D805C1BFF510F58B1&redirect_uri=http://127.0.0.1:5000/networks/ok&grant_type=authorization_code&code=' + code[1]);
  //res.send(id_user);
  console.log(req.url);
  console.log(req.body);
  res.send('OK');
});

router.post('/networks', function(req, res) {
  console.log(req);
});

router.get('/networks/ok', function(req, res) {
  //myurls = new url.URL ('https://oauth.vk.com/blank.html#access_token=19d113a81c0f853835288c8ec054a250c5c01e86d32559456bd49f75bbd62f61b975c54b73640931be7ee&expires_in=0&user_id=61486425&state=123456');
  //console.log(myurls.searchParams.get('access_token'));
  var text = '{"media": [{"type": "text","text": "1"}]}';
  var bytes = utf8.encode(text);
  var encoded = base64.encode(bytes);
  //console.log(encoded);
  console.log(md5("st.attachment=eyJtZWRpYSI6IFt7InR5cGUiOiAidGV4dCIsInRleHQiOiAiMSJ9XX0=140eaecd6fcbe2fc8259f5dd3d74cda6"));
  res.send('OK');
});
*/
module.exports = router;

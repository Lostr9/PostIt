var express = require('express');
var router = express.Router();
var passport = require('../auth');
var mongoose = require('mongoose');
var urlParser = require('url');
var User = require('../models/user');
var Post = require('../models/post');
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
    if (!user) { return res.render('index', {LoginError: 'Неверное имя пользователя или пароль', RegisterError: '', username: req.body.username, email: '', regUsername: ''});}
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
        if (!user) { return res.render('index', {LoginError: '', RegisterError: 'Ошибка регистрации', username: '', email: req.body.email, regUsername: req.body.username});}
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
    Post.find({'author': req.user._id}, function (err, posts) {
      data = [];
      for(var i = 0; i < posts.length; i++){
        data[i] = {}
        data[i].text = posts[i].text;
        data[i].date = posts[i].postDate.getDate() + ".0" + posts[i].postDate.getMonth() + "." + posts[i].postDate.getFullYear() + "  " + posts[i].postDate.getHours() + ":" + posts[i].postDate.getMinutes();
        data[i].VK = posts[i].VK;
        data[i].OK = posts[i].OK;
        data[i].FB = posts[i].FB;
      }
      res.render('history', {posts: data});
    });
  }else{
    res.redirect('/');
  }
});

router.get('/networks', function(req, res){
  if (!req.user) res.redirect('/');
  Facebook = false;
  Vkontakte = false;
  Odnokclass = false;
  for (i = 0; i < req.user.networks.length; i++){
    if (req.user.networks[i].title == 'VK') Vkontakte = true;
    if (req.user.networks[i].title == 'FB') Facebook = true;
    if (req.user.networks[i].title == 'OK') Odnokclass = true;
  }
  res.render('networks', {vk: Vkontakte, ok: Odnokclass, fb: Facebook});
});

router.post('/networks/del', function(req, res){
  User.findOne({'username': req.user.username}, function (err, user) {
    isNew = true;
    for (i = 0; i < user.networks.length; i++){
      if (user.networks[i].title == req.body.net){
        user.networks[i].remove();
      }
    }
    user.save(function (err) {
      if (err) return handleError(err)
      res.redirect('/networks');
    });
  });
});

router.get('/networks/vk', function(req, res){
  if (!req.user) res.redirect('/');
  res.render('vk', {error: ""});
});

router.post('/networks/vk', function(req, res){
  try {
    url =  req.body.url.split('#');
    url_hash = url[1].split('&')
    token = url_hash[0].split('=');
    id = url_hash[2].split('=');
  }
  catch (e) {
    res.render('vk', {error: "Некорректный URL"});
  }


  request({
      method: 'POST',
      uri: 'https://api.vk.com/method/users.get?user_ids=' + id[1] + '&fields=first_name,last_name&v=5.80&access_token=' + token[1]
  }, function (error, response, body) {
    if(error) console.log("Произошла ошибка");
    response.body = JSON.parse(response.body);
    User.findOne({'username': req.user.username}, function (err, user) {
      isNew = true;
      for (i = 0; i < user.networks.length; i++){
        if (user.networks[i].title == 'VK'){
          if(user.networks[i].id == id[1]){
            isNew = false;
          }
        }
      }
      if(isNew){
        user.networks.push({
                                name: response.body.response[0].first_name,
                                surname: response.body.response[0].last_name,
                                title: 'VK',
                                access_token: token[1],
                                id: id[1]
                              });
      }
      user.save(function (err) {
        if (err) return handleError(err)
        res.redirect('/networks');
      });
    });
  });
});

router.get('/post', function(req, res){
  if (!req.user) res.redirect('/');
  res.render('post');
});

router.post('/post', function(req, res, next){
  if(req.body.post){
    User.update({username: req.user.username},
    {
      posts: req.user.posts + 1
    }, function (err){ console.log(err); });

    Post.create({ //создание новой записи в коллекции Posts
        author: req.user._id,
        text: req.body.post,
        VK: req.body.vk,
        FB: req.body.fb,
        OK: req.body.ok
    }, function(err, post){ console.log(err); });

    postUrlEncode = encodeURI(req.body.post);

    if(req.body.vk){
        for (i = 0; i < req.user.networks.length; i++){
          if (req.user.networks[i].title == 'VK'){
            request({
                method: 'POST',
                uri: 'https://api.vk.com/method/wall.post?' + 'owner_ids=' + req.user.networks[i].id + '&message=' + postUrlEncode + '&signed=1&v=5.80&access_token=' + req.user.networks[i].access_token
            }, function (error, response, body) {
              if (error) console.log(error);
              response.body = JSON.parse(response.body);
              if(response.body.response.post_id != undefined){
                console.log('Запись размещена');
              }else {
                console.log('Произошла ошибка');
              }
            });
          }
        }
      }
      next();
  }
  res.render('post');
  }, function(req, res, next) {
    if (req.body.fb){
      for (i = 0; i < req.user.networks.length; i++){
        if (req.user.networks[i].title == 'FB'){
          request({
              method: 'POST',
              uri: 'https://graph.facebook.com/v3.0/me/feed?message=' + postUrlEncode + '&access_token=' + req.user.networks[i].access_token
          }, function (error, response, body) {
            if (error) console.log(error);
            response.body = JSON.parse(response.body);
            try {
              if(response.body.id != undefined)
                console.log('Запись размещена');
            } catch (e) {
              console.log('Произошла ошибка');
            }
          });
        }
      }
    }
    next();
  }, function(req, res) {
    if (req.body.ok){
      for (i = 0; i < req.user.networks.length; i++){
        if (req.user.networks[i].title == 'OK'){

          postOk = '{"media": [{"type": "text", "text": "' + req.body.post + '"}]}';
          bytes = utf8.encode(postOk);
          postOk = base64.encode(bytes);
          sig = md5("st.attachment=" + postOk + "st.return=" + 'https://www.post-it.tmweb.ru/profile' + '515B5D2D805C1BFF510F58B1');
          res.redirect('https://connect.ok.ru/dk?st.cmd=WidgetMediatopicPost&st.app=1267916544&st.attachment=' + postOk + '&st.return=https://www.post-it.tmweb.ru/profile&st.signature=' + sig + '&st.silent=no&st.popup=off');
        }
      }
    }
    res.redirect('/profile');
  });

router.get('/networks/fb', function(req, res){
  code = req.url.split('?');
  code = code[1];
  code = code.split('#');
  code = code[0];
  code = code.split('=');
  code = code[1];

  request({
      method: 'get',
      uri: 'https://graph.facebook.com/v3.0/oauth/access_token?client_id=1869237853122425&redirect_uri=https://www.post-it.tmweb.ru/networks/fb&client_secret=5f96a2f0444f20e05cae93f6d0a9241a&code=' + code
  }, function (error, response, body) {
    if(error) console.log("Произошла ошибка");
    response.body = JSON.parse(response.body);
    token = response.body.access_token;

    request({
        method: 'POST',
        uri: 'https://graph.facebook.com/v3.0/me?fields=id%2Cfirst_name%2Clast_name&access_token=' + token
    }, function (error, response, body) {
      if(error) console.log("Произошла ошибка");
      response.body = JSON.parse(response.body);

      User.findOne({'username': req.user.username}, function (err, user) {
        isNew = true;
        for (i = 0; i < user.networks.length; i++){
          if (user.networks[i].title == 'FB'){
            if(user.networks[i].id == response.body.id){
              isNew = false;
            }
          }
        }
        if(isNew){
          user.networks.push({
                                  name: response.body.first_name,
                                  surname: response.body.last_name,
                                  title: 'FB',
                                  access_token: token,
                                  id: response.body.id
                                })
        }else{
        }
        user.save(function (err) {
          if (err) return handleError(err)
          res.redirect('/networks');
        });
      });
    });
  });
});

router.get('/networks/ok', function(req, res){

  code = req.url.split('=');
  code = code[1];

  request({
      method: 'post',
      uri: 'https://api.ok.ru/oauth/token.do?code=' + code + '&client_id=1267916544&client_secret=515B5D2D805C1BFF510F58B1&redirect_uri=https://www.post-it.tmweb.ru/networks/ok&grant_type=authorization_code'
  }, function (error, response, body) {
    if(error) console.log("Произошла ошибка");
    response.body = JSON.parse(response.body);
    token = response.body.access_token;

    secret_key  = md5('515B5D2D805C1BFF510F58B1' + token);
    sig = md5('application_key=CBAQNDJMEBABABABAfields=first_name, last_name, url_profileformat=jsonmethod=users.getCurrentUser' + secret_key);

    request({
        method: 'get',
        uri: 'https://api.ok.ru/fb.do?application_key=CBAQNDJMEBABABABA&fields=first_name%2C%20last_name%2C%20url_profile&format=json&method=users.getCurrentUser&sig=' + sig + '&access_token=' + token
    }, function (error, response, body) {
      if(error) console.log("Произошла ошибка");
      response.body = JSON.parse(response.body);
      User.findOne({'username': req.user.username}, function (err, user) {
        isNew = true;
        for (i = 0; i < user.networks.length; i++){
          if (user.networks[i].title == 'OK'){
            if(user.networks[i].id == response.body.uid){
              isNew = false;
            }
          }
        }
        if(isNew){
          user.networks.push({
                                  name: response.body.first_name,
                                  surname: response.body.last_name,
                                  title: 'OK',
                                  access_token: token,
                                  id: response.body.uid
                                })
        }else{
        }
        user.save(function (err) {
          if (err) return handleError(err)
          res.redirect('/networks');
        });
      });
    });
  });
});

module.exports = router;

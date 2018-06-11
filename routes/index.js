var express = require('express');
var router = express.Router();
var passport = require('../auth');
var mongoose = require('mongoose');
var User = require('../models/user');

router.get('/', function(req,res){
  if (req.user){
    res.redirect('/profile');
    res.render('index', {info: req.user});
  }else{
    res.render('authPage', {loginError: '', regError: ''});
  }
});


module.exports = router;

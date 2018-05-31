var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var SocialNetworks = new Schema({
  name: {
    type: String,
    require: true
  },
  surname: {
    type: String,
    default: null
  },
  title: {
    type: String,
    require: true
  },
  access_token: {
    type: String
  },
  id: {
    type: Number,
    unique: true,
    require: true
  }
});

var SocialNetworks = new Schema({
  name: {
    type: String,
    require: true
  },
  surname: {
    type: String,
    default: null
  },
  title: {
    type: String,
    require: true
  },
  access_token: {
    type: String
  },
  id: {
    type: Number,
    unique: true,
    require: true
  }
});

var User = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
      type: String,
      unique: true,
      required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  posts: {
      type: Number,
      default: 0
  },
  password: String,
  Networks: [SocialNetworks]
});

<<<<<<< HEAD
User.plugin(passportLocalMongoose);
=======
//User.plugin(passportLocalMongoose);
>>>>>>> 427c2e19fb45c846e01bb63b2b26ae55dded8b91

module.exports = mongoose.model('users', User);

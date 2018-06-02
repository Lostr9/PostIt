var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var SocialNetworks = new Schema({
  name: {
    type: String,
    require: true,
    default: 'name'
  },
  surname: {
    type: String,
    default: 'null'
  },
  title: {
    type: String,
    require: true,
    default: 'title'
  },
  access_token: {
    type: String,
    default: 'token'
  },
  id: {
    type: Number,
    //unique: true,
    default: '1111',
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
  Networks: {
    type: [SocialNetworks],
    unique: false,
    required: false
  }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', User);

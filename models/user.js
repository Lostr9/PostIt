var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var SocialNetworks = new Schema({
  name: {
    type: String,
    require: true
  },
  surname: {
    type: String
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
    //unique: true,
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
  networks: {
    type: [SocialNetworks],
    unique: false,
    required: false
  }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', User);

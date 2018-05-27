var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
  password: String
});

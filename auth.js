var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var User = require('./models/user');

// passport config
/*assport.use(new LocalStrategy(
  function(username, password, done){
    User.findOne({username: username}, function(err, user){
      if (err) return done(err);
      if (!user){
        return done (null, false, {message: ''})
      }
    });
  }
));*/
passport.use(new LocalStrategy(User.authenticate()));

/*passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      console.log(user.methods.setPassword(password));
      if (user.authenticate(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));*/



passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport;

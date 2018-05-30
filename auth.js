var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');

app.use(passport.initialize());
app.use(passport.session());

// passport config
var User = require('./models/user');
passport.use(new LocalStrategy(
  function(username, password, done){
    User.findOne({username: username}, function(err, user){
      if (err) return done(err);
      if (!user){
        return done (null, false, {message: ''})
      }
    });
  }
));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport;

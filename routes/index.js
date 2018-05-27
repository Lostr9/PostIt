var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/trash', function(req, res, next) {
  res.cookie('login', 'Dimas', {maxAge: 100000});
  console.log(req.session)
  console.log("Куки установлены");
  next();
}, function(req, res, next){
  console.log("Вторая функция");
  res.render('index', { title: 'Express ', title1: 'Express ', title2: 'Express' });
});



module.exports = router;

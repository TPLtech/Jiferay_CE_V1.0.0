var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var http = require('http');



var users_mailer = require('./routes/users_mailer');
var users_mysql = require('./routes/users_mysql');
var users_qrcode = require('./routes/users_qrcode');
var users_skebby = require('./routes/users_skebby');
var users_content = require('./routes/users_content');
var users_sinlog = require('./routes/users_sinlog');
var users_lang = require('./routes/users_lang');

var app = express();



app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
});



var flash = require('connect-flash');
var engines = require('consolidate');


app.set('views', __dirname + '/views');
app.engine('html', engines.mustache);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs'); // set up ejs for templating
app.use(flash()); // use connect-flash for flash messages stored in session



app.use('/', users_mailer);
app.use('/', users_mysql);
app.use('/', users_qrcode);
app.use('/', users_skebby);
app.use('/', users_content);
app.use('/', users_sinlog); //Al posto di users_Rpassport
app.use('/', users_lang);



global.company = "Company";

global.mailer_userMail = "mail@mail.com";
global.mailer_userMailPw = "password$";

global.skebby_number = "1234567890";
global.skebby_mail = "mail@mail.com";
global.skebby_mailPw = "password";



// view engine setup
app.get('/', function(req, res) {
  res.render('index.html');
});

process.env.PORT = 8084;

console.log("Server listening on process.env.PORT: " + process.env.PORT + " - process.env.IP: " + process.env.IP);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;

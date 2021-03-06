var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
var MongoStore =require('connect-mongo')(session);

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var superadminRouter = require('./routes/superadmin');


let mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;
db.on('error',console.error.bind(console, 'MongoDB connection error.....'));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
	session({
		secret: 'secret',
		resave: true,
		saveUninitialized: true,
		store: new MongoStore({mongooseConnection:mongoose.connection}),
		cookie:{maxAge: 180*60*1000}
	})
	);
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
	res.locals.getDateCreated = function(date_time){
		var dd = String(date_time.getDate()).padStart(2, '0');
		var mm = String(date_time.getMonth() + 1).padStart(2, '0');
		var yyyy = date_time.getFullYear();
		return dd + '/' + mm + '/' + yyyy;
	}
	next();
})

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/superadmin',superadminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

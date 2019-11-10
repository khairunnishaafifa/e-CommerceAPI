var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')

// .env
require('dotenv').config()

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/v1/users');
var productsRouter = require('./routes/v1/products');
var cartsRouter = require('./routes/v1/carts');
var ordersRouter = require('./routes/v1/orders');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/carts', cartsRouter);
app.use('/orders', ordersRouter);

// db env
const env = process.env.NODE_ENV || "development";

if (env == 'development' || env == 'test') {
  require('dotenv').config()
}

const configDB = {
  development: process.env.DB_DEV,
  test: process.env.DB_TEST,
  production: process.env.DB_PROD
}

const dbConnection = configDB[env];

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

// database connection
mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useNewUrlParser', true)
mongoose.set('useUnifiedTopology', true)
mongoose.connect(dbConnection)
  .then(() => console.log('Database connection successful'))

module.exports = app;

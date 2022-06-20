/* eslint-disable no-console */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');

//multer or image uploade in data base requirement//
const multer = require('multer') 

//when we want upload any images of the product we will use fileUpload module //
const fileUpload = require('express-fileupload')

//session reqirement//
const session= require('express-session')
// mongoose  connection//
const mongoose = require('mongoose');

const db = mongoose.connection;

// Router creation on admin,user,vendor //
const adminRouter = require('./routes/admin');
const userRouter = require('./routes/user');
const vendorRouter = require('./routes/vendor');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs', defaultLayout: 'layout', layoutDir: `${__dirname}/views/layout/`, partialsDir: `${__dirname}/views/partials/`,
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//creating session//
app.use(session({
  secret:"key",
  resave:false,
  saveUninitialized:false,
  cookie:{maxAge:6000000}
}))

// Mongoose connecting code//
mongoose.connect('mongodb://localhost:27017/Lapstore');
db.on('error', console.error.bind(console, 'connection error'));

db.once('open', () => {
  console.log('Connection Successfully');
});

app.use('/admin', adminRouter);
app.use('/', userRouter);
app.use('/vendor', vendorRouter);
app.use(fileUpload()) //file upload module using//

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error')
});

module.exports = app;

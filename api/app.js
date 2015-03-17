// ReClo: user_authentication
// --------------------------
// Express RestAPI middleware
// v1.0.0
// Carlton Duffett
// 2-25-2015

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// define API routes
var index = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var register = require('./routes/register');
var backups = require('./routes/backups');
// var recovery = require('./routes/recovery');

var app = express();

// set port to listen on
app.set('port',3000);

// currently in development mode
app.set('env','development');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// serve static content
app.use(express.static(path.join(__dirname, 'public')));

// REST API routes
app.use('/', index);
app.use('/login',login);
app.use('/logout',logout);
app.use('/register',register);
app.use('/backups',backups);
// app.use('/recovery',recovery);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

console.log('user_authentication server running!');
console.log('Listening on port: ' + app.get('port'));

module.exports = app;

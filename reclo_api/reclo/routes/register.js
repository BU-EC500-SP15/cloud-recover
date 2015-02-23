var express = require('express');
var router = express.Router();
var corelib = require('../lib/core.js');
var TABLE = require('../lib/TABLE.js');
var KEY = require('../lib/KEY.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;


var PasswordHash = require('phpass').PasswordHash;
var pw = 'abc123';
var pwhash = new PasswordHash();
var hash = pwhash.hashPassword(pw);
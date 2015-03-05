var express = require('express');
var router = express.Router();
var corelib = require('../lib/core.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'reclo'});
});

module.exports = router;

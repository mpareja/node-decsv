var scanner = require('./scanner');
var parser = require('./parser');
var combiner = require('stream-combiner');
var map = require('../csv_fixer/node_modules/map-stream');

module.exports = function () {
  var s = scanner(),
    p = parser(),
    c = combiner(s, p);

  // open up a seam for debugging
  c._scanner = s;
  c._parser = p;
  return c;
};
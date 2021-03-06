var scanner = require('./scanner');
var parser = require('./parser');
var combiner = require('stream-combiner');

module.exports = function (delimiter) {
  var s = scanner(delimiter || ','),
    p = parser(),
    c = combiner(s, p);

  // open up a seam for debugging
  c._scanner = s;
  c._parser = p;
  return c;
};

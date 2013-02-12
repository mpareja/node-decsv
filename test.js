var async = require('async');
var decsv = require('./');
var expect = require('chai').expect;
var queue = [];

test('first,second,third', [['first', 'second', 'third']]);
test('first,second,third\nfourth,fifth', [['first', 'second', 'third'], ['fourth', 'fifth']]);
test('first,second,third\r\nfourth,fifth', [['first', 'second', 'third'], ['fourth', 'fifth']]);
test('first,second,third\rfourth,fifth', [['first', 'second', 'third'], ['fourth', 'fifth']]);
test('first,second,third\rfourth,fifth\n', [['first', 'second', 'third'], ['fourth', 'fifth']]);
test('first,second,third\rfourth,fifth\nanother,andother', [['first', 'second', 'third'], ['fourth', 'fifth'], ['another', 'andother']]);
test('"first",second,third', [['first', 'second', 'third']]);
test('"first",s"econd,third', [['first', 's"econd', 'third']]);
test('"first","second",third', [['first', 'second', 'third']]);
test('first,"seco\nnd",third', [['first', 'seco\nnd', 'third']]);
test('first,"seco,nd",third', [['first', 'seco,nd', 'third']]);

run();

function test(input, expected) {
  queue.push({input: input, expected: expected});
}

function run() {
  var fns = queue.map(function (test) {
    return function (cb) {
      var d = decsv();
      var found = [], errors = [], scanned = [], parsed = [];
      d.on('data', function (values) {
        found.push(values);
      });
      d.on('end', function () {
        try {
          expect(found).to.deep.equal(test.expected);
          cb(null);
        } catch (e) {
          console.log('scanned:'); console.log(scanned);
          console.log('parsed:'); console.log(parsed);
          cb(e);
        }
      });
      d.on('error', function (err) {
        errors.push(err);
      });
      d._scanner.on('data', function (data) { scanned.push(data); });
      d._parser.on('data', function (data) { parsed.push(data); });
      d.write(test.input);
      d.end();
    };
  });
  async.series(fns, function (err) {
    if (err) {
      console.log('FAIL!');
      console.log(err.message);
      process.exit(1);
    } else {
      console.log('Pass.');
      process.exit(0);
    }
  });
}


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

var tests = generateTests().concat(testErrors);
async.series(tests, function (err) {
  if (err) {
    console.log('FAIL!');
    console.log(err.message);
    process.exit(1);
  } else {
    console.log('Pass.');
    process.exit(0);
  }
});

function test(input, expected) {
  queue.push({input: input, expected: expected});
}

function testErrors(cb) {
  var s = decsv();
  s.on('data', function () {
    cb(new Error('Should not have received incomplete data'));
  });
  s.on('error', function (e) {
    cb(null);
  });
  s.on('end', function () {
    cb(new Error('End called before error.'));
  });
  s.write('"first');
  s.end();
}

function generateTests() {
  return queue.map(function (test) {
    return function (cb) {
      var d = decsv();
      var found = [], scanned = [], parsed = [];
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
          console.log('input:' + test.input);
          console.log('expected:' + test.expected);
          cb(e);
        }
      });
      d.on('error', function (err) {
        console.log('scanned:'); console.log(scanned);
        console.log('parsed:'); console.log(parsed);
        console.log('input:' + test.input);
        console.log('expected:' + test.expected);
        cb(err);
      });
      d._scanner.on('data', function (data) { scanned.push(data); });
      d._parser.on('data', function (data) { parsed.push(data); });
      d.write(test.input);
      d.end();
    };
  });
}


var through = require('through');

function Parser(tokens) {
  var i = 0;
  var t = tokens.length > 0 ? tokens[0] : null;
  var self = this;

  self.parse = function () {
    if (t === null) { return null; }
    switch (t.type) {
    case 'literal':
      var value = t.value;
      consume();
      if (t === null) { return nodify('unterminatedCell', value); }
      switch (t.type) {
      case 'separator':
        consume();
        return nodify('cell', value);
      case 'eol':
        consume();
        return nodify('lastcell', value);
      case 'literal':
        self.emit('error', new Error('Unexpected literal after a literal. (position: ' + t.position + ')'));
        return self.parse(); // skip first literal
      default:
        throw new Error('Unexpected token: ' + t.type);
      }
    case 'separator':
      consume();
      return nodify('cell', '');
    case 'eol':
      consume();
      return nodify('lastcell', '');
    default:
      throw new Error('Unexpected token: ' + t.type);
    }
  };

  self.position = function () { return i; };

  function nodify(type, value) {
    var node = { type: type };
    if (value !== undefined) {
      node.value = value;
    }
    return node;
  }

  function consume() {
    i++;
    t = i < tokens.length ? tokens[i] : null;
  }
}

module.exports = function () {
  var buffer = [];

  function main() {
    return through(ondata, onend);
  }

  function ondata(newTokens) {
    var tokens = buffer.concat(newTokens);
    var parser = new Parser(tokens);
    var values = [], committed = 0, node;

    while ((node = parser.parse()) && node.type !== 'unterminatedCell') {
      values.push(node.value);
      if (node.type === 'lastcell') {
        this.queue(values);
        values = [];
        committed = parser.position();
      }
    }
    buffer = tokens.slice(committed);
  }

  function onend() {
    var parser = new Parser(buffer);
    var values = [], node;

    // accept unterminatedCell and include in row values
    while (node = parser.parse()) {
      values.push(node.value);
    }

    buffer = [];
    if (values.length) {
      this.queue(values);
    }
    this.queue(null); // end
  }

  return main();
};


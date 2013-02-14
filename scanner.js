var through = require('through');
module.exports = function () {
  var buffer = '';
  var position = 0;

  return through(ondata, onend);

  function ondata(data) {
    data = buffer + data;
    var i = 0;
    var c = data.length > 0 ? data[0] : null;
    var self = this;

    main();

    function main() {
      var tokens = [], committed = 0, token;
      for (token = scan(); token; token = scan()) {
        tokens.push(token);
        token.position = position + committed + 1;
        committed = i;
      }
      buffer = data.substring(committed);
      position += i;
      if (tokens.length > 0) {
        self.queue(tokens);
      }
    }

    function scan() {
      if (c === null) { return null; }
      switch (c) {
      case '"': return quote();
      case ',': return separator();
      case '\n': return eol('\r');
      case '\r': return eol('\n');
      default: return unquoted();
      }
    }

    function quote() {
      var literal = '';
      while (consume()) {
        switch (c) {
        case '"':
          consume();
          return tokenize('literal', literal);
        case '\\':
          consume(); // \
          if (c === null) {
            return null;
          } else if (c === '"') {
            literal += '"';
            consume(); // "
          } else {
            literal += "\\" + c;
            consume();
          }
          break;
        default:
          literal += c;
          break;
        }
      }
      return null;
    }

    function eol(optionalChar) {
      consume(); // \r or \n
      if (c === null) {
        // wait for more input before deciding if this is the whole line-feed
        return null;
      }
      if (c === optionalChar) {
        consume();
      }
      return tokenize('eol');
    }

    function unquoted() {
      var literal = c;
      while (consume() && c !== ',' && c !== '\n' && c !== '\r') {
        literal += c;
      }
      return tokenize('literal', literal);
    }

    function separator() {
      consume();
      return tokenize('separator');
    }

    function consume() {
      i++;
      c = i < data.length ? data[i] : null;
      return c !== null;
    }

  }

  function onend() {
    if (!buffer) {
      this.queue(null); // end
    } else if (buffer === '\r' || buffer === '\n') {
      this.queue(tokenize('eol'));
      this.queue(null); // end
    } else {
      this.emit('error', new Error('Unexpected end of stream: "' + buffer + '"'));
    }
  }
};

function tokenize(type, value) {
  var token = { type: type };
  if (value !== undefined) {
    token.value = value;
  }
  return token;
}

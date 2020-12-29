var tokenize = require('simple-html-tokenizer/lib/simple-html-tokenizer/tokenize').default;

module.exports = function(input) {
  return tokenize(input);
};

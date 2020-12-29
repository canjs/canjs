import EventedTokenizer from './evented-tokenizer';

function Tokenizer(entityParser, options) {
  this.token = null;
  this.startLine = 1;
  this.startColumn = 0;
  this.options = options || {};
  this.tokenizer = new EventedTokenizer(this, entityParser);
}

Tokenizer.prototype = {
  tokenize: function(input) {
    this.tokens = [];
    this.tokenizer.tokenize(input);
    return this.tokens;
  },

  tokenizePart: function(input) {
    this.tokens = [];
    this.tokenizer.tokenizePart(input);
    return this.tokens;
  },

  tokenizeEOF: function() {
    this.tokens = [];
    this.tokenizer.tokenizeEOF();
    return this.tokens[0];
  },

  reset: function() {
    this.token = null;
    this.startLine = 1;
    this.startColumn = 0;
  },

  addLocInfo: function() {
    if (this.options.loc) {
      this.token.loc = {
        start: {
          line: this.startLine,
          column: this.startColumn
        },
        end: {
          line: this.tokenizer.line,
          column: this.tokenizer.column
        }
      };
    }
    this.startLine = this.tokenizer.line;
    this.startColumn = this.tokenizer.column;
  },

  // Data

  beginData: function() {
    this.token = {
      type: 'Chars',
      chars: ''
    };
    this.tokens.push(this.token);
  },

  appendToData: function(char) {
    this.token.chars += char;
  },

  finishData: function() {
    this.addLocInfo();
  },

  // Comment

  beginComment: function() {
    this.token = {
      type: 'Comment',
      chars: ''
    };
    this.tokens.push(this.token);
  },

  appendToCommentData: function(char) {
    this.token.chars += char;
  },

  finishComment: function() {
    this.addLocInfo();
  },

  // Tags - basic

  beginStartTag: function() {
    this.token = {
      type: 'StartTag',
      tagName: '',
      attributes: [],
      selfClosing: false
    };
    this.tokens.push(this.token);
  },

  beginEndTag: function() {
    this.token = {
      type: 'EndTag',
      tagName: ''
    };
    this.tokens.push(this.token);
  },

  finishTag: function() {
    this.addLocInfo();
  },

  markTagAsSelfClosing: function() {
    this.token.selfClosing = true;
  },

  // Tags - name

  appendToTagName: function(char) {
    this.token.tagName += char;
  },

  // Tags - attributes

  beginAttribute: function() {
    this._currentAttribute = ["", "", null];
    this.token.attributes.push(this._currentAttribute);
  },

  appendToAttributeName: function(char) {
    this._currentAttribute[0] += char;
  },

  beginAttributeValue: function(isQuoted) {
    this._currentAttribute[2] = isQuoted;
  },

  appendToAttributeValue: function(char) {
    this._currentAttribute[1] = this._currentAttribute[1] || "";
    this._currentAttribute[1] += char;
  },

  finishAttributeValue: function() {
  }
};

export default Tokenizer;

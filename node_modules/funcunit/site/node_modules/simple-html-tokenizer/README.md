# Simple HTML Tokenizer [![Build Status](https://travis-ci.org/tildeio/simple-html-tokenizer.svg?branch=master)](https://travis-ci.org/tildeio/simple-html-tokenizer)

Simple HTML Tokenizer is a lightweight JavaScript library that can be
used to tokenize the kind of HTML normally found in templates. It can be
used to preprocess templates to change the behavior of some template
element depending upon whether the template element was found in an
attribute or text.

It is not a full HTML5 tokenizer. It focuses on the kind of HTML that is
used in templates: content designed to be inserted into the `<body>`
and without `<script>` tags.

In particular, Simple HTML Tokenizer does not handle many states from
the [HTML5 Tokenizer Specification][1]:

* Any states involving `CDATA` or `RCDATA`
* Any states involving `<script>`
* Any states involving `<DOCTYPE>`
* The bogus comment state

It also passes through character references, instead of trying to
tokenize and process them, because the preprocessed templates will
ultimately be parsed by a real browser context.

At the moment, there are some error states specified by the tokenizer
spec that are not handled by Simple HTML Tokenizer. Ultimately, I plan
to support all error states, as well as provide information about
tokenizer errors in debug mode.

[1]: http://www.whatwg.org/specs/web-apps/current-work/multipage/tokenization.html

# Usage

You can tokenize HTML:

```js
var tokens = HTML5Tokenizer.tokenize("<div id='foo' href=bar class=\"bat\">");

var token = tokens[0];
token.tagName     //=> "div"
token.attributes  //=> [["id", "foo"], ["href", "bar"], ["class", "bat"]]
token.selfClosing //=> false
```

## Building and running the tests

```bash
npm install
npm test
```

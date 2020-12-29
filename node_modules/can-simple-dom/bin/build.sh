#!/usr/bin/env bash
node_modules/.bin/compile-modules convert -I lib -f bundle -o dist/simple-dom.js simple-dom.umd.js && \
find test -type f -iname *-test.js | xargs node_modules/.bin/compile-modules convert -I node_modules/simple-html-tokenizer/lib -I lib -I test -f bundle -o dist/simple-dom-test.js

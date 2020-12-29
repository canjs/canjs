var stache = require("can-stache");
var childNodes = require("can-child-nodes");

/*
 * polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Polyfill
 */
var ArrayFrom = Array.from ?
	Array.from :
  (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method
      // of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());

var removePlaceholderNodes = function(node){
	var children = ArrayFrom(childNodes(node));
	for(var i = 0; i < children.length; i++) {
		if(children[i].nodeType === Node.COMMENT_NODE) {
			node.removeChild(children[i]);
		} else if(children[i].nodeType === Node.ELEMENT_NODE) {
			createHelpers.removePlaceholderNodes(children[i]);
		}
	}
	return node;
};

var clone = function(node) {
	var length = childNodes(node).length;
	var cloned = node.cloneNode(true);
	var clonedChildNodes = ArrayFrom(childNodes(cloned));
	var clonedLength = clonedChildNodes.length;

	// Fix weird cloneNode bug in IE11
	if(clonedLength && clonedLength > length) {
		var first = clonedChildNodes[0];

		for(var index = 1; index < clonedLength; index++) {
			var clonedChildNode = clonedChildNodes[index];

			if (clonedChildNode.nodeType === 3) {
				first.nodeValue += clonedChildNode.nodeValue;
				clonedChildNode.parentNode.removeChild(clonedChildNode);
			}
		}
	}
	return cloned;
};

function cloneAndClean(node) {
	return removePlaceholderNodes( clone(node) );
}

var createHelpers = function(doc) {
	doc = doc || document;
	return {
		cleanHTMLTextForIE: function(html){  // jshint ignore:line
			return html.replace(/ stache_0\.\d+="[^"]+"/g,"").replace(/<(\/?[-A-Za-z0-9_]+)/g, function(whole, tagName){
				return "<"+tagName.toLowerCase();
			}).replace(/\r?\n/g,"");
		},
		getText: function(template, data, options){
			var div = document.createElement("div");
			div.appendChild( stache(template)(data, options) );
			return this.cleanHTMLTextForIE( cloneAndClean(div).innerHTML );
		},
		innerHTML: function(node){
			return "innerHTML" in node ?
				node.innerHTML :
				undefined;
		},
		removePlaceholderNodes: removePlaceholderNodes,
		cloneAndClean: cloneAndClean,
		ArrayFrom: ArrayFrom
	};
};

createHelpers.removePlaceholderNodes = removePlaceholderNodes;

module.exports = createHelpers;

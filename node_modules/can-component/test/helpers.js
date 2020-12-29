var MUTATION_OBSERVER = require('can-globals/mutation-observer/mutation-observer');
var globals = require("can-globals");
var DOCUMENT = require("can-globals/document/document");
var makeDocument = require('can-vdom/make-document/make-document');
var domMutate = require('can-dom-mutate');
var domMutateNode = require('can-dom-mutate/node');
var globals = require('can-globals');
var childNodes = require("can-child-nodes");

/*
 * polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Polyfill
 */
var ArrayFrom = /*Array.from ?
	Array.from :*/
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
			removePlaceholderNodes(children[i]);
		}
	}
	return node;
};

function cloneAndClean(node) {
	return removePlaceholderNodes( node.cloneNode(true) );
}


var helpers = {
    runTasks: function(tasks, done){
    	var nextTask = function(){
    		var next = tasks.shift();
    		next();
    		if(tasks.length) {
    			setTimeout(nextTask, 100);
    		} else {
    			done();
    		}
    	};
    	setTimeout(nextTask, 100);
    },
    makeTest: function(name, doc, mutObs, test, qUnitTest) {
        var DOC = DOCUMENT();
        //var MUT_OBS = MUTATION_OBSERVER();

    	QUnit.module(name, {
    		beforeEach: function (assert) {
    			DOCUMENT(doc);
                if(!mutObs) {
                    globals.setKeyValue("MutationObserver", mutObs);
                }


    			if(doc) {
					this.document = doc;
    				this.fixture = doc.createElement("div");
    				doc.body.appendChild(this.fixture);
    			} else {
    				this.fixture = doc.getElementById("qunit-fixture");
    			}
    		},
    		afterEach: function(assert){
    			doc.body.removeChild(this.fixture);
    			var done = assert.async();
    			setTimeout(function(){
    				done();
    				DOCUMENT(DOC);
    				globals.deleteKeyValue("MutationObserver");
    			}, 100);
    		}
    	});
        test(doc, qUnitTest);
    },
    makeTests: function(name, test) {

        helpers.makeTest(name+" - dom", document, MUTATION_OBSERVER(), test, QUnit.test);
        helpers.makeTest(name+" - vdom", makeDocument(), null, test, function(){});
    },
    afterMutation: function(cb) {
    	var doc = globals.getKeyValue('document');
    	var div = doc.createElement("div");
    	var insertionDisposal = domMutate.onNodeInsertion(div, function(){
			insertionDisposal();
    		doc.body.removeChild(div);
    		setTimeout(cb, 5);
    	});
        setTimeout(function(){
            domMutateNode.appendChild.call(doc.body, div);
        }, 10);
    },
	cloneAndClean: cloneAndClean
};
module.exports = helpers;

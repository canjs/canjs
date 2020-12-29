!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.Promise=e():"undefined"!=typeof global?global.Promise=e():"undefined"!=typeof self&&(self.Promise=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * ES6 global Promise shim
 */
var unhandledRejections = require('../lib/decorators/unhandledRejection');
var PromiseConstructor = unhandledRejections(require('../lib/Promise'));

module.exports = typeof global != 'undefined' ? (global.Promise = PromiseConstructor)
	           : typeof self   != 'undefined' ? (self.Promise   = PromiseConstructor)
	           : PromiseConstructor;

},{"../lib/Promise":2,"../lib/decorators/unhandledRejection":4}],2:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function (require) {

	var makePromise = require('./makePromise');
	var Scheduler = require('./Scheduler');
	var async = require('./env').asap;

	return makePromise({
		scheduler: new Scheduler(async)
	});

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });

},{"./Scheduler":3,"./env":5,"./makePromise":7}],3:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	// Credit to Twisol (https://github.com/Twisol) for suggesting
	// this type of extensible queue + trampoline approach for next-tick conflation.

	/**
	 * Async task scheduler
	 * @param {function} async function to schedule a single async function
	 * @constructor
	 */
	function Scheduler(async) {
		this._async = async;
		this._running = false;

		this._queue = this;
		this._queueLen = 0;
		this._afterQueue = {};
		this._afterQueueLen = 0;

		var self = this;
		this.drain = function() {
			self._drain();
		};
	}

	/**
	 * Enqueue a task
	 * @param {{ run:function }} task
	 */
	Scheduler.prototype.enqueue = function(task) {
		this._queue[this._queueLen++] = task;
		this.run();
	};

	/**
	 * Enqueue a task to run after the main task queue
	 * @param {{ run:function }} task
	 */
	Scheduler.prototype.afterQueue = function(task) {
		this._afterQueue[this._afterQueueLen++] = task;
		this.run();
	};

	Scheduler.prototype.run = function() {
		if (!this._running) {
			this._running = true;
			this._async(this.drain);
		}
	};

	/**
	 * Drain the handler queue entirely, and then the after queue
	 */
	Scheduler.prototype._drain = function() {
		var i = 0;
		for (; i < this._queueLen; ++i) {
			this._queue[i].run();
			this._queue[i] = void 0;
		}

		this._queueLen = 0;
		this._running = false;

		for (i = 0; i < this._afterQueueLen; ++i) {
			this._afterQueue[i].run();
			this._afterQueue[i] = void 0;
		}

		this._afterQueueLen = 0;
	};

	return Scheduler;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],4:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	var setTimer = require('../env').setTimer;
	var format = require('../format');

	return function unhandledRejection(Promise) {

		var logError = noop;
		var logInfo = noop;
		var localConsole;

		if(typeof console !== 'undefined') {
			// Alias console to prevent things like uglify's drop_console option from
			// removing console.log/error. Unhandled rejections fall into the same
			// category as uncaught exceptions, and build tools shouldn't silence them.
			localConsole = console;
			logError = typeof localConsole.error !== 'undefined'
				? function (e) { localConsole.error(e); }
				: function (e) { localConsole.log(e); };

			logInfo = typeof localConsole.info !== 'undefined'
				? function (e) { localConsole.info(e); }
				: function (e) { localConsole.log(e); };
		}

		Promise.onPotentiallyUnhandledRejection = function(rejection) {
			enqueue(report, rejection);
		};

		Promise.onPotentiallyUnhandledRejectionHandled = function(rejection) {
			enqueue(unreport, rejection);
		};

		Promise.onFatalRejection = function(rejection) {
			enqueue(throwit, rejection.value);
		};

		var tasks = [];
		var reported = [];
		var running = null;

		function report(r) {
			if(!r.handled) {
				reported.push(r);
				logError('Potentially unhandled rejection [' + r.id + '] ' + format.formatError(r.value));
			}
		}

		function unreport(r) {
			var i = reported.indexOf(r);
			if(i >= 0) {
				reported.splice(i, 1);
				logInfo('Handled previous rejection [' + r.id + '] ' + format.formatObject(r.value));
			}
		}

		function enqueue(f, x) {
			tasks.push(f, x);
			if(running === null) {
				running = setTimer(flush, 0);
			}
		}

		function flush() {
			running = null;
			while(tasks.length > 0) {
				tasks.shift()(tasks.shift());
			}
		}

		return Promise;
	};

	function throwit(e) {
		throw e;
	}

	function noop() {}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{"../env":5,"../format":6}],5:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/*global process,document,setTimeout,clearTimeout,MutationObserver,WebKitMutationObserver*/
(function(define) { 'use strict';
define(function(require) {
	/*jshint maxcomplexity:6*/

	// Sniff "best" async scheduling option
	// Prefer process.nextTick or MutationObserver, then check for
	// setTimeout, and finally vertx, since its the only env that doesn't
	// have setTimeout

	var MutationObs;
	var capturedSetTimeout = typeof setTimeout !== 'undefined' && setTimeout;

	// Default env
	var setTimer = function(f, ms) { return setTimeout(f, ms); };
	var clearTimer = function(t) { return clearTimeout(t); };
	var asap = function (f) { return capturedSetTimeout(f, 0); };

	// Detect specific env
	if (isNode()) { // Node
		asap = function (f) { return process.nextTick(f); };

	} else if (MutationObs = hasMutationObserver()) { // Modern browser
		asap = initMutationObserver(MutationObs);

	} else if (!capturedSetTimeout) { // vert.x
		var vertxRequire = require;
		var vertx = vertxRequire('vertx');
		setTimer = function (f, ms) { return vertx.setTimer(ms, f); };
		clearTimer = vertx.cancelTimer;
		asap = vertx.runOnLoop || vertx.runOnContext;
	}

	return {
		setTimer: setTimer,
		clearTimer: clearTimer,
		asap: asap
	};

	function isNode () {
		return typeof process !== 'undefined' &&
			Object.prototype.toString.call(process) === '[object process]';
	}

	function hasMutationObserver () {
		return (typeof MutationObserver === 'function' && MutationObserver) ||
			(typeof WebKitMutationObserver === 'function' && WebKitMutationObserver);
	}

	function initMutationObserver(MutationObserver) {
		var scheduled;
		var node = document.createTextNode('');
		var o = new MutationObserver(run);
		o.observe(node, { characterData: true });

		function run() {
			var f = scheduled;
			scheduled = void 0;
			f();
		}

		var i = 0;
		return function (f) {
			scheduled = f;
			node.data = (i ^= 1);
		};
	}
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{}],6:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return {
		formatError: formatError,
		formatObject: formatObject,
		tryStringify: tryStringify
	};

	/**
	 * Format an error into a string.  If e is an Error and has a stack property,
	 * it's returned.  Otherwise, e is formatted using formatObject, with a
	 * warning added about e not being a proper Error.
	 * @param {*} e
	 * @returns {String} formatted string, suitable for output to developers
	 */
	function formatError(e) {
		var s = typeof e === 'object' && e !== null && (e.stack || e.message) ? e.stack || e.message : formatObject(e);
		return e instanceof Error ? s : s + ' (WARNING: non-Error used)';
	}

	/**
	 * Format an object, detecting "plain" objects and running them through
	 * JSON.stringify if possible.
	 * @param {Object} o
	 * @returns {string}
	 */
	function formatObject(o) {
		var s = String(o);
		if(s === '[object Object]' && typeof JSON !== 'undefined') {
			s = tryStringify(o, s);
		}
		return s;
	}

	/**
	 * Try to return the result of JSON.stringify(x).  If that fails, return
	 * defaultValue
	 * @param {*} x
	 * @param {*} defaultValue
	 * @returns {String|*} JSON.stringify(x) or defaultValue
	 */
	function tryStringify(x, defaultValue) {
		try {
			return JSON.stringify(x);
		} catch(e) {
			return defaultValue;
		}
	}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],7:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function makePromise(environment) {

		var tasks = environment.scheduler;
		var emitRejection = initEmitRejection();

		var objectCreate = Object.create ||
			function(proto) {
				function Child() {}
				Child.prototype = proto;
				return new Child();
			};

		/**
		 * Create a promise whose fate is determined by resolver
		 * @constructor
		 * @returns {Promise} promise
		 * @name Promise
		 */
		function Promise(resolver, handler) {
			this._handler = resolver === Handler ? handler : init(resolver);
		}

		/**
		 * Run the supplied resolver
		 * @param resolver
		 * @returns {Pending}
		 */
		function init(resolver) {
			var handler = new Pending();

			try {
				resolver(promiseResolve, promiseReject, promiseNotify);
			} catch (e) {
				promiseReject(e);
			}

			return handler;

			/**
			 * Transition from pre-resolution state to post-resolution state, notifying
			 * all listeners of the ultimate fulfillment or rejection
			 * @param {*} x resolution value
			 */
			function promiseResolve (x) {
				handler.resolve(x);
			}
			/**
			 * Reject this promise with reason, which will be used verbatim
			 * @param {Error|*} reason rejection reason, strongly suggested
			 *   to be an Error type
			 */
			function promiseReject (reason) {
				handler.reject(reason);
			}

			/**
			 * @deprecated
			 * Issue a progress event, notifying all progress listeners
			 * @param {*} x progress event payload to pass to all listeners
			 */
			function promiseNotify (x) {
				handler.notify(x);
			}
		}

		// Creation

		Promise.resolve = resolve;
		Promise.reject = reject;
		Promise.never = never;

		Promise._defer = defer;
		Promise._handler = getHandler;

		/**
		 * Returns a trusted promise. If x is already a trusted promise, it is
		 * returned, otherwise returns a new trusted Promise which follows x.
		 * @param  {*} x
		 * @return {Promise} promise
		 */
		function resolve(x) {
			return isPromise(x) ? x
				: new Promise(Handler, new Async(getHandler(x)));
		}

		/**
		 * Return a reject promise with x as its reason (x is used verbatim)
		 * @param {*} x
		 * @returns {Promise} rejected promise
		 */
		function reject(x) {
			return new Promise(Handler, new Async(new Rejected(x)));
		}

		/**
		 * Return a promise that remains pending forever
		 * @returns {Promise} forever-pending promise.
		 */
		function never() {
			return foreverPendingPromise; // Should be frozen
		}

		/**
		 * Creates an internal {promise, resolver} pair
		 * @private
		 * @returns {Promise}
		 */
		function defer() {
			return new Promise(Handler, new Pending());
		}

		// Transformation and flow control

		/**
		 * Transform this promise's fulfillment value, returning a new Promise
		 * for the transformed result.  If the promise cannot be fulfilled, onRejected
		 * is called with the reason.  onProgress *may* be called with updates toward
		 * this promise's fulfillment.
		 * @param {function=} onFulfilled fulfillment handler
		 * @param {function=} onRejected rejection handler
		 * @param {function=} onProgress @deprecated progress handler
		 * @return {Promise} new promise
		 */
		Promise.prototype.then = function(onFulfilled, onRejected, onProgress) {
			var parent = this._handler;
			var state = parent.join().state();

			if ((typeof onFulfilled !== 'function' && state > 0) ||
				(typeof onRejected !== 'function' && state < 0)) {
				// Short circuit: value will not change, simply share handler
				return new this.constructor(Handler, parent);
			}

			var p = this._beget();
			var child = p._handler;

			parent.chain(child, parent.receiver, onFulfilled, onRejected, onProgress);

			return p;
		};

		/**
		 * If this promise cannot be fulfilled due to an error, call onRejected to
		 * handle the error. Shortcut for .then(undefined, onRejected)
		 * @param {function?} onRejected
		 * @return {Promise}
		 */
		Promise.prototype['catch'] = function(onRejected) {
			return this.then(void 0, onRejected);
		};

		/**
		 * Creates a new, pending promise of the same type as this promise
		 * @private
		 * @returns {Promise}
		 */
		Promise.prototype._beget = function() {
			return begetFrom(this._handler, this.constructor);
		};

		function begetFrom(parent, Promise) {
			var child = new Pending(parent.receiver, parent.join().context);
			return new Promise(Handler, child);
		}

		// Array combinators

		Promise.all = all;
		Promise.race = race;
		Promise._traverse = traverse;

		/**
		 * Return a promise that will fulfill when all promises in the
		 * input array have fulfilled, or will reject when one of the
		 * promises rejects.
		 * @param {array} promises array of promises
		 * @returns {Promise} promise for array of fulfillment values
		 */
		function all(promises) {
			return traverseWith(snd, null, promises);
		}

		/**
		 * Array<Promise<X>> -> Promise<Array<f(X)>>
		 * @private
		 * @param {function} f function to apply to each promise's value
		 * @param {Array} promises array of promises
		 * @returns {Promise} promise for transformed values
		 */
		function traverse(f, promises) {
			return traverseWith(tryCatch2, f, promises);
		}

		function traverseWith(tryMap, f, promises) {
			var handler = typeof f === 'function' ? mapAt : settleAt;

			var resolver = new Pending();
			var pending = promises.length >>> 0;
			var results = new Array(pending);

			for (var i = 0, x; i < promises.length && !resolver.resolved; ++i) {
				x = promises[i];

				if (x === void 0 && !(i in promises)) {
					--pending;
					continue;
				}

				traverseAt(promises, handler, i, x, resolver);
			}

			if(pending === 0) {
				resolver.become(new Fulfilled(results));
			}

			return new Promise(Handler, resolver);

			function mapAt(i, x, resolver) {
				if(!resolver.resolved) {
					traverseAt(promises, settleAt, i, tryMap(f, x, i), resolver);
				}
			}

			function settleAt(i, x, resolver) {
				results[i] = x;
				if(--pending === 0) {
					resolver.become(new Fulfilled(results));
				}
			}
		}

		function traverseAt(promises, handler, i, x, resolver) {
			if (maybeThenable(x)) {
				var h = getHandlerMaybeThenable(x);
				var s = h.state();

				if (s === 0) {
					h.fold(handler, i, void 0, resolver);
				} else if (s > 0) {
					handler(i, h.value, resolver);
				} else {
					resolver.become(h);
					visitRemaining(promises, i+1, h);
				}
			} else {
				handler(i, x, resolver);
			}
		}

		Promise._visitRemaining = visitRemaining;
		function visitRemaining(promises, start, handler) {
			for(var i=start; i<promises.length; ++i) {
				markAsHandled(getHandler(promises[i]), handler);
			}
		}

		function markAsHandled(h, handler) {
			if(h === handler) {
				return;
			}

			var s = h.state();
			if(s === 0) {
				h.visit(h, void 0, h._unreport);
			} else if(s < 0) {
				h._unreport();
			}
		}

		/**
		 * Fulfill-reject competitive race. Return a promise that will settle
		 * to the same state as the earliest input promise to settle.
		 *
		 * WARNING: The ES6 Promise spec requires that race()ing an empty array
		 * must return a promise that is pending forever.  This implementation
		 * returns a singleton forever-pending promise, the same singleton that is
		 * returned by Promise.never(), thus can be checked with ===
		 *
		 * @param {array} promises array of promises to race
		 * @returns {Promise} if input is non-empty, a promise that will settle
		 * to the same outcome as the earliest input promise to settle. if empty
		 * is empty, returns a promise that will never settle.
		 */
		function race(promises) {
			if(typeof promises !== 'object' || promises === null) {
				return reject(new TypeError('non-iterable passed to race()'));
			}

			// Sigh, race([]) is untestable unless we return *something*
			// that is recognizable without calling .then() on it.
			return promises.length === 0 ? never()
				 : promises.length === 1 ? resolve(promises[0])
				 : runRace(promises);
		}

		function runRace(promises) {
			var resolver = new Pending();
			var i, x, h;
			for(i=0; i<promises.length; ++i) {
				x = promises[i];
				if (x === void 0 && !(i in promises)) {
					continue;
				}

				h = getHandler(x);
				if(h.state() !== 0) {
					resolver.become(h);
					visitRemaining(promises, i+1, h);
					break;
				} else {
					h.visit(resolver, resolver.resolve, resolver.reject);
				}
			}
			return new Promise(Handler, resolver);
		}

		// Promise internals
		// Below this, everything is @private

		/**
		 * Get an appropriate handler for x, without checking for cycles
		 * @param {*} x
		 * @returns {object} handler
		 */
		function getHandler(x) {
			if(isPromise(x)) {
				return x._handler.join();
			}
			return maybeThenable(x) ? getHandlerUntrusted(x) : new Fulfilled(x);
		}

		/**
		 * Get a handler for thenable x.
		 * NOTE: You must only call this if maybeThenable(x) == true
		 * @param {object|function|Promise} x
		 * @returns {object} handler
		 */
		function getHandlerMaybeThenable(x) {
			return isPromise(x) ? x._handler.join() : getHandlerUntrusted(x);
		}

		/**
		 * Get a handler for potentially untrusted thenable x
		 * @param {*} x
		 * @returns {object} handler
		 */
		function getHandlerUntrusted(x) {
			try {
				var untrustedThen = x.then;
				return typeof untrustedThen === 'function'
					? new Thenable(untrustedThen, x)
					: new Fulfilled(x);
			} catch(e) {
				return new Rejected(e);
			}
		}

		/**
		 * Handler for a promise that is pending forever
		 * @constructor
		 */
		function Handler() {}

		Handler.prototype.when
			= Handler.prototype.become
			= Handler.prototype.notify // deprecated
			= Handler.prototype.fail
			= Handler.prototype._unreport
			= Handler.prototype._report
			= noop;

		Handler.prototype._state = 0;

		Handler.prototype.state = function() {
			return this._state;
		};

		/**
		 * Recursively collapse handler chain to find the handler
		 * nearest to the fully resolved value.
		 * @returns {object} handler nearest the fully resolved value
		 */
		Handler.prototype.join = function() {
			var h = this;
			while(h.handler !== void 0) {
				h = h.handler;
			}
			return h;
		};

		Handler.prototype.chain = function(to, receiver, fulfilled, rejected, progress) {
			this.when({
				resolver: to,
				receiver: receiver,
				fulfilled: fulfilled,
				rejected: rejected,
				progress: progress
			});
		};

		Handler.prototype.visit = function(receiver, fulfilled, rejected, progress) {
			this.chain(failIfRejected, receiver, fulfilled, rejected, progress);
		};

		Handler.prototype.fold = function(f, z, c, to) {
			this.when(new Fold(f, z, c, to));
		};

		/**
		 * Handler that invokes fail() on any handler it becomes
		 * @constructor
		 */
		function FailIfRejected() {}

		inherit(Handler, FailIfRejected);

		FailIfRejected.prototype.become = function(h) {
			h.fail();
		};

		var failIfRejected = new FailIfRejected();

		/**
		 * Handler that manages a queue of consumers waiting on a pending promise
		 * @constructor
		 */
		function Pending(receiver, inheritedContext) {
			Promise.createContext(this, inheritedContext);

			this.consumers = void 0;
			this.receiver = receiver;
			this.handler = void 0;
			this.resolved = false;
		}

		inherit(Handler, Pending);

		Pending.prototype._state = 0;

		Pending.prototype.resolve = function(x) {
			this.become(getHandler(x));
		};

		Pending.prototype.reject = function(x) {
			if(this.resolved) {
				return;
			}

			this.become(new Rejected(x));
		};

		Pending.prototype.join = function() {
			if (!this.resolved) {
				return this;
			}

			var h = this;

			while (h.handler !== void 0) {
				h = h.handler;
				if (h === this) {
					return this.handler = cycle();
				}
			}

			return h;
		};

		Pending.prototype.run = function() {
			var q = this.consumers;
			var handler = this.handler;
			this.handler = this.handler.join();
			this.consumers = void 0;

			for (var i = 0; i < q.length; ++i) {
				handler.when(q[i]);
			}
		};

		Pending.prototype.become = function(handler) {
			if(this.resolved) {
				return;
			}

			this.resolved = true;
			this.handler = handler;
			if(this.consumers !== void 0) {
				tasks.enqueue(this);
			}

			if(this.context !== void 0) {
				handler._report(this.context);
			}
		};

		Pending.prototype.when = function(continuation) {
			if(this.resolved) {
				tasks.enqueue(new ContinuationTask(continuation, this.handler));
			} else {
				if(this.consumers === void 0) {
					this.consumers = [continuation];
				} else {
					this.consumers.push(continuation);
				}
			}
		};

		/**
		 * @deprecated
		 */
		Pending.prototype.notify = function(x) {
			if(!this.resolved) {
				tasks.enqueue(new ProgressTask(x, this));
			}
		};

		Pending.prototype.fail = function(context) {
			var c = typeof context === 'undefined' ? this.context : context;
			this.resolved && this.handler.join().fail(c);
		};

		Pending.prototype._report = function(context) {
			this.resolved && this.handler.join()._report(context);
		};

		Pending.prototype._unreport = function() {
			this.resolved && this.handler.join()._unreport();
		};

		/**
		 * Wrap another handler and force it into a future stack
		 * @param {object} handler
		 * @constructor
		 */
		function Async(handler) {
			this.handler = handler;
		}

		inherit(Handler, Async);

		Async.prototype.when = function(continuation) {
			tasks.enqueue(new ContinuationTask(continuation, this));
		};

		Async.prototype._report = function(context) {
			this.join()._report(context);
		};

		Async.prototype._unreport = function() {
			this.join()._unreport();
		};

		/**
		 * Handler that wraps an untrusted thenable and assimilates it in a future stack
		 * @param {function} then
		 * @param {{then: function}} thenable
		 * @constructor
		 */
		function Thenable(then, thenable) {
			Pending.call(this);
			tasks.enqueue(new AssimilateTask(then, thenable, this));
		}

		inherit(Pending, Thenable);

		/**
		 * Handler for a fulfilled promise
		 * @param {*} x fulfillment value
		 * @constructor
		 */
		function Fulfilled(x) {
			Promise.createContext(this);
			this.value = x;
		}

		inherit(Handler, Fulfilled);

		Fulfilled.prototype._state = 1;

		Fulfilled.prototype.fold = function(f, z, c, to) {
			runContinuation3(f, z, this, c, to);
		};

		Fulfilled.prototype.when = function(cont) {
			runContinuation1(cont.fulfilled, this, cont.receiver, cont.resolver);
		};

		var errorId = 0;

		/**
		 * Handler for a rejected promise
		 * @param {*} x rejection reason
		 * @constructor
		 */
		function Rejected(x) {
			Promise.createContext(this);

			this.id = ++errorId;
			this.value = x;
			this.handled = false;
			this.reported = false;

			this._report();
		}

		inherit(Handler, Rejected);

		Rejected.prototype._state = -1;

		Rejected.prototype.fold = function(f, z, c, to) {
			to.become(this);
		};

		Rejected.prototype.when = function(cont) {
			if(typeof cont.rejected === 'function') {
				this._unreport();
			}
			runContinuation1(cont.rejected, this, cont.receiver, cont.resolver);
		};

		Rejected.prototype._report = function(context) {
			tasks.afterQueue(new ReportTask(this, context));
		};

		Rejected.prototype._unreport = function() {
			if(this.handled) {
				return;
			}
			this.handled = true;
			tasks.afterQueue(new UnreportTask(this));
		};

		Rejected.prototype.fail = function(context) {
			this.reported = true;
			emitRejection('unhandledRejection', this);
			Promise.onFatalRejection(this, context === void 0 ? this.context : context);
		};

		function ReportTask(rejection, context) {
			this.rejection = rejection;
			this.context = context;
		}

		ReportTask.prototype.run = function() {
			if(!this.rejection.handled && !this.rejection.reported) {
				this.rejection.reported = true;
				emitRejection('unhandledRejection', this.rejection) ||
					Promise.onPotentiallyUnhandledRejection(this.rejection, this.context);
			}
		};

		function UnreportTask(rejection) {
			this.rejection = rejection;
		}

		UnreportTask.prototype.run = function() {
			if(this.rejection.reported) {
				emitRejection('rejectionHandled', this.rejection) ||
					Promise.onPotentiallyUnhandledRejectionHandled(this.rejection);
			}
		};

		// Unhandled rejection hooks
		// By default, everything is a noop

		Promise.createContext
			= Promise.enterContext
			= Promise.exitContext
			= Promise.onPotentiallyUnhandledRejection
			= Promise.onPotentiallyUnhandledRejectionHandled
			= Promise.onFatalRejection
			= noop;

		// Errors and singletons

		var foreverPendingHandler = new Handler();
		var foreverPendingPromise = new Promise(Handler, foreverPendingHandler);

		function cycle() {
			return new Rejected(new TypeError('Promise cycle'));
		}

		// Task runners

		/**
		 * Run a single consumer
		 * @constructor
		 */
		function ContinuationTask(continuation, handler) {
			this.continuation = continuation;
			this.handler = handler;
		}

		ContinuationTask.prototype.run = function() {
			this.handler.join().when(this.continuation);
		};

		/**
		 * Run a queue of progress handlers
		 * @constructor
		 */
		function ProgressTask(value, handler) {
			this.handler = handler;
			this.value = value;
		}

		ProgressTask.prototype.run = function() {
			var q = this.handler.consumers;
			if(q === void 0) {
				return;
			}

			for (var c, i = 0; i < q.length; ++i) {
				c = q[i];
				runNotify(c.progress, this.value, this.handler, c.receiver, c.resolver);
			}
		};

		/**
		 * Assimilate a thenable, sending it's value to resolver
		 * @param {function} then
		 * @param {object|function} thenable
		 * @param {object} resolver
		 * @constructor
		 */
		function AssimilateTask(then, thenable, resolver) {
			this._then = then;
			this.thenable = thenable;
			this.resolver = resolver;
		}

		AssimilateTask.prototype.run = function() {
			var h = this.resolver;
			tryAssimilate(this._then, this.thenable, _resolve, _reject, _notify);

			function _resolve(x) { h.resolve(x); }
			function _reject(x)  { h.reject(x); }
			function _notify(x)  { h.notify(x); }
		};

		function tryAssimilate(then, thenable, resolve, reject, notify) {
			try {
				then.call(thenable, resolve, reject, notify);
			} catch (e) {
				reject(e);
			}
		}

		/**
		 * Fold a handler value with z
		 * @constructor
		 */
		function Fold(f, z, c, to) {
			this.f = f; this.z = z; this.c = c; this.to = to;
			this.resolver = failIfRejected;
			this.receiver = this;
		}

		Fold.prototype.fulfilled = function(x) {
			this.f.call(this.c, this.z, x, this.to);
		};

		Fold.prototype.rejected = function(x) {
			this.to.reject(x);
		};

		Fold.prototype.progress = function(x) {
			this.to.notify(x);
		};

		// Other helpers

		/**
		 * @param {*} x
		 * @returns {boolean} true iff x is a trusted Promise
		 */
		function isPromise(x) {
			return x instanceof Promise;
		}

		/**
		 * Test just enough to rule out primitives, in order to take faster
		 * paths in some code
		 * @param {*} x
		 * @returns {boolean} false iff x is guaranteed *not* to be a thenable
		 */
		function maybeThenable(x) {
			return (typeof x === 'object' || typeof x === 'function') && x !== null;
		}

		function runContinuation1(f, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.become(h);
			}

			Promise.enterContext(h);
			tryCatchReject(f, h.value, receiver, next);
			Promise.exitContext();
		}

		function runContinuation3(f, x, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.become(h);
			}

			Promise.enterContext(h);
			tryCatchReject3(f, x, h.value, receiver, next);
			Promise.exitContext();
		}

		/**
		 * @deprecated
		 */
		function runNotify(f, x, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.notify(x);
			}

			Promise.enterContext(h);
			tryCatchReturn(f, x, receiver, next);
			Promise.exitContext();
		}

		function tryCatch2(f, a, b) {
			try {
				return f(a, b);
			} catch(e) {
				return reject(e);
			}
		}

		/**
		 * Return f.call(thisArg, x), or if it throws return a rejected promise for
		 * the thrown exception
		 */
		function tryCatchReject(f, x, thisArg, next) {
			try {
				next.become(getHandler(f.call(thisArg, x)));
			} catch(e) {
				next.become(new Rejected(e));
			}
		}

		/**
		 * Same as above, but includes the extra argument parameter.
		 */
		function tryCatchReject3(f, x, y, thisArg, next) {
			try {
				f.call(thisArg, x, y, next);
			} catch(e) {
				next.become(new Rejected(e));
			}
		}

		/**
		 * @deprecated
		 * Return f.call(thisArg, x), or if it throws, *return* the exception
		 */
		function tryCatchReturn(f, x, thisArg, next) {
			try {
				next.notify(f.call(thisArg, x));
			} catch(e) {
				next.notify(e);
			}
		}

		function inherit(Parent, Child) {
			Child.prototype = objectCreate(Parent.prototype);
			Child.prototype.constructor = Child;
		}

		function snd(x, y) {
			return y;
		}

		function noop() {}

		function initEmitRejection() {
			/*global process, self, CustomEvent*/
			if(typeof process !== 'undefined' && process !== null
				&& typeof process.emit === 'function') {
				// Returning falsy here means to call the default
				// onPotentiallyUnhandledRejection API.  This is safe even in
				// browserify since process.emit always returns falsy in browserify:
				// https://github.com/defunctzombie/node-process/blob/master/browser.js#L40-L46
				return function(type, rejection) {
					return type === 'unhandledRejection'
						? process.emit(type, rejection.value, rejection)
						: process.emit(type, rejection);
				};
			} else if(typeof self !== 'undefined' && typeof CustomEvent === 'function') {
				return (function(noop, self, CustomEvent) {
					var hasCustomEvent = false;
					try {
						var ev = new CustomEvent('unhandledRejection');
						hasCustomEvent = ev instanceof CustomEvent;
					} catch (e) {}

					return !hasCustomEvent ? noop : function(type, rejection) {
						var ev = new CustomEvent(type, {
							detail: {
								reason: rejection.value,
								key: rejection
							},
							bubbles: false,
							cancelable: true
						});

						return !self.dispatchEvent(ev);
					};
				}(noop, self, CustomEvent));
			}

			return noop;
		}

		return Promise;
	};
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}]},{},[1])
(1)
});
;
(function(__global) {

var isWorker = typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined'
  && self instanceof WorkerGlobalScope;
var isBrowser = typeof window != 'undefined' && !isWorker;

__global.$__Object$getPrototypeOf = Object.getPrototypeOf || function(obj) {
  return obj.__proto__;
};

var $__Object$defineProperty;
(function () {
  try {
    if (!!Object.defineProperty({}, 'a', {})) {
      $__Object$defineProperty = Object.defineProperty;
    }
  } catch (e) {
    $__Object$defineProperty = function (obj, prop, opt) {
      try {
        obj[prop] = opt.value || opt.get.call(obj);
      }
      catch(e) {}
    }
  }
}());

__global.$__Object$create = Object.create || function(o, props) {
  function F() {}
  F.prototype = o;

  if (typeof(props) === "object") {
    for (prop in props) {
      if (props.hasOwnProperty((prop))) {
        F[prop] = props[prop];
      }
    }
  }
  return new F();
};

/*
*********************************************************************************************

  Dynamic Module Loader Polyfill

    - Implemented exactly to the former 2014-08-24 ES6 Specification Draft Rev 27, Section 15
      http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts#august_24_2014_draft_rev_27

    - Functions are commented with their spec numbers, with spec differences commented.

    - Spec bugs are commented in this code with links.

    - Abstract functions have been combined where possible, and their associated functions
      commented.

    - Realm implementation is entirely omitted.

*********************************************************************************************
*/

// Some Helpers

// logs a linkset snapshot for debugging
/* function snapshot(loader) {
  console.log('---Snapshot---');
  for (var i = 0; i < loader.loads.length; i++) {
    var load = loader.loads[i];
    var linkSetLog = '  ' + load.name + ' (' + load.status + '): ';

    for (var j = 0; j < load.linkSets.length; j++) {
      linkSetLog += '{' + logloads(load.linkSets[j].loads) + '} ';
    }
    console.log(linkSetLog);
  }
  console.log('');
}
function logloads(loads) {
  var log = '';
  for (var k = 0; k < loads.length; k++)
    log += loads[k].name + (k != loads.length - 1 ? ' ' : '');
  return log;
} */


/* function checkInvariants() {
  // see https://bugs.ecmascript.org/show_bug.cgi?id=2603#c1

  var loads = System._loader.loads;
  var linkSets = [];

  for (var i = 0; i < loads.length; i++) {
    var load = loads[i];
    console.assert(load.status == 'loading' || load.status == 'loaded', 'Each load is loading or loaded');

    for (var j = 0; j < load.linkSets.length; j++) {
      var linkSet = load.linkSets[j];

      for (var k = 0; k < linkSet.loads.length; k++)
        console.assert(loads.indexOf(linkSet.loads[k]) != -1, 'linkSet loads are a subset of loader loads');

      if (linkSets.indexOf(linkSet) == -1)
        linkSets.push(linkSet);
    }
  }

  for (var i = 0; i < loads.length; i++) {
    var load = loads[i];
    for (var j = 0; j < linkSets.length; j++) {
      var linkSet = linkSets[j];

      if (linkSet.loads.indexOf(load) != -1)
        console.assert(load.linkSets.indexOf(linkSet) != -1, 'linkSet contains load -> load contains linkSet');

      if (load.linkSets.indexOf(linkSet) != -1)
        console.assert(linkSet.loads.indexOf(load) != -1, 'load contains linkSet -> linkSet contains load');
    }
  }

  for (var i = 0; i < linkSets.length; i++) {
    var linkSet = linkSets[i];
    for (var j = 0; j < linkSet.loads.length; j++) {
      var load = linkSet.loads[j];

      for (var k = 0; k < load.dependencies.length; k++) {
        var depName = load.dependencies[k].value;
        var depLoad;
        for (var l = 0; l < loads.length; l++) {
          if (loads[l].name != depName)
            continue;
          depLoad = loads[l];
          break;
        }

        // loading records are allowed not to have their dependencies yet
        // if (load.status != 'loading')
        //  console.assert(depLoad, 'depLoad found');

        // console.assert(linkSet.loads.indexOf(depLoad) != -1, 'linkset contains all dependencies');
      }
    }
  }
} */


(function() {
  var Promise = __global.Promise || require('when/es6-shim/Promise');
  var console;
  var $__curScript;
  if (__global.console) {
    console = __global.console;
    console.assert = console.assert || function() {};
  } else {
    console = { assert: function() {} };
  }
  if(isBrowser) {
	  var scripts = document.getElementsByTagName("script");
	  $__curScript = document.currentScript || scripts[scripts.length - 1];
  }


  // IE8 support
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, thisLen = this.length; i < thisLen; i++) {
      if (this[i] === item) {
        return i;
      }
    }
    return -1;
  };
  var defineProperty = $__Object$defineProperty;
  var emptyArray = [];

  // 15.2.3 - Runtime Semantics: Loader State

  // 15.2.3.11
  function createLoaderLoad(object) {
    return {
      // modules is an object for ES5 implementation
      modules: {},
      loads: [],
      loaderObj: object
    };
  }

  // 15.2.3.2 Load Records and LoadRequest Objects

  // 15.2.3.2.1
  function createLoad(name) {
    return {
      status: 'loading',
      name: name,
      linkSets: [],
      dependencies: [],
      metadata: {}
    };
  }

  // 15.2.3.2.2 createLoadRequestObject, absorbed into calling functions

  // 15.2.4

  // 15.2.4.1
  function loadModule(loader, name, options) {
    return new Promise(asyncStartLoadPartwayThrough({
      step: options.address ? 'fetch' : 'locate',
      loader: loader,
      moduleName: name,
      // allow metadata for import https://bugs.ecmascript.org/show_bug.cgi?id=3091
      moduleMetadata: options && options.metadata || {},
      moduleSource: options.source,
      moduleAddress: options.address
    }));
  }

  // 15.2.4.2
  function requestLoad(loader, request, refererName, refererAddress) {
    // 15.2.4.2.1 CallNormalize
    return new Promise(function(resolve, reject) {
      resolve(loader.loaderObj.normalize(request, refererName, refererAddress));
    })
    .then(function(name) {
		return Promise.resolve(loader.loaderObj.notifyLoad(request, name, refererName))
		.then(function() { return name; });
    })
	// 15.2.4.2.2 GetOrCreateLoad
    .then(function(name) {
      var load;
      if (loader.modules[name]) {
        load = createLoad(name);
        load.status = 'linked';
        // https://bugs.ecmascript.org/show_bug.cgi?id=2795
        load.module = loader.modules[name];
        return load;
      }

      for (var i = 0, l = loader.loads.length; i < l; i++) {
        load = loader.loads[i];
        if (load.name != name)
          continue;
        console.assert(load.status == 'loading' || load.status == 'loaded', 'loading or loaded');
        return load;
      }

      var failedLoads = loader.loaderObj.failed || emptyArray;
      for(var i = 0, l = failedLoads.length; i < l; i++) {
        load = failedLoads[i];
        if(load.name !== name)
          continue;
        return Promise.reject('The load ' + name + ' already failed.');
      }

      load = createLoad(name);
      loader.loads.push(load);

      proceedToLocate(loader, load);

      return load;
    });
  }

  // 15.2.4.3
  function proceedToLocate(loader, load) {
    proceedToFetch(loader, load,
      Promise.resolve()
      // 15.2.4.3.1 CallLocate
      .then(function() {
        return loader.loaderObj.locate({ name: load.name, metadata: load.metadata });
      })
    );
  }

  // 15.2.4.4
  function proceedToFetch(loader, load, p) {
    proceedToTranslate(loader, load,
      p
      // 15.2.4.4.1 CallFetch
      .then(function(address) {
        // adjusted, see https://bugs.ecmascript.org/show_bug.cgi?id=2602
        if (load.status != 'loading')
          return;
        load.address = address;

        return loader.loaderObj.fetch({ name: load.name, metadata: load.metadata, address: address });
      })
    );
  }

  var anonCnt = 0;

  // 15.2.4.5
  function proceedToTranslate(loader, load, p) {
	var pass = load.pass || 0;
	var passCancelled = function() { return (load.pass << 0) !== pass };

    p
    // 15.2.4.5.1 CallTranslate
    .then(function(source) {
      if (load.status != 'loading')
        return;

      return Promise.resolve(loader.loaderObj.translate({ name: load.name, metadata: load.metadata, address: load.address, source: source }))

      // 15.2.4.5.2 CallInstantiate
      .then(function(source) {
        if(load.status != 'loading' || passCancelled()) {
          return;
        }
        load.source = source;
        return loader.loaderObj.instantiate({ name: load.name, metadata: load.metadata, address: load.address, source: source });
      })

      // 15.2.4.5.3 InstantiateSucceeded
      .then(function(instantiateResult) {
        if(load.status != 'loading' || passCancelled()) {
          return;
        }
        if (instantiateResult === undefined) {
          load.address = load.address || '<Anonymous Module ' + ++anonCnt + '>';

          // instead of load.kind, use load.isDeclarative
          load.isDeclarative = true;
          return loader.loaderObj.transpile(load)
          .then(function(transpiled) {
			  // Hijack System.register to set declare function
			  var curSystem = __global.System;
			  var curRegister = curSystem.register;
			  curSystem.register = function(name, regDeps, regDeclare) {
				var declare = regDeclare;
				var deps = regDeps;
				if (typeof name != 'string') {
				  declare = deps;
				  deps = name;
				}

				load.declare = declare;
				load.depsList = deps;
			  };
			  __eval(transpiled, __global, load);
			  curSystem.register = curRegister;
          });
        }
        else if (typeof instantiateResult == 'object') {
          load.depsList = instantiateResult.deps || [];
          load.execute = instantiateResult.execute;
          load.isDeclarative = false;
        }
        else
          throw TypeError('Invalid instantiate return value');
      })
      // 15.2.4.6 ProcessLoadDependencies
      .then(function() {
        if(load.status != 'loading' || passCancelled()) {
          return;
        }
        load.dependencies = [];
        var depsList = load.depsList;

        var loadPromises = [];
        function loadDep(request, index) {
          loadPromises.push(
            requestLoad(loader, request, load.name, load.address)

            // 15.2.4.6.1 AddDependencyLoad (load is parentLoad)
            .then(function(depLoad) {

              // adjusted from spec to maintain dependency order
              // this is due to the System.register internal implementation needs
              load.dependencies[index] = {
                key: request,
                value: depLoad.name
              };

              if (depLoad.status != 'linked') {
                var linkSets = load.linkSets.concat([]);
                for (var i = 0, l = linkSets.length; i < l; i++)
                  addLoadToLinkSet(linkSets[i], depLoad);
              }

              // console.log('AddDependencyLoad ' + depLoad.name + ' for ' + load.name);
              // snapshot(loader);
            })
          );
        }
        for (var i = 0, l = depsList.length; i < l; i++) {
            loadDep(depsList[i], i);
        }

        return Promise.all(loadPromises);
      })

      // 15.2.4.6.2 LoadSucceeded
      .then(function() {
        // console.log('LoadSucceeded ' + load.name);
        // snapshot(loader);
        if(load.status != 'loading' || passCancelled()) {
          return;
        }

        console.assert(load.status == 'loading', 'is loading');

        load.status = 'loaded';

        var linkSets = load.linkSets.concat([]);
        for (var i = 0, l = linkSets.length; i < l; i++)
          updateLinkSetOnLoad(linkSets[i], load);
      });
    })
    // 15.2.4.5.4 LoadFailed
    ['catch'](function(exc) {
      load.status = 'failed';
      load.exception = exc;

      var linkSets = load.linkSets.concat([]);
      for (var i = 0, l = linkSets.length; i < l; i++) {
        linkSetFailed(linkSets[i], load, exc);
      }

      console.assert(load.linkSets.length == 0, 'linkSets not removed');
    });
  }

  // 15.2.4.7 PromiseOfStartLoadPartwayThrough absorbed into calling functions
  function incrementPass(load) {
	  load.pass = load.pass != null ? (load.pass + 1) : 1;
  }

  function changeLoadingStatus(load, newStatus) {
      var oldStatus = load.status;

      load.status = newStatus;
      if(newStatus !== oldStatus && oldStatus === "loaded") {
          load.linkSets.forEach(function(linkSet){
              linkSet.loadingCount++;
          });
      }
  }

  // 15.2.4.7.1
  function asyncStartLoadPartwayThrough(stepState) {
    return function(resolve, reject) {
      var loader = stepState.loader;
      var name = stepState.moduleName;
      var step = stepState.step;
      var importingModuleName = stepState.moduleMetadata.importingModuleName;

      if (loader.modules[name])
        throw new TypeError('"' + name + '" already exists in the module table');

      // adjusted to pick up existing loads
      var existingLoad, firstLinkSet;
      for (var i = 0, l = loader.loads.length; i < l; i++) {
        if (loader.loads[i].name == name) {
          existingLoad = loader.loads[i];

          if(step == 'translate' && !existingLoad.source) {
            existingLoad.address = stepState.moduleAddress;
            proceedToTranslate(loader, existingLoad, Promise.resolve(stepState.moduleSource));
		  }

          // If the module importing this is part of the same linkSet, create
          // a new one for this import.
          firstLinkSet = existingLoad.linkSets[0];
          if(importingModuleName && firstLinkSet.loads[importingModuleName]) {
            continue;
          }

          return firstLinkSet.done.then(function() {
            resolve(existingLoad);
          });
        }
      }

      var load;
      if(existingLoad) {
        load = existingLoad;
      } else {
        load = createLoad(name);
        load.metadata = stepState.moduleMetadata;
      }

      var linkSet = createLinkSet(loader, load);

      if(!existingLoad) {
        loader.loads.push(load);
      }

      resolve(linkSet.done);

      if (step == 'locate')
        proceedToLocate(loader, load);

      else if (step == 'fetch')
        proceedToFetch(loader, load, Promise.resolve(stepState.moduleAddress));

      else {
        console.assert(step == 'translate', 'translate step');
        load.address = stepState.moduleAddress;
        proceedToTranslate(loader, load, Promise.resolve(stepState.moduleSource));
      }
    }
  }

  // Declarative linking functions run through alternative implementation:
  // 15.2.5.1.1 CreateModuleLinkageRecord not implemented
  // 15.2.5.1.2 LookupExport not implemented
  // 15.2.5.1.3 LookupModuleDependency not implemented

  // 15.2.5.2.1
  function createLinkSet(loader, startingLoad) {
    var linkSet = {
      loader: loader,
      loads: [],
      startingLoad: startingLoad, // added see spec bug https://bugs.ecmascript.org/show_bug.cgi?id=2995
      loadingCount: 0
    };
    linkSet.done = new Promise(function(resolve, reject) {
      linkSet.resolve = resolve;
      linkSet.reject = reject;
    });
    addLoadToLinkSet(linkSet, startingLoad);
    return linkSet;
  }
  // 15.2.5.2.2
  function addLoadToLinkSet(linkSet, load) {
    console.assert(load.status == 'loading' || load.status == 'loaded' || load.status === 'failed',
		'loading or loaded on link set');

    for (var i = 0, l = linkSet.loads.length; i < l; i++)
      if (linkSet.loads[i] == load)
        return;

    linkSet.loads.push(load);
    linkSet.loads[load.name] = true;
    load.linkSets.push(linkSet);

    // adjustment, see https://bugs.ecmascript.org/show_bug.cgi?id=2603
    if (load.status != 'loaded') {
      linkSet.loadingCount++;
    }

    var loader = linkSet.loader;

    for (var i = 0, l = load.dependencies.length; i < l; i++) {
      var name = load.dependencies[i].value;

      if (loader.modules[name])
        continue;

      for (var j = 0, d = loader.loads.length; j < d; j++) {
        if (loader.loads[j].name != name)
          continue;

        addLoadToLinkSet(linkSet, loader.loads[j]);
        break;
      }
    }
    // console.log('add to linkset ' + load.name);
    // snapshot(linkSet.loader);
  }

  // linking errors can be generic or load-specific
  // this is necessary for debugging info
  function doLink(linkSet) {
    var error = false;
    try {
      link(linkSet, function(load, exc) {
        linkSetFailed(linkSet, load, exc);
        error = true;
      });
    }
    catch(e) {
      linkSetFailed(linkSet, null, e);
      error = true;
    }
    return error;
  }

  // 15.2.5.2.3
  function updateLinkSetOnLoad(linkSet, load) {
    // console.log('update linkset on load ' + load.name);
    // snapshot(linkSet.loader);

    console.assert(load.status == 'loaded' || load.status == 'linked', 'loaded or linked');

    linkSet.loadingCount--;

    if (linkSet.loadingCount > 0)
      return;

    // adjusted for spec bug https://bugs.ecmascript.org/show_bug.cgi?id=2995
    var startingLoad = linkSet.startingLoad;

    // non-executing link variation for loader tracing
    // on the server. Not in spec.
    /***/
    if (linkSet.loader.loaderObj.execute === false) {
      var loads = [].concat(linkSet.loads);
      for (var i = 0, l = loads.length; i < l; i++) {
        var load = loads[i];
        load.module = !load.isDeclarative ? {
          module: _newModule({})
        } : {
          name: load.name,
          module: _newModule({}),
          evaluated: true
        };
        load.status = 'linked';
        finishLoad(linkSet.loader, load);
      }
      return linkSet.resolve(startingLoad);
    }
    /***/

    var abrupt = doLink(linkSet);

    if (abrupt)
      return;

    console.assert(linkSet.loads.length == 0, 'loads cleared');

    linkSet.resolve(startingLoad);
  }

  // 15.2.5.2.4
  function linkSetFailed(linkSet, load, linkExc) {
    var loader = linkSet.loader;
    var exc = linkExc;

	/*
    if (linkSet.loads[0].name != load.name)
      exc = addToError(exc, 'Error loading "' + load.name + '" from "' + linkSet.loads[0].name + '" at ' + (linkSet.loads[0].address || '<unknown>') + '\n');

    exc = addToError(exc, 'Error loading "' + load.name + '" at ' + (load.address || '<unknown>') + '\n');
	*/

    var loads = linkSet.loads.concat([]);
    for (var i = 0, l = loads.length; i < l; i++) {
      var load = loads[i];

      // store all failed load records
      loader.loaderObj.failed = loader.loaderObj.failed || [];
      if (load.status === "failed" && indexOf.call(loader.loaderObj.failed, load) == -1)
        loader.loaderObj.failed.push(load);
	  else if(loader.loaderObj._pendingState)
	  	loader.loaderObj._pendingState(load);

      var linkIndex = indexOf.call(load.linkSets, linkSet);
      console.assert(linkIndex != -1, 'link not present');
      load.linkSets.splice(linkIndex, 1);
      if (load.linkSets.length == 0) {
        var globalLoadsIndex = indexOf.call(linkSet.loader.loads, load);
        if (globalLoadsIndex != -1)
          linkSet.loader.loads.splice(globalLoadsIndex, 1);
      }
    }
    linkSet.reject(exc);
  }

  // 15.2.5.2.5
  function finishLoad(loader, load) {
    // add to global trace if tracing
    if (loader.loaderObj.trace) {
      if (!loader.loaderObj.loads)
        loader.loaderObj.loads = {};
      var depMap = {};
      load.dependencies.forEach(function(dep) {
        depMap[dep.key] = dep.value;
      });
      loader.loaderObj.loads[load.name] = {
        name: load.name,
        deps: load.dependencies.map(function(dep){ return dep.key }),
        depMap: depMap,
        address: load.address,
        metadata: load.metadata,
        source: load.source,
        kind: load.isDeclarative ? 'declarative' : 'dynamic'
      };
    }
    // if not anonymous, add to the module table
    if (load.name) {
      console.assert(!loader.modules[load.name], 'load not in module table');
      loader.modules[load.name] = load.module;
    }
    var loadIndex = indexOf.call(loader.loads, load);
    if (loadIndex != -1)
      loader.loads.splice(loadIndex, 1);
    for (var i = 0, l = load.linkSets.length; i < l; i++) {
      loadIndex = indexOf.call(load.linkSets[i].loads, load);
      if (loadIndex != -1)
        load.linkSets[i].loads.splice(loadIndex, 1);
    }
    load.linkSets.splice(0, load.linkSets.length);
  }

  // 15.2.5.3 Module Linking Groups

  // 15.2.5.3.2 BuildLinkageGroups alternative implementation
  // Adjustments (also see https://bugs.ecmascript.org/show_bug.cgi?id=2755)
  // 1. groups is an already-interleaved array of group kinds
  // 2. load.groupIndex is set when this function runs
  // 3. load.groupIndex is the interleaved index ie 0 declarative, 1 dynamic, 2 declarative, ... (or starting with dynamic)
  function buildLinkageGroups(load, loads, groups) {
    groups[load.groupIndex] = groups[load.groupIndex] || [];

    // if the load already has a group index and its in its group, its already been done
    // this logic naturally handles cycles
    if (indexOf.call(groups[load.groupIndex], load) != -1)
      return;

    // now add it to the group to indicate its been seen
    groups[load.groupIndex].push(load);

    for (var i = 0, l = loads.length; i < l; i++) {
      var loadDep = loads[i];

      // dependencies not found are already linked
      for (var j = 0; j < load.dependencies.length; j++) {
        if (loadDep.name == load.dependencies[j].value) {
          // by definition all loads in linkset are loaded, not linked
          console.assert(loadDep.status == 'loaded', 'Load in linkSet not loaded!');

          // if it is a group transition, the index of the dependency has gone up
          // otherwise it is the same as the parent
          var loadDepGroupIndex = load.groupIndex + (loadDep.isDeclarative != load.isDeclarative);

          // the group index of an entry is always the maximum
          if (loadDep.groupIndex === undefined || loadDep.groupIndex < loadDepGroupIndex) {

            // if already in a group, remove from the old group
            if (loadDep.groupIndex !== undefined) {
              groups[loadDep.groupIndex].splice(indexOf.call(groups[loadDep.groupIndex], loadDep), 1);

              // if the old group is empty, then we have a mixed depndency cycle
              if (groups[loadDep.groupIndex].length == 0)
                throw new TypeError("Mixed dependency cycle detected");
            }

            loadDep.groupIndex = loadDepGroupIndex;
          }

          buildLinkageGroups(loadDep, loads, groups);
        }
      }
    }
  }

  function doDynamicExecute(linkSet, load, linkError) {
    try {
      var module = load.execute();
    }
    catch(e) {
      linkError(load, e);
      return;
    }
    if (!module || !(module instanceof Module))
      linkError(load, new TypeError('Execution must define a Module instance'));
    else
      return module;
  }

  // 15.2.5.4
  function link(linkSet, linkError) {

    var loader = linkSet.loader;

    if (!linkSet.loads.length)
      return;

    // console.log('linking {' + logloads(linkSet.loads) + '}');
    // snapshot(loader);

    // 15.2.5.3.1 LinkageGroups alternative implementation

    // build all the groups
    // because the first load represents the top of the tree
    // for a given linkset, we can work down from there
    var groups = [];
    var startingLoad = linkSet.loads[0];
    startingLoad.groupIndex = 0;
    buildLinkageGroups(startingLoad, linkSet.loads, groups);

    // determine the kind of the bottom group
    var curGroupDeclarative = startingLoad.isDeclarative == groups.length % 2;

    // run through the groups from bottom to top
    for (var i = groups.length - 1; i >= 0; i--) {
      var group = groups[i];
      for (var j = 0; j < group.length; j++) {
        var load = group[j];

        // 15.2.5.5 LinkDeclarativeModules adjusted
        if (curGroupDeclarative) {
          linkDeclarativeModule(load, linkSet.loads, loader);
        }
        // 15.2.5.6 LinkDynamicModules adjusted
        else {
          var module = doDynamicExecute(linkSet, load, linkError);
          if (!module)
            return;
          load.module = {
            name: load.name,
            module: module
          };
          load.status = 'linked';
        }
        finishLoad(loader, load);
      }

      // alternative current kind for next loop
      curGroupDeclarative = !curGroupDeclarative;
    }
  }


  // custom module records for binding graph
  // store linking module records in a separate table
  function getOrCreateModuleRecord(name, loader) {
    var moduleRecords = loader.moduleRecords;
    return moduleRecords[name] || (moduleRecords[name] = {
      name: name,
      dependencies: [],
      module: new Module(), // start from an empty module and extend
      importers: []
    });
  }

  // custom declarative linking function
  function linkDeclarativeModule(load, loads, loader) {
    if (load.module)
      return;

    var module = load.module = getOrCreateModuleRecord(load.name, loader);
    var moduleObj = load.module.module;

    var registryEntry = load.declare.call(__global, function(name, value) {
      // NB This should be an Object.defineProperty, but that is very slow.
      //    By disaling this module write-protection we gain performance.
      //    It could be useful to allow an option to enable or disable this.
      module.locked = true;
      if(typeof name === 'object') {
        for(var p in name) {
          moduleObj[p] = name[p];
        }
      } else {
        moduleObj[name] = value;
      }

      for (var i = 0, l = module.importers.length; i < l; i++) {
        var importerModule = module.importers[i];
        if (!importerModule.locked) {
          var importerIndex = indexOf.call(importerModule.dependencies, module);
          importerModule.setters[importerIndex](moduleObj);
        }
      }

      module.locked = false;
      return value;
    });

    // setup our setters and execution function
    module.setters = registryEntry.setters;
    module.execute = registryEntry.execute;

    // now link all the module dependencies
    // amending the depMap as we go
    for (var i = 0, l = load.dependencies.length; i < l; i++) {
      var depName = load.dependencies[i].value;
      var depModule = loader.modules[depName];

      // if dependency not already in the module registry
      // then try and link it now
      if (!depModule) {
        // get the dependency load record
        for (var j = 0; j < loads.length; j++) {
          if (loads[j].name != depName)
            continue;

          // only link if already not already started linking (stops at circular / dynamic)
          if (!loads[j].module) {
            linkDeclarativeModule(loads[j], loads, loader);
            depModule = loads[j].module;
          }
          // if circular, create the module record
          else {
            depModule = getOrCreateModuleRecord(depName, loader);
          }
        }
      }

      // only declarative modules have dynamic bindings
      if (depModule.importers) {
        module.dependencies.push(depModule);
        depModule.importers.push(module);
      }
      else {
        // track dynamic records as null module records as already linked
        module.dependencies.push(null);
      }

      // run the setter for this dependency
      if (module.setters[i])
        module.setters[i](depModule.module);
    }

    load.status = 'linked';
  }



  // 15.2.5.5.1 LinkImports not implemented
  // 15.2.5.7 ResolveExportEntries not implemented
  // 15.2.5.8 ResolveExports not implemented
  // 15.2.5.9 ResolveExport not implemented
  // 15.2.5.10 ResolveImportEntries not implemented

  // 15.2.6.1
  function evaluateLoadedModule(loader, load) {
    console.assert(load.status == 'linked', 'is linked ' + load.name);

    doEnsureEvaluated(load.module, [], loader);
    return load.module.module;
  }

  /*
   * Module Object non-exotic for ES5:
   *
   * module.module        bound module object
   * module.execute       execution function for module
   * module.dependencies  list of module objects for dependencies
   * See getOrCreateModuleRecord for all properties
   *
   */
  function doExecute(module, loader) {
    try {
      module.execute.call(__global);
    }
    catch(e) {
		e.onModuleExecution = true;
		cleanupStack(e);
      return e;
    }
  }

  function cleanupStack(err) {
	  if (!err.originalErr) {
		var stack = (err.stack || err.message || err).toString().split('\n');
		var newStack = [];
		for (var i = 0; i < stack.length; i++) {
		  if (typeof $__curScript == 'undefined' || stack[i].indexOf($__curScript.src) == -1)
			newStack.push(stack[i]);
		}

		if(newStack.length) {
			err.stack = newStack.join('\n\t');
		}
	  }
	  return err;
  }

  // propogate execution errors
  // see https://bugs.ecmascript.org/show_bug.cgi?id=2993
  function doEnsureEvaluated(module, seen, loader) {
    var err = ensureEvaluated(module, seen, loader);
    if (err)
      throw err;
  }
  // 15.2.6.2 EnsureEvaluated adjusted
  function ensureEvaluated(module, seen, loader) {
    if (module.evaluated || !module.dependencies)
      return;

    seen.push(module);

    var deps = module.dependencies;
    var err;

    for (var i = 0, l = deps.length; i < l; i++) {
      var dep = deps[i];
      // dynamic dependencies are empty in module.dependencies
      // as they are already linked
      if (!dep)
        continue;
      if (indexOf.call(seen, dep) == -1) {
        err = ensureEvaluated(dep, seen, loader);
        // stop on error, see https://bugs.ecmascript.org/show_bug.cgi?id=2996
        if (err) {
          err = addToError(err, 'Error evaluating ' + dep.name + '\n');
          return err;
        }
      }
    }

    if (module.failed)
      return new Error('Module failed execution.');

    if (module.evaluated)
      return;

    module.evaluated = true;
    err = doExecute(module, loader);
    if (err) {
      module.failed = true;
    }
    else if (Object.preventExtensions) {
      // spec variation
      // we don't create a new module here because it was created and ammended
      // we just disable further extensions instead
      Object.preventExtensions(module.module);
    }

    module.execute = undefined;
    return err;
  }

  function addToError(error, msg) {
    var err = error;
    if (err instanceof Error)
      err.message = msg + err.message;
    else
      err = msg + err;
    return err;
  }

  // 26.3 Loader

  // 26.3.1.1
  function Loader(options) {
    if (typeof options != 'object')
      throw new TypeError('Options must be an object');

    if (options.normalize)
      this.normalize = options.normalize;
    if (options.locate)
      this.locate = options.locate;
    if (options.fetch)
      this.fetch = options.fetch;
    if (options.translate)
      this.translate = options.translate;
    if (options.instantiate)
      this.instantiate = options.instantiate;

    this._loader = {
      loaderObj: this,
      loads: [],
      modules: {},
      importPromises: {},
      moduleRecords: {}
    };

    // 26.3.3.6
    defineProperty(this, 'global', {
      get: function() {
        return __global;
      }
    });

    // 26.3.3.13 realm not implemented
  }

  function Module() {}

  // importPromises adds ability to import a module twice without error - https://bugs.ecmascript.org/show_bug.cgi?id=2601
  function createImportPromise(loader, name, promise) {
    var importPromises = loader._loader.importPromises;
    return importPromises[name] = promise.then(function(m) {
      importPromises[name] = undefined;
      return m;
    }, function(e) {
      importPromises[name] = undefined;
      throw e;
    });
  }

  Loader.prototype = {
    // 26.3.3.1
    constructor: Loader,
	anonymousCount: 0,
    // 26.3.3.2
    define: function(name, source, options) {
      // check if already defined
      if (this._loader.importPromises[name])
        throw new TypeError('Module is already loading.');
      return createImportPromise(this, name, new Promise(asyncStartLoadPartwayThrough({
        step: 'translate',
        loader: this._loader,
        moduleName: name,
        moduleMetadata: options && options.metadata || {},
        moduleSource: source,
        moduleAddress: options && options.address
      })));
    },
    // 26.3.3.3
    'delete': function(name) {
      var loader = this._loader;
      delete loader.importPromises[name];
      delete loader.moduleRecords[name];
	  if(this.failed) {
		  var load;
		  for(var i = 0; i < this.failed.length; i++) {
			  load = this.failed[i];
			  if(load.name === name) {
				  this.failed.splice(i, 1);
				  break;
			  }
		  }
	  }
      return loader.modules[name] ? delete loader.modules[name] : false;
    },
    // 26.3.3.4 entries not implemented
    // 26.3.3.5
    get: function(key) {
      if (!this._loader.modules[key])
        return;
      doEnsureEvaluated(this._loader.modules[key], [], this);
      return this._loader.modules[key].module;
    },
    // 26.3.3.7
    has: function(name) {
      return !!this._loader.modules[name];
    },
    // 26.3.3.8
    'import': function(name, options) {
      // run normalize first
      var loaderObj = this;

      // added, see https://bugs.ecmascript.org/show_bug.cgi?id=2659
      return Promise.resolve(loaderObj.normalize(name, options && options.name, options && options.address))
      .then(function(name) {
        var loader = loaderObj._loader;

        if (loader.modules[name]) {
          doEnsureEvaluated(loader.modules[name], [], loader._loader);
          return loader.modules[name].module;
        }

        return loader.importPromises[name] || createImportPromise(loaderObj, name,
          loadModule(loader, name, options || {})
          .then(function(load) {
            delete loader.importPromises[name];
            return evaluateLoadedModule(loader, load);
		  })
		  .then(null, function(err){
            if(loaderObj.defined) {
              loaderObj.defined[name] = undefined;
            }

			if(err.onModuleExecution && loaderObj.getModuleLoad) {
				var load = loaderObj.getModuleLoad(name);
				if(load) {
					return loaderObj.rejectWithCodeFrame(err, load);
				}
			} else if(err.promise) {
				return err.promise;
			}

            return Promise.reject(err);
          }));
      });
    },
    // 26.3.3.9 keys not implemented
    // 26.3.3.10
    load: function(name, options) {
      if (this._loader.modules[name]) {
        doEnsureEvaluated(this._loader.modules[name], [], this._loader);
        return Promise.resolve(this._loader.modules[name].module);
      }
      return this._loader.importPromises[name] || createImportPromise(this, name, loadModule(this._loader, name, {}));
    },
    // 26.3.3.11
    module: function(source, options) {
	  var name = "<Anonymous" + (++this.anonymousCount) + ">";
      var load = createLoad(name);
      load.address = options && options.address;
      var linkSet = createLinkSet(this._loader, load);
      var sourcePromise = Promise.resolve(source);
      var loader = this._loader;
      var p = linkSet.done.then(function() {
        return evaluateLoadedModule(loader, load);
      });
      proceedToTranslate(loader, load, sourcePromise);
      return p;
    },
    // 26.3.3.12
    newModule: function (obj) {
      if (typeof obj != 'object')
        throw new TypeError('Expected object');

      // we do this to be able to tell if a module is a module privately in ES5
      // by doing m instanceof Module
      var m = new Module();

      var pNames;
      if (Object.getOwnPropertyNames && obj != null) {
        pNames = Object.getOwnPropertyNames(obj);
      }
      else {
        pNames = [];
        for (var key in obj)
          pNames.push(key);
      }

      for (var i = 0; i < pNames.length; i++) (function(key) {
        defineProperty(m, key, {
          configurable: false,
          enumerable: true,
          get: function () {
            return obj[key];
          }
        });
      })(pNames[i]);

      if (Object.preventExtensions)
        Object.preventExtensions(m);

      return m;
    },
    // 26.3.3.14
    set: function(name, module) {
      if (!(module instanceof Module))
        throw new TypeError('Loader.set(' + name + ', module) must be a module');
      this._loader.modules[name] = {
        module: module
      };
    },
    // 26.3.3.15 values not implemented
    // 26.3.3.16 @@iterator not implemented
    // 26.3.3.17 @@toStringTag not implemented

    // 26.3.3.18.1
    normalize: function(name, referrerName, referrerAddress) {
      return name;
    },
    // 26.3.3.18.2
    locate: function(load) {
      return load.name;
    },
    // 26.3.3.18.3
    fetch: function(load) {
      throw new TypeError('Fetch not implemented');
    },
    // 26.3.3.18.4
    translate: function(load) {
      return load.source;
    },
    // 26.3.3.18.5
    instantiate: function(load) {
    },
    notifyLoad: function(specifier, name, parentName) {
    },
	provide: function(name, source, options) {
		var load;
		for(var i = 0; i < this._loader.loads.length; i++) {
			if(this._loader.loads[i].name === name) {
				load = this._loader.loads[i];
				break;
			}
		}

		if(load) {
			incrementPass(load);
            changeLoadingStatus(load, "loading");
			return proceedToTranslate(this._loader, load, Promise.resolve(source));
		} else {
			this["delete"](name);
		}

		return this.define(name, source, options);
	}
  };

  var _newModule = Loader.prototype.newModule;

  if (typeof exports === 'object')
    module.exports = Loader;

  __global.Reflect = __global.Reflect || {};
  __global.Reflect.Loader = __global.Reflect.Loader || Loader;
  __global.Reflect.global = __global.Reflect.global || __global;
  __global.LoaderPolyfill = Loader;

})();
/*
 * Traceur and Babel transpile hook for Loader
 */
(function(Loader) {
	var g = __global;

	var isNode = typeof self === "undefined" &&
		typeof process !== "undefined" &&
		{}.toString.call(process) === '[object process]';

	function getTranspilerModule(loader, globalName) {
		return loader.newModule({
			__useDefault: true,
			"default": g[globalName]
		});
	}

	function getTranspilerGlobalName(loadName) {
		return loadName === "babel" ? "Babel" : loadName;
	}

	// Use Babel by default
	Loader.prototype.transpiler = 'babel';

	Loader.prototype.transpile = function(load) {
		var self = this;

		// pick up Transpiler modules from existing globals on first run if set
		if (!self.transpilerHasRun) {
			if (g.traceur && !self.has('traceur')) {
				self.set('traceur', getTranspilerModule(self, 'traceur'));
			}
			if (g.Babel && !self.has("babel")) {
				self.set("babel", getTranspilerModule(self, "Babel"));
			}
			self.transpilerHasRun = true;
		}

		return self['import'](self.transpiler)
			.then(function(transpilerMod) {
				var transpiler = transpilerMod;
				if (transpiler.__useDefault) {
					transpiler = transpiler['default'];
				}

				return (transpiler.Compiler ? traceurTranspile : babelTranspile)
					.call(self, load, transpiler);
			})
			.then(function(code) {
				return 'var __moduleAddress = "' + load.address + '";' + code;
			});
	};

	Loader.prototype.instantiate = function(load) {
		var self = this;
		return Promise.resolve(self.normalize(self.transpiler))
			.then(function(transpilerNormalized) {
				// load transpiler as a global (avoiding System clobbering)
				if (load.name === transpilerNormalized) {
					return {
						deps: [],
						execute: function() {
							var curSystem = g.System;
							var curLoader = g.Reflect.Loader;
							// ensure not detected as CommonJS
							__eval('(function(require,exports,module){' + load.source + '})();', g, load);
							g.System = curSystem;
							g.Reflect.Loader = curLoader;
							return getTranspilerModule(self, getTranspilerGlobalName(load.name));
						}
					};
				}
			});
	};

	function traceurTranspile(load, traceur) {
		var options = this.traceurOptions || {};
		options.modules = 'instantiate';
		options.script = false;
		options.sourceMaps = 'inline';
		options.filename = load.address;
		options.inputSourceMap = load.metadata.sourceMap;
		options.moduleName = false;

		var compiler = new traceur.Compiler(options);
		var source = doTraceurCompile(load.source, compiler, options.filename);

		// add "!eval" to end of Traceur sourceURL
		// I believe this does something?
		source += '!eval';

		return source;
	}
	function doTraceurCompile(source, compiler, filename) {
		try {
			return compiler.compile(source, filename);
		}
		catch(e) {
			// traceur throws an error array
			throw e[0];
		}
	}

	/**
	 * Gets the babel environment name
	 * return {string} The babel environment name
	 */
	function getBabelEnv() {
		var loader = this;
		var defaultEnv = "development";
		var loaderEnv = typeof loader.getEnv === "function" && loader.getEnv();

		if (isNode) {
			return process.env.BABEL_ENV ||
				process.env.NODE_ENV ||
				loaderEnv ||
				defaultEnv;
		}
		else {
			return loaderEnv || defaultEnv;
		}
	}

	/**
	 * Gets the babel preset or plugin name
	 * @param {BabelPreset|BabelPlugin} presetOrPlugin A babel plugin or preset
	 * @return {?string} The preset/plugin name
	 */
	function getPresetOrPluginName(presetOrPlugin) {
		if (includesPresetOrPluginName(presetOrPlugin)) {
			return typeof presetOrPlugin === "string" ? presetOrPlugin : presetOrPlugin[0];
		}
		else {
			return null;
		}
	}

	/**
	 * Whether the babel plugin/preset name was provided
	 *
	 * @param {BabelPreset|BabelPlugin} presetOrPlugin
	 * @return {boolean}
	 */
	function includesPresetOrPluginName(presetOrPlugin) {
		return typeof presetOrPlugin === "string" ||
			presetOrPlugin.length && typeof presetOrPlugin[0] === "string";
	}

	/**
	 * A Babel plugins as defined in `babelOptions.plugins`
	 * @typedef {string|Function|<string, Object>[]|<Function, Object>[]} BabelPlugin
	 */

	var processBabelPlugins = (function() {
		/**
		 * Returns a list of babel plugins to be used during transpilation
		 *
		 * Collects the babel plugins defined in `babelOptions.plugins` plus
		 * the environment dependant plugins.
		 *
		 * @param {Object} babel The babel object exported by babel-standalone
		 * @param {babelOptions} babelOptions The babel configuration object
		 * @return {Promise.<BabelPlugin[]>} Promise that resolves to a list of babel plugins
		 */
		return function processBabelPlugins(babel, babelOptions) {
			var babelEnv = getBabelEnv.call(this);
			var babelEnvConfig = babelOptions.env || {};

			var pluginsPromises = [
				doProcessPlugins.call(this, babel, babelOptions.plugins)
			];

			for (var envName in babelEnvConfig) {
				// do not process plugins if the current environment does not match
				// the environment in which the plugins are set to be used
				if (babelEnv === envName) {
					var plugins = babelEnvConfig[envName].plugins || [];
					pluginsPromises.push(doProcessPlugins.call(this, babel, plugins));
				}
			}

			return Promise.all(pluginsPromises)
				.then(function(results) {
					var plugins = [];

					// results is an array of arrays, flatten it out!
					results.forEach(function(processedPlugins) {
						plugins = plugins.concat(processedPlugins);
					});

					return plugins;
				});
		}

		/**
		 * Collects builtin plugin names and non builtins functions
		 *
		 * @param {Object} babel The babel object exported by babel-standalone
		 * @param {BabelPlugin[]} babelPlugins A list of babel plugins
		 * @return {Promise.<BabelPlugin[]>} A promise that resolves to a list
		 *		of babel-standalone builtin plugin names and non-builtin plugin
		 *		functions
		 */
		function doProcessPlugins(babel, babelPlugins) {
			var promises = [];

			var plugins = babelPlugins || [];

			plugins.forEach(function(plugin) {
				var name = getPresetOrPluginName(plugin);

				if (!includesPresetOrPluginName(plugin) || isBuiltinPlugin(babel, name)) {
					promises.push(plugin);
				}
				else if (!isBuiltinPlugin(babel, name)) {
					var parent = this.configMain || "package.json!npm";
					var npmPluginNameOrPath = getNpmPluginNameOrPath(name);

					// import the plugin!
					promises.push(this["import"](npmPluginNameOrPath, { name: parent })
						.then(function(mod) {
							var exported = mod.__esModule ? mod["default"] : mod;

							if (typeof plugin === "string") {
								return exported;
							}
							// assume the array form was provided
							else {
								// [ pluginFunction, pluginOptions ]
								return [exported, plugin[1]];
							}
						}));
				}
			}, this);

			return Promise.all(promises);
		}

		/**
		 * Whether the plugin is built in babel-standalone
		 *
		 * @param {Object} babel The babel object exported by babel-standalone
		 * @param {string} pluginName The plugin name to be checked
		 * @return {boolean}
		 */
		function isBuiltinPlugin(babel, pluginName) {
			var isNpmPluginName = /^(?:babel-plugin-)/;
			var availablePlugins = babel.availablePlugins || {};

			// babel-standalone registers its bundled plugins using the shorthand name
			var shorthand = isNpmPluginName.test(pluginName) ?
				pluginName.replace("babel-plugin-", "") :
				pluginName;

			return !!availablePlugins[shorthand];
		}

		/**
		 * Returns babel full plugin name if shorthand was used or the path provided
		 *
		 * @param {string} name The entry in the plugin array
		 * @return {string} Relative/absolute path to plugin or babel npm plugin name
		 *
		 * If a babel plugin is on npm, it can be set in the `plugins` array using
		 * one of the following forms:
		 *
		 * 1) full plugin name, e.g `"plugins": ["babel-plugin-myPlugin"]`
		 * 2) relative/absolute path, e.g: `"plugins": ["./node_modules/asdf/plugin"]`
		 * 3) using a shorthand, e.g: `"plugins": ["myPlugin"]`
		 *
		 * Since plugins are loaded through steal, we need to make sure the full
		 * plugin name is passed to `steal.import` so the npm extension can locate
		 * the babel plugin. Relative/absolute paths should be loaded as any other
		 * module.
		 */
		function getNpmPluginNameOrPath(name) {
			var isPath = /\//;
			var isBabelPluginName = /^(?:babel-plugin-)/;

			return isPath.test(name) || isBabelPluginName.test(name) ?
				name : "babel-plugin-" + name;
		}
	}());

	function getBabelPlugins(current) {
		var plugins = current || [];
		var required = "transform-es2015-modules-systemjs";

		if (plugins.indexOf(required) === -1) {
			plugins.unshift(required);
		}

		return plugins;
	}

	var babelES2015Preset = "es2015-no-commonjs";

	function getBabelPresets(current, loader) {
		var presets = current || [];
		var forceES5 = loader.forceES5 !== false;
		var defaultPresets = forceES5 
			? [babelES2015Preset, "react", "stage-0"]
			: ["react"];

		// if the user provided a list of presets to be used, treat the
		// BABEL_ES2015_PRESET as required if stealCondig.forceES5 is `true`
		if (presets.length) {
			if (forceES5) {
				if (presets.indexOf(babelES2015Preset) != -1) {
					presets.unshift(babelES2015Preset);
				}
			}
		}

		return presets.length ? presets : defaultPresets;
	}

	function getBabelOptionsFromLoad(load) {
		var pkg = load.metadata.npmPackage;
		if(pkg) {
			var steal = pkg.steal || pkg.system;
			if(steal && steal.babelOptions) {
				return steal.babelOptions;
			}
		}
		return this.babelOptions || {};
	}

	/**
	 * Returns the babel version
	 * @param {Object} babel The babel object
	 * @return {number} The babel version
	 */
	function getBabelVersion(babel) {
		var babelVersion = babel.version ? +babel.version.split(".")[0] : 6;

		return babelVersion || 6;
	}

	function getBabelOptions(load, babel) {
		var loader = this;
		var options = getBabelOptionsFromLoad.call(loader, load);

		options.sourceMap = 'inline';
		options.filename = load.address;
		options.code = true;
		options.ast = false;

		if (getBabelVersion(babel) >= 6) {
			// delete the old babel options if they are present in config
			delete options.optional;
			delete options.whitelist;
			delete options.blacklist;

			// make sure presents and plugins needed for Steal to work
			// correctly are set
			options.presets = getBabelPresets(options.presets, loader);
			options.plugins = getBabelPlugins(options.plugins);
		}
		else {
			options.modules = 'system';

			if (!options.blacklist) {
				options.blacklist = ['react'];
			}
		}

		return options;
	}

	/**presets
	 * A Babel preset as defined in `babelOptions.presets`
	 * @typedef {string|Function|Object|<string, Object>[]|<Function, Object>[]|<Object, Object>} BabelPreset
	 */

	var processBabelPresets = (function() {
		/**
		 * Returns a list of babel presets to be used during transpilation
		 *
		 * Collects the babel presets defined in `babelOptions.presets` plus
		 * the environment dependant presets.
		 *
		 * @param {Object} babel The babel object exported by babel-standalone
		 * @param {babelOptions} babelOptions The babel configuration object
		 * @return {Promise.<BabelPreset[]>} Promise that resolves to a list of babel presets
		 */
		return function processBabelPresets(babel, babelOptions) {
			var babelEnv = getBabelEnv.call(this);
			var babelEnvConfig = babelOptions.env || {};

			var presetsPromises = [
				doProcessPresets.call(this, babel, babelOptions.presets)
			];

			for (var envName in babelEnvConfig) {
				// do not process presets if the current environment does not match
				// the environment in which the presets are set to be used
				if (babelEnv === envName) {
					var presets = babelEnvConfig[envName].presets || [];
					presetsPromises.push(doProcessPresets.call(this, babel, presets));
				}
			}

			return Promise.all(presetsPromises)
				.then(function(results) {
					var presets = [];

					// results is an array of arrays, flatten it out!
					results.forEach(function(processedPresets) {
						presets = presets.concat(processedPresets);
					});

					return presets;
				});
		};

		/**
		 * Collects builtin presets names and non builtins objects/functions
		 *
		 * @param {Object} babel The babel object exported by babel-standalone
		 * @param {BabelPreset[]} babelPresets A list of babel presets
		 * @return {Promise.<BabelPreset[]>} A promise that resolves to a list
		 *		of babel-standalone builtin preset names and non-builtin preset
		 *		definitions (object or function).
		 */
		function doProcessPresets(babel, babelPresets) {
			var promises = [];
			var presets = babelPresets || [];

			presets.forEach(function(preset) {
				var name = getPresetOrPluginName(preset);

				if (!includesPresetOrPluginName(preset) || isBuiltinPreset(babel, name)) {
					promises.push(preset);
				}
				else if (!isBuiltinPreset(babel, name)) {
					var parent = this.configMain || "package.json!npm";
					var npmPresetNameOrPath = getNpmPresetNameOrPath(name);

					// import the preset!
					promises.push(this["import"](npmPresetNameOrPath, { name: parent })
						.then(function(mod) {
							var exported = mod.__esModule ? mod["default"] : mod;

							if (typeof preset === "string") {
								return exported;
							}
							// assume the array form was provided
							else {
								// [ presetDefinition, presetOptions ]
								return [exported, preset[1]];
							}
						}));
				}
			}, this);

			return Promise.all(promises);
		}

		/**
		 * Whether the preset is built in babel-standalone
		 * @param {Object} babel The babel object exported by babel-standalone
		 * @param {string} pluginName The plugin name to be checked
		 * @return {boolean}
		 */
		function isBuiltinPreset(babel, presetName) {
			var isNpmPresetName = /^(?:babel-preset-)/;
			var availablePresets = babel.availablePresets || {};

			// babel-standalone registers its builtin presets using the shorthand name
			var shorthand = isNpmPresetName.test(presetName) ?
				presetName.replace("babel-preset-", "") :
				presetName;

			return !!availablePresets[shorthand];
		}

		function getNpmPresetNameOrPath(name) {
			var isPath = /\//;
			var isNpmPresetName = /^(?:babel-preset-)/;

			if (!isPath.test(name) && !isNpmPresetName.test(name)) {
				return "babel-preset-" + name;
			}

			return name;
		}
	}());

	/**
	 * Babel plugin that sets `__esModule` to true
	 *
	 * This flag is needed to interop the SystemJS format used by steal on the
	 * browser in development with the CJS format used for built modules.
	 *
	 * With dev bundles is possible to load a part of the app already built while
	 * other modules are being transpiled on the fly, with this flag, transpiled
	 * amd modules will be able to load the modules transpiled on the browser.
	 */
	function addESModuleFlagPlugin(babel) {
		var t = babel.types;

		return {
			visitor: {
				Program: function(path, state) {
					path.unshiftContainer("body", [
						t.exportNamedDeclaration(null, [
							t.exportSpecifier(t.identifier("true"),
								t.identifier("__esModule"))
						])
					]);
				}
			}
		};
	}

	function getImportSpecifierPositionsPlugin(load) {
		load.metadata.importSpecifiers = Object.create(null);
		load.metadata.importNames = Object.create(null);
		load.metadata.exportNames = Object.create(null);

		return {
			visitor: {
				ImportDeclaration: function(path, state){
					var node = path.node;
					var specifier = node.source.value;
					var loc = node.source.loc;
					load.metadata.importSpecifiers[specifier] = loc;

					var specifiers = load.metadata.importNames[specifier];
					if(!specifiers) {
						specifiers = load.metadata.importNames[specifier] = [];
					}

					specifiers.push.apply(specifiers, (
						node.specifiers || []
					).map(function(spec) {
						if(spec.type === "ImportDefaultSpecifier") {
							return "default";
						}
						return spec.imported && spec.imported.name;
					}));
				},
				ExportDeclaration: function(path, state){
					var node = path.node;

					if(node.source) {
						var specifier = node.source.value;
						var specifiers = load.metadata.exportNames[specifier];

						if(node.type === "ExportNamedDeclaration") {
							if(!specifiers) {
								specifiers = load.metadata.exportNames[specifier] = new Map();
							}

							node.specifiers.forEach(function(node){
								specifiers.set(node.exported.name, node.local.name);
							});
						} else if(node.type === "ExportAllDeclaration") {
							// TODO Not sure what to do here.
							load.metadata.exportNames[specifier] = 1;
						}
					}
				}
			}
		};
	}

	Loader.prototype._getImportSpecifierPositionsPlugin = getImportSpecifierPositionsPlugin;

	function babelTranspile(load, babelMod) {
		var loader = this;
		var babel = babelMod.Babel || babelMod.babel || babelMod;

		var babelVersion = getBabelVersion(babel);
		var options = getBabelOptions.call(loader, load, babel);

		return Promise.all([
			processBabelPlugins.call(this, babel, options),
			processBabelPresets.call(this, babel, options)
		])
		.then(function(results) {
			// might be running on an old babel that throws if there is a
			// plugins array in the options object
			if (babelVersion >= 6) {
				options.plugins = [
					getImportSpecifierPositionsPlugin.bind(null, load),
					addESModuleFlagPlugin
				].concat(results[0]);
				options.presets = results[1];
			}

			try {
				var result = babel.transform(load.source, options);
				var source = result.code;

				// add "!eval" to end of Babel sourceURL
				// I believe this does something?
				return source + '\n//# sourceURL=' + load.address + '!eval';
			} catch(ex) {
				if(ex instanceof SyntaxError) {
					var newError = new SyntaxError(ex.message);
					var stack = new loader.StackTrace(ex.message, [
						loader.StackTrace.item("", load.address,
							ex.loc.line, ex.loc.column)
					]);
					newError.stack = stack.toString();
					return Promise.reject(newError);
				}
				return Promise.reject(ex);
			}
		});
	}

})(__global.LoaderPolyfill);
/*
*********************************************************************************************

  System Loader Implementation

    - Implemented to https://github.com/jorendorff/js-loaders/blob/master/browser-loader.js

*********************************************************************************************
*/



(function() {
  var isWindows = typeof process != 'undefined' && !!process.platform.match(/^win/);
  var Promise = __global.Promise || require('when/es6-shim/Promise');

  // Helpers
  // Absolute URL parsing, from https://gist.github.com/Yaffle/1088850
  function parseURI(url) {
    var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@\/?#]*(?::[^:@\/?#]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
    // authority = '//' + user + ':' + pass '@' + hostname + ':' port
    return (m ? {
      href     : m[0] || '',
      protocol : m[1] || '',
      authority: m[2] || '',
      host     : m[3] || '',
      hostname : m[4] || '',
      port     : m[5] || '',
      pathname : m[6] || '',
      search   : m[7] || '',
      hash     : m[8] || ''
    } : null);
  }

  function removeDotSegments(input) {
    var output = [];
    input.replace(/^(\.\.?(\/|$))+/, '')
      .replace(/\/(\.(\/|$))+/g, '/')
      .replace(/\/\.\.$/, '/../')
      .replace(/\/?[^\/]*/g, function (p) {
        if (p === '/..')
          output.pop();
        else
          output.push(p);
    });
    return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
  }

  var doubleSlash = /^\/\//;

  function toAbsoluteURL(inBase, inHref) {
    var href = inHref;
    var base = inBase

	if(doubleSlash.test(inHref)) {
		// Default to http
		return 'http:' + inHref;
	}

    if (isWindows)
      href = href.replace(/\\/g, '/');

    href = parseURI(href || '');
    base = parseURI(base || '');

    return !href || !base ? null : (href.protocol || base.protocol) +
      (href.protocol || href.authority ? href.authority : base.authority) +
      removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
      (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
      href.hash;
  }

  var fetchTextFromURL;

  if (typeof XMLHttpRequest != 'undefined') {
    fetchTextFromURL = function(url, fulfill, reject) {
      var xhr = new XMLHttpRequest();
      var sameDomain = true;
      var doTimeout = false;
      if (!('withCredentials' in xhr)) {
        // check if same domain
        var domainCheck = /^(\w+:)?\/\/([^\/]+)/.exec(url);
        if (domainCheck) {
          sameDomain = domainCheck[2] === window.location.host;
          if (domainCheck[1])
            sameDomain &= domainCheck[1] === window.location.protocol;
        }
      }
      if (!sameDomain && typeof XDomainRequest != 'undefined') {
        xhr = new XDomainRequest();
        xhr.onload = load;
        xhr.onerror = error;
        xhr.ontimeout = error;
        xhr.onprogress = function() {};
        xhr.timeout = 0;
        doTimeout = true;
      }
      function load() {
        fulfill(xhr.responseText);
      }
      function error() {
		var s = xhr.status;
        var msg = s + ' ' + xhr.statusText + ': ' + url + '\n' || 'XHR error';
        var err = new Error(msg);
		err.url = url;
        err.statusCode = s;
        reject(err);
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || (xhr.status == 0 && xhr.responseText)) {
            load();
          } else {
            error();
          }
        }
      };
      xhr.open("GET", url, true);

      if (doTimeout)
        setTimeout(function() {
          xhr.send();
        }, 0);

      xhr.send(null);
    }
  }
  else if (typeof require != 'undefined') {
    var fs, http, https, fourOhFourFS = /ENOENT/;
    fetchTextFromURL = function(rawUrl, fulfill, reject) {
      if (rawUrl.substr(0, 5) === 'file:') {
		  fs = fs || require('fs');
		  var url = rawUrl.substr(5);
		  if (isWindows)
			url = url.replace(/\//g, '\\');
		  return fs.readFile(url, function(err, data) {
			if (err) {
			  // Mark this error as a 404, so that the npm extension
			  // will know to retry.
			  if(fourOhFourFS.test(err.message)) {
				err.statusCode = 404;
			  err.url = rawUrl;
			  }

			  return reject(err);
			} else {
			  fulfill(data + '');
			}
		  });
	  } else if(rawUrl.substr(0, 4) === 'http') {
		  var h;
		  if(rawUrl.substr(0, 6) === 'https:') {
			  h = https = https || require('https');
		  } else {
			  h = http = http || require('http');
		  }
		  return h.get(rawUrl, function(res) {
			  if(res.statusCode !== 200) {
				  reject(new Error('Request failed. Status: ' + res.statusCode));
			  } else {
				  var rawData = "";
				  res.setEncoding("utf8");
				  res.on("data", function(chunk) {
					  rawData += chunk;
				  });
				  res.on("end", function(){
					  fulfill(rawData);
				  });
			  }
		  })
	  }
    }
  }
  else if(typeof fetch === 'function') {
    fetchTextFromURL = function(url, fulfill, reject) {
      fetch(url).then(function(resp){
        return resp.text();
      }).then(function(text){
        fulfill(text);
      }).then(null, function(err){
        reject(err);
      });
    }
  }
  else {
    throw new TypeError('No environment fetch API available.');
  }

  function transformError(err, load, loader) {
	  if(typeof loader.getDependants === "undefined") {
		  return Promise.resolve();
	  }
	  var dependants = loader.getDependants(load.name);
	  if(Array.isArray(dependants) && dependants.length) {
		  var StackTrace = loader.StackTrace;
		  var isProd = loader.isEnv("production");

		  return Promise.resolve()
		  .then(function(){
			  return isProd ? Promise.resolve() : loader["import"]("@@babel-code-frame");
		  })
		  .then(function(codeFrame){
			  var parentLoad = loader.getModuleLoad(dependants[0]);
			  var pos = loader.getImportSpecifier(load.name, parentLoad) || {
				  line: 1, column: 0
			  };

			  var detail = "The module [" + loader.prettyName(load) + "] couldn't be fetched.\n" +
				"Clicking the link in the stack trace below takes you to the import.\n" +
				"See https://stealjs.com/docs/StealJS.error-messages.html#404-not-found for more information.\n";
			  var msg = err.message + "\n" + detail;

			  if(!isProd) {
				  var src = parentLoad.metadata.originalSource || parentLoad.source;
				  var codeSample = codeFrame(src, pos.line, pos.column);
				  msg += "\n" + codeSample + "\n";
			  }

			  err.message = msg;

			  var stackTrace = new StackTrace(msg, [
				  StackTrace.item(null, parentLoad.address, pos.line, pos.column)
			  ]);

			  err.stack = stackTrace.toString();
		  })
	  }
	  return Promise.resolve();
  }

  var SystemLoader = function($__super) {
    function SystemLoader(options) {
      $__super.call(this, options || {});

      // Set default baseURL and paths
      if (typeof location != 'undefined' && location.href) {
        var href = __global.location.href.split('#')[0].split('?')[0];
        this.baseURL = href.substring(0, href.lastIndexOf('/') + 1);
      }
      else if (typeof process != 'undefined' && process.cwd) {
        this.baseURL = 'file:' + process.cwd() + '/';
        if (isWindows)
          this.baseURL = this.baseURL.replace(/\\/g, '/');
      }
      else {
        throw new TypeError('No environment baseURL');
      }
      this.paths = { '*': '*.js' };
    }

    SystemLoader.__proto__ = ($__super !== null ? $__super : Function.prototype);
    SystemLoader.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

    $__Object$defineProperty(SystemLoader.prototype, "constructor", {
      value: SystemLoader
    });

    $__Object$defineProperty(SystemLoader.prototype, "global", {
      get: function() {
        return isBrowser ? window : (isWorker ? self : __global);
      },

      enumerable: false
    });

    $__Object$defineProperty(SystemLoader.prototype, "strict", {
      get: function() { return true; },
      enumerable: false
    });

    $__Object$defineProperty(SystemLoader.prototype, "normalize", {
      value: function(name, parentName, parentAddress) {
        if (typeof name != 'string')
          throw new TypeError('Module name must be a string');

        var segments = name.split('/');

        if (segments.length == 0)
          throw new TypeError('No module name provided');

        // current segment
        var i = 0;
        // is the module name relative
        var rel = false;
        // number of backtracking segments
        var dotdots = 0;
        if (segments[0] == '.') {
          i++;
          if (i == segments.length)
            throw new TypeError('Illegal module name "' + name + '"');
          rel = true;
        }
        else {
          while (segments[i] == '..') {
            i++;
            if (i == segments.length)
              throw new TypeError('Illegal module name "' + name + '"');
          }
          if (i)
            rel = true;
          dotdots = i;
        }

        /*for (var j = i; j < segments.length; j++) {
          var segment = segments[j];
          if (segment == '' || segment == '.' || segment == '..')
            throw new TypeError('Illegal module name "' + name + '"');
        }*/

        if (!rel)
          return name;

        // build the full module name
        var normalizedParts = [];
        var parentParts = (parentName || '').split('/');
        var normalizedLen = parentParts.length - 1 - dotdots;

        normalizedParts = normalizedParts.concat(parentParts.splice(0, parentParts.length - 1 - dotdots));
        normalizedParts = normalizedParts.concat(segments.splice(i, segments.length - i));

        return normalizedParts.join('/');
      },

      enumerable: false,
      writable: true
    });

    $__Object$defineProperty(SystemLoader.prototype, "locate", {
      value: function(load) {
        var name = load.name;

        // NB no specification provided for System.paths, used ideas discussed in https://github.com/jorendorff/js-loaders/issues/25

        // most specific (longest) match wins
        var pathMatch = '', wildcard;

        // check to see if we have a paths entry
        for (var p in this.paths) {
          var pathParts = p.split('*');
          if (pathParts.length > 2)
            throw new TypeError('Only one wildcard in a path is permitted');

          // exact path match
          if (pathParts.length == 1) {
            if (name == p && p.length > pathMatch.length) {
              pathMatch = p;
              break;
            }
          }

          // wildcard path match
          else {
            if (name.substr(0, pathParts[0].length) == pathParts[0] && name.substr(name.length - pathParts[1].length) == pathParts[1]) {
              pathMatch = p;
              wildcard = name.substr(pathParts[0].length, name.length - pathParts[1].length - pathParts[0].length);
            }
          }
        }

        var outPath = this.paths[pathMatch];
        if (wildcard)
          outPath = outPath.replace('*', wildcard);

        // percent encode just '#' in module names
        // according to https://github.com/jorendorff/js-loaders/blob/master/browser-loader.js#L238
        // we should encode everything, but it breaks for servers that don't expect it
        // like in (https://github.com/systemjs/systemjs/issues/168)
        if (isBrowser)
          outPath = outPath.replace(/#/g, '%23');

        return toAbsoluteURL(this.baseURL, outPath);
      },

      enumerable: false,
      writable: true
    });

    $__Object$defineProperty(SystemLoader.prototype, "fetch", {
      value: function(load) {
        var self = this;
        return new Promise(function(resolve, reject) {
          function onError(err) {
              var r = reject.bind(null, err);
              transformError(err, load, self)
              .then(r, r);
          }

          fetchTextFromURL(toAbsoluteURL(self.baseURL, load.address), function(source) {
            resolve(source);
        }, onError);
        });
      },

      enumerable: false,
      writable: true
    });

    return SystemLoader;
  }(__global.LoaderPolyfill);

  var System = new SystemLoader();

  // note we have to export before runing "init" below
  if (typeof exports === 'object')
    module.exports = System;

  __global.System = System;
})();


// Define our eval outside of the scope of any other reference defined in this
// file to avoid adding those references to the evaluation scope.
function __eval(__source, __global, __load) {
  try {
    eval('(function() { var __moduleName = "' + (__load.name || '').replace('"', '\"') + '"; ' + __source + ' \n }).call(__global);');
  }
  catch(e) {
    if (e.name == 'SyntaxError' || e.name == 'TypeError')
      e.message = 'Evaluating ' + (__load.name || load.address) + '\n\t' + e.message;
    throw e;
  }
}

})(typeof window != 'undefined' ? window : (typeof WorkerGlobalScope != 'undefined' ?
                                           self : global));

/*
 * StealJS base extension
 *
 * **src/base/base.js** is an autogenerated file; any change should be
 * made to the source files in **src/base/lib/*.js**
 */


(function($__global) {

$__global.upgradeSystemLoader = function() {
  $__global.upgradeSystemLoader = undefined;

  // indexOf polyfill for IE
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  var isWindows = typeof process != 'undefined' && !!process.platform.match(/^win/);

  // Absolute URL parsing, from https://gist.github.com/Yaffle/1088850
  function parseURI(url) {
    var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@\/?#]*(?::[^:@\/?#]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
    // authority = '//' + user + ':' + pass '@' + hostname + ':' port
    return (m ? {
      href     : m[0] || '',
      protocol : m[1] || '',
      authority: m[2] || '',
      host     : m[3] || '',
      hostname : m[4] || '',
      port     : m[5] || '',
      pathname : m[6] || '',
      search   : m[7] || '',
      hash     : m[8] || ''
    } : null);
  }
  function toAbsoluteURL(inBase, inHref) {
	var base = inBase;
	var href = inHref;
    function removeDotSegments(input) {
      var output = [];
      input.replace(/^(\.\.?(\/|$))+/, '')
        .replace(/\/(\.(\/|$))+/g, '/')
        .replace(/\/\.\.$/, '/../')
        .replace(/\/?[^\/]*/g, function (p) {
          if (p === '/..')
            output.pop();
          else
            output.push(p);
      });
      return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
    }

    if (isWindows)
      href = href.replace(/\\/g, '/');

    href = parseURI(href || '');
    base = parseURI(base || '');

    return !href || !base ? null : (href.protocol || base.protocol) +
      (href.protocol || href.authority ? href.authority : base.authority) +
      removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
      (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
      href.hash;
  }

  // clone the original System loader
  var System;
  (function() {
    var originalSystem = $__global.System;
    System = $__global.System = new LoaderPolyfill(originalSystem);
    System.baseURL = originalSystem.baseURL;
    System.paths = { '*': '*.js' };
    System.originalSystem = originalSystem;
  })();

  System.noConflict = function() {
    $__global.SystemJS = System;
    $__global.System = System.originalSystem;
  }

var getOwnPropertyDescriptor = true;
try {
  Object.getOwnPropertyDescriptor({ a: 0 }, 'a');
}
catch(e) {
  getOwnPropertyDescriptor = false;
}

var defineProperty;
(function () {
  try {
    if (!!Object.defineProperty({}, 'a', {}))
      defineProperty = Object.defineProperty;
  }
  catch (e) {
    defineProperty = function(obj, prop, opt) {
      try {
        obj[prop] = opt.value || opt.get.call(obj);
      }
      catch(e) {}
    }
  }
})();

// converts any module.exports object into an object ready for SystemJS.newModule
function getESModule(exports) {
  var esModule = {};
  // don't trigger getters/setters in environments that support them
  if ((typeof exports == 'object' || typeof exports == 'function') && exports !== $__global) {
      if (getOwnPropertyDescriptor) {
        for (var p in exports) {
          // The default property is copied to esModule later on
          if (p === 'default')
            continue;
          defineOrCopyProperty(esModule, exports, p);
        }
      }
      else {
        extend(esModule, exports);
      }
  }
  esModule['default'] = exports;
  defineProperty(esModule, '__useDefault', {
    value: true
  });
  return esModule;
}

function defineOrCopyProperty(targetObj, sourceObj, propName) {
  try {
    var d;
    if (d = Object.getOwnPropertyDescriptor(sourceObj, propName))
      defineProperty(targetObj, propName, d);
  }
  catch (ex) {
    // Object.getOwnPropertyDescriptor threw an exception, fall back to normal set property
    // we dont need hasOwnProperty here because getOwnPropertyDescriptor would have returned undefined above
    targetObj[propName] = sourceObj[propName];
    return false;
  }
}

function extend(a, b, prepend) {
  var hasOwnProperty = b && b.hasOwnProperty;
  for (var p in b) {
    if (hasOwnProperty && !b.hasOwnProperty(p))
      continue;
    if (!prepend || !(p in a))
      a[p] = b[p];
  }
  return a;
}

/*
 * SystemJS Core
 * Code should be vaguely readable
 *
 */
var originalSystem = $__global.System.originalSystem;
function core(loader) {
  /*
    __useDefault

    When a module object looks like:
    newModule(
      __useDefault: true,
      default: 'some-module'
    })

    Then importing that module provides the 'some-module'
    result directly instead of the full module.

    Useful for eg module.exports = function() {}
  */
  var loaderImport = loader['import'];
  loader['import'] = function(name, options) {
    return loaderImport.call(this, name, options).then(function(module) {
      return module.__useDefault ? module['default'] : module;
    });
  };

  // support the empty module, as a concept
  var emptyNamespace = {};
  Object.defineProperty(emptyNamespace, "__esModule", {
	  enumerable: false,
	  configurable: true,
	  writable: false,
	  value: true
  })
  loader.set('@empty', loader.newModule(emptyNamespace));

  // include the node require since we're overriding it
  if (typeof require != 'undefined')
    loader._nodeRequire = require;

  /*
    Config
    Extends config merging one deep only

    loader.config({
      some: 'random',
      config: 'here',
      deep: {
        config: { too: 'too' }
      }
    });

    <=>

    loader.some = 'random';
    loader.config = 'here'
    loader.deep = loader.deep || {};
    loader.deep.config = { too: 'too' };
  */
  loader.config = function(cfg) {
    for (var c in cfg) {
      var v = cfg[c];
      if (typeof v == 'object' && !(v instanceof Array)) {
        this[c] = this[c] || {};
        for (var p in v)
          this[c][p] = v[p];
      }
      else
        this[c] = v;
    }
  };

  // override locate to allow baseURL to be document-relative
  var baseURI;
  if (typeof window == 'undefined' &&
      typeof WorkerGlobalScope == 'undefined') {
    baseURI = 'file:' + process.cwd() + '/';
    if (isWindows)
      baseURI = baseURI.replace(/\\/g, '/');
  }
  // Inside of a Web Worker
  else if(typeof window == 'undefined') {
    baseURI = loader.global.location.href;
  }
  else {
    baseURI = document.baseURI;
    if (!baseURI) {
      var bases = document.getElementsByTagName('base');
      baseURI = bases[0] && bases[0].href || window.location.href;
    }
  }

  var loaderLocate = loader.locate;
  var normalizedBaseURL;
  loader.locate = function(load) {
    if (this.baseURL != normalizedBaseURL) {
      normalizedBaseURL = toAbsoluteURL(baseURI, this.baseURL);

      if (normalizedBaseURL.substr(normalizedBaseURL.length - 1, 1) != '/')
        normalizedBaseURL += '/';
      this.baseURL = normalizedBaseURL;
    }

    return Promise.resolve(loaderLocate.call(this, load));
  };

  loader._getLineAndColumnFromPosition = function(source, position) {
	var matchIndex = (position || 0) + 1;
	var idx = 0, line = 1, col = 0, len = source.length, char;
	while(matchIndex && idx < len) {
		char = source[idx];
		if(matchIndex === idx) {
			break;
		} else if(char === "\n") {
			idx++;
			line++;
			col = 0;
			continue;
		}
		col++;
		idx++;
	}
	return {
		line: line,
		column: col
	};
  };

  function applyExtensions(extensions, loader) {
    loader._extensions = [];
    for(var i = 0, len = extensions.length; i < len; i++) {
      extensions[i](loader);
    }
  }

  loader._extensions = loader._extensions || [];
  loader._extensions.push(core);

  loader.clone = function() {
    var originalLoader = this;
    var loader = new LoaderPolyfill(originalSystem);
    loader.baseURL = originalLoader.baseURL;
    loader.paths = { '*': '*.js' };
    applyExtensions(originalLoader._extensions, loader);
    return loader;
  };
}

/*
 * Meta Extension
 *
 * Sets default metadata on a load record (load.metadata) from
 * loader.meta[moduleName].
 * Also provides an inline meta syntax for module meta in source.
 *
 * Eg:
 *
 * loader.meta['my/module'] = { some: 'meta' };
 *
 * load.metadata.some = 'meta' will now be set on the load record.
 *
 * The same meta could be set with a my/module.js file containing:
 * 
 * my/module.js
 *   "some meta"; 
 *   "another meta";
 *   console.log('this is my/module');
 *
 * The benefit of inline meta is that coniguration doesn't need
 * to be known in advance, which is useful for modularising
 * configuration and avoiding the need for configuration injection.
 *
 *
 * Example
 * -------
 *
 * The simplest meta example is setting the module format:
 *
 * System.meta['my/module'] = { format: 'amd' };
 *
 * or inside 'my/module.js':
 *
 * "format amd";
 * define(...);
 * 
 */

function meta(loader) {
  var metaRegEx = /^(\s*\/\*.*\*\/|\s*\/\/[^\n]*|\s*"[^"]+"\s*;?|\s*'[^']+'\s*;?)+/;
  var metaPartRegEx = /\/\*.*\*\/|\/\/[^\n]*|"[^"]+"\s*;?|'[^']+'\s*;?/g;

  loader.meta = {};
  loader._extensions = loader._extensions || [];
  loader._extensions.push(meta);

  function setConfigMeta(loader, load) {
    var meta = loader.meta && loader.meta[load.name];
    if (meta) {
      for (var p in meta)
        load.metadata[p] = load.metadata[p] || meta[p];
    }
  }

  var loaderLocate = loader.locate;
  loader.locate = function(load) {
    setConfigMeta(this, load);
    return loaderLocate.call(this, load);
  }

  var loaderTranslate = loader.translate;
  loader.translate = function(load) {
    // detect any meta header syntax
    var meta = load.source.match(metaRegEx);
    if (meta) {
      var metaParts = meta[0].match(metaPartRegEx);
      for (var i = 0; i < metaParts.length; i++) {
        var len = metaParts[i].length;

        var firstChar = metaParts[i].substr(0, 1);
        if (metaParts[i].substr(len - 1, 1) == ';')
          len--;
      
        if (firstChar != '"' && firstChar != "'")
          continue;

        var metaString = metaParts[i].substr(1, metaParts[i].length - 3);

        var metaName = metaString.substr(0, metaString.indexOf(' '));
        if (metaName) {
          var metaValue = metaString.substr(metaName.length + 1, metaString.length - metaName.length - 1);

          if (load.metadata[metaName] instanceof Array)
            load.metadata[metaName].push(metaValue);
          else if (!load.metadata[metaName])
            load.metadata[metaName] = metaValue;
        }
      }
    }
    // config meta overrides
    setConfigMeta(this, load);
    
    return loaderTranslate.call(this, load);
  }
}

/*
 * Instantiate registry extension
 *
 * Supports Traceur System.register 'instantiate' output for loading ES6 as ES5.
 *
 * - Creates the loader.register function
 * - Also supports metadata.format = 'register' in instantiate for anonymous register modules
 * - Also supports metadata.deps, metadata.execute and metadata.executingRequire
 *     for handling dynamic modules alongside register-transformed ES6 modules
 *
 * Works as a standalone extension, but benefits from having a more
 * advanced __eval defined like in SystemJS polyfill-wrapper-end.js
 *
 * The code here replicates the ES6 linking groups algorithm to ensure that
 * circular ES6 compiled into System.register can work alongside circular AMD
 * and CommonJS, identically to the actual ES6 loader.
 *
 */
function register(loader) {
  if (typeof indexOf == 'undefined')
    indexOf = Array.prototype.indexOf;
  if (typeof __eval == 'undefined' || typeof document != 'undefined' && !document.addEventListener)
    __eval = 0 || eval; // uglify breaks without the 0 ||

  loader._extensions = loader._extensions || [];
  loader._extensions.push(register);

  // define exec for easy evaluation of a load record (load.name, load.source, load.address)
  // main feature is source maps support handling
  var curSystem;
  function exec(load, execContext) {
    var loader = this;
    var context = execContext;
    // support sourceMappingURL (efficiently)
    var sourceMappingURL;
    var lastLineIndex = load.source.lastIndexOf('\n');
    if (lastLineIndex != -1) {
      if (load.source.substr(lastLineIndex + 1, 21) == '//# sourceMappingURL=') {
        sourceMappingURL = load.source.substr(lastLineIndex + 22, load.source.length - lastLineIndex - 22);
        if (typeof toAbsoluteURL != 'undefined')
          sourceMappingURL = toAbsoluteURL(load.address, sourceMappingURL);
      }
    }

    var evalType = load.metadata && load.metadata.eval;
    context = context || loader.global;
    __eval(load.source, load.address, context, sourceMappingURL, evalType);
  }
  loader.__exec = exec;

  function dedupe(deps) {
    var newDeps = [];
    for (var i = 0, l = deps.length; i < l; i++)
      if (indexOf.call(newDeps, deps[i]) == -1)
        newDeps.push(deps[i])
    return newDeps;
  }

  /*
   * There are two variations of System.register:
   * 1. System.register for ES6 conversion (2-3 params) - System.register([name, ]deps, declare)
   *    see https://github.com/ModuleLoader/es6-module-loader/wiki/System.register-Explained
   *
   * 2. System.register for dynamic modules (3-4 params) - System.register([name, ]deps, executingRequire, execute)
   * the true or false statement
   *
   * this extension implements the linking algorithm for the two variations identical to the spec
   * allowing compiled ES6 circular references to work alongside AMD and CJS circular references.
   *
   */
  // loader.register sets loader.defined for declarative modules
  var anonRegister;
  var calledRegister;
  function registerModule(regName, regDeps, regDeclare, regExecute) {
    var name = regName;
    var deps = regDeps;
    var declare = regDeclare;
    var execute = regExecute;
    if (typeof name != 'string') {
      execute = declare;
      declare = deps;
      deps = name;
      name = null;
    }

    calledRegister = true;

    var register;

    // dynamic
    if (typeof declare == 'boolean') {
      register = {
        declarative: false,
        deps: deps,
        execute: execute,
        executingRequire: declare
      };
    }
    else {
      // ES6 declarative
      register = {
        declarative: true,
        deps: deps,
        declare: declare
      };
    }

    // named register
    if (name) {
      register.name = name;
      // we never overwrite an existing define
      if (!(name in loader.defined))
        loader.defined[name] = register;
    }
    // anonymous register
    else if (register.declarative) {
      if (anonRegister)
        throw new TypeError('Multiple anonymous System.register calls in the same module file.');
      anonRegister = register;
    }
  }
  /*
   * Registry side table - loader.defined
   * Registry Entry Contains:
   *    - name
   *    - deps
   *    - declare for declarative modules
   *    - execute for dynamic modules, different to declarative execute on module
   *    - executingRequire indicates require drives execution for circularity of dynamic modules
   *    - declarative optional boolean indicating which of the above
   *
   * Can preload modules directly on System.defined['my/module'] = { deps, execute, executingRequire }
   *
   * Then the entry gets populated with derived information during processing:
   *    - normalizedDeps derived from deps, created in instantiate
   *    - groupIndex used by group linking algorithm
   *    - evaluated indicating whether evaluation has happend
   *    - module the module record object, containing:
   *      - exports actual module exports
   *
   *    Then for declarative only we track dynamic bindings with the records:
   *      - name
   *      - setters declarative setter functions
   *      - exports actual module values
   *      - dependencies, module records of dependencies
   *      - importers, module records of dependents
   *
   * After linked and evaluated, entries are removed, declarative module records remain in separate
   * module binding table
   *
   */

  function defineRegister(loader) {
    if (loader.register)
      return;

    loader.register = registerModule;

    if (!loader.defined)
      loader.defined = {};

    // script injection mode calls this function synchronously on load
    var onScriptLoad = loader.onScriptLoad;
    loader.onScriptLoad = function(load) {
      onScriptLoad(load);
      // anonymous define
      if (anonRegister)
        load.metadata.entry = anonRegister;

      if (calledRegister) {
        load.metadata.format = load.metadata.format || 'register';
        load.metadata.registered = true;
      }
    }
  }

  defineRegister(loader);

  function buildGroups(entry, loader, groups) {
    groups[entry.groupIndex] = groups[entry.groupIndex] || [];

    if (indexOf.call(groups[entry.groupIndex], entry) != -1)
      return;

    groups[entry.groupIndex].push(entry);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = loader.defined[depName];

      // not in the registry means already linked / ES6
      if (!depEntry || depEntry.evaluated)
        continue;

      // now we know the entry is in our unlinked linkage group
      var depGroupIndex = entry.groupIndex + (depEntry.declarative != entry.declarative);

      // the group index of an entry is always the maximum
      if (depEntry.groupIndex === undefined || depEntry.groupIndex < depGroupIndex) {

        // if already in a group, remove from the old group
        if (depEntry.groupIndex !== undefined) {
          groups[depEntry.groupIndex].splice(indexOf.call(groups[depEntry.groupIndex], depEntry), 1);

          // if the old group is empty, then we have a mixed depndency cycle
          if (groups[depEntry.groupIndex].length == 0)
            throw new TypeError("Mixed dependency cycle detected");
        }

        depEntry.groupIndex = depGroupIndex;
      }

      buildGroups(depEntry, loader, groups);
    }
  }

  function link(name, loader) {
    var startEntry = loader.defined[name];

    // skip if already linked
    if (startEntry.module)
      return;

    startEntry.groupIndex = 0;

    var groups = [];

    buildGroups(startEntry, loader, groups);

    var curGroupDeclarative = !!startEntry.declarative == groups.length % 2;
    for (var i = groups.length - 1; i >= 0; i--) {
      var group = groups[i];
      for (var j = 0; j < group.length; j++) {
        var entry = group[j];

        // link each group
        if (curGroupDeclarative)
          linkDeclarativeModule(entry, loader);
        else
          linkDynamicModule(entry, loader);
      }
      curGroupDeclarative = !curGroupDeclarative;
    }
  }

  // module binding records
  var moduleRecords = {};
  function getOrCreateModuleRecord(name) {
    return moduleRecords[name] || (moduleRecords[name] = {
      name: name,
      dependencies: [],
      exports: {}, // start from an empty module and extend
      importers: []
    })
  }

  function linkDeclarativeModule(entry, loader) {
    // only link if already not already started linking (stops at circular)
    if (entry.module)
      return;

    var module = entry.module = getOrCreateModuleRecord(entry.name);
    var exports = entry.module.exports;

    var declaration = entry.declare.call(loader.global, function(name, value) {
      module.locked = true;
      exports[name] = value;

      for (var i = 0, l = module.importers.length; i < l; i++) {
        var importerModule = module.importers[i];
        if (!importerModule.locked) {
          var importerIndex = indexOf.call(importerModule.dependencies, module);
          importerModule.setters[importerIndex](exports);
        }
      }

      module.locked = false;
      return value;
    });

    module.setters = declaration.setters;
    module.execute = declaration.execute;

    if (!module.setters || !module.execute) {
      throw new TypeError('Invalid System.register form for ' + entry.name);
    }

    // now link all the module dependencies
    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = loader.defined[depName];
      var depModule = moduleRecords[depName];

      // work out how to set depExports based on scenarios...
      var depExports;

      if (depModule) {
        depExports = depModule.exports;
      }
      // dynamic, already linked in our registry
      else if (depEntry && !depEntry.declarative) {
        if (depEntry.module.exports && depEntry.module.exports.__esModule)
          depExports = depEntry.module.exports;
        else
          depExports = depEntry.esModule;
          //depExports = { 'default': depEntry.module.exports, '__useDefault': true };
      }
      // in the loader registry
      else if (!depEntry) {
        depExports = loader.get(depName);
      }
      // we have an entry -> link
      else {
        linkDeclarativeModule(depEntry, loader);
        depModule = depEntry.module;
        depExports = depModule.exports;
      }

      // only declarative modules have dynamic bindings
      if (depModule && depModule.importers) {
        depModule.importers.push(module);
        module.dependencies.push(depModule);
      }
      else {
        module.dependencies.push(null);
      }

      // run the setter for this dependency
      if (module.setters[i])
        module.setters[i](depExports);
    }
  }

  // An analog to loader.get covering execution of all three layers (real declarative, simulated declarative, simulated dynamic)
  function getModule(name, loader) {
    var exports;
    var entry = loader.defined[name];

    if (!entry) {
      exports = loader.get(name);
      if (!exports)
        throw new Error('Unable to load dependency ' + name + '.');
    }

    else {
      if (entry.declarative)
        ensureEvaluated(name, [], loader);

      else if (!entry.evaluated)
        linkDynamicModule(entry, loader);

      exports = entry.module.exports;
    }

    if ((!entry || entry.declarative) && exports && exports.__useDefault)
      return exports['default'];

    return exports;
  }

  function linkDynamicModule(entry, loader) {
    if (entry.module)
      return;

    var exports = {};
	if(entry.isESModule) {
		Object.defineProperty(exports, '__esModule', { value: true });
	}

    var module = entry.module = { exports: exports, id: entry.name };

    // AMD requires execute the tree first
    if (!entry.executingRequire) {
      for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
        var depName = entry.normalizedDeps[i];
        var depEntry = loader.defined[depName];
        if (depEntry)
          linkDynamicModule(depEntry, loader);
      }
    }

    // now execute
    entry.evaluated = true;
    var output = entry.execute.call(loader.global, function(name) {
      for (var i = 0, l = entry.deps.length; i < l; i++) {
        if (entry.deps[i] != name)
          continue;
        return getModule(entry.normalizedDeps[i], loader);
      }
      throw new TypeError('Module ' + name + ' not declared as a dependency.');
    }, exports, module);

    if (output)
      module.exports = output;

    // create the esModule object, which allows ES6 named imports of dynamics
    exports = module.exports;

    // __esModule flag treats as already-named
    if (exports && (exports.__esModule || exports instanceof Module))
      entry.esModule = exports;
    // set module as 'default' export, then fake named exports by iterating properties
    else if (entry.esmExports) {
		if(exports === loader.global) {
			entry.esModule = { 'default': exports, __useDefault: true };
		} else {
			entry.esModule = getESModule(exports);
		}
	}
    else
      entry.esModule = { 'default': exports };
  }

  /*
   * Given a module, and the list of modules for this current branch,
   *  ensure that each of the dependencies of this module is evaluated
   *  (unless one is a circular dependency already in the list of seen
   *  modules, in which case we execute it)
   *
   * Then we evaluate the module itself depth-first left to right
   * execution to match ES6 modules
   */
  function ensureEvaluated(moduleName, seen, loader) {
    var entry = loader.defined[moduleName];

    // if already seen, that means it's an already-evaluated non circular dependency
    if (!entry || entry.evaluated || !entry.declarative)
      return;

    // this only applies to declarative modules which late-execute

    seen.push(moduleName);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      if (indexOf.call(seen, depName) == -1) {
        if (!loader.defined[depName])
          loader.get(depName);
        else
          ensureEvaluated(depName, seen, loader);
      }
    }

    if (entry.evaluated)
      return;

    entry.evaluated = true;
    entry.module.execute.call(loader.global);
  }

  var Module = loader.newModule({}).constructor;

  var registerRegEx = /\bSystem\.register\b/;

  var loaderFetch = loader.fetch;
  loader.fetch = function(load) {
    var loader = this;
    defineRegister(loader);
    if (loader.defined[load.name]) {
      load.metadata.format = 'defined';
      return '';
    }
    anonRegister = null;
    calledRegister = false;
    // the above get picked up by onScriptLoad
    return loaderFetch.call(loader, load);
  }

  var loaderTranslate = loader.translate;
  loader.translate = function(load) {
    this.register = registerModule;

    this.__exec = exec;

    load.metadata.deps = load.metadata.deps || [];

    // we run the meta detection here (register is after meta)
    return Promise.resolve(loaderTranslate.call(this, load)).then(function(source) {

      // dont run format detection for globals shimmed
      // ideally this should be in the global extension, but there is
      // currently no neat way to separate it
      if (load.metadata.init || load.metadata.exports)
        load.metadata.format = load.metadata.format || 'global';

      // run detection for register format
      if (load.metadata.format == 'register' || !load.metadata.format && load.source.match(registerRegEx))
        load.metadata.format = 'register';
      return source;
    });
  }


  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;

    var entry;

    // first we check if this module has already been defined in the registry
    if (loader.defined[load.name]) {
      entry = loader.defined[load.name];
      entry.deps = entry.deps.concat(load.metadata.deps);
    }

    // picked up already by a script injection
    else if (load.metadata.entry)
      entry = load.metadata.entry;

    // otherwise check if it is dynamic
    else if (load.metadata.execute) {
      entry = {
        declarative: false,
        deps: load.metadata.deps || [],
        esModule: null,
        execute: load.metadata.execute,
        executingRequire: load.metadata.executingRequire // NodeJS-style requires or not
      };
    }

    // Contains System.register calls
    else if (load.metadata.format == 'register') {
      anonRegister = null;
      calledRegister = false;

      var curSystem = loader.global.System;

      loader.global.System = loader;

      loader.__exec(load);

      loader.global.System = curSystem;

      if (anonRegister)
        entry = anonRegister;

      if (!entry && System.defined[load.name])
        entry = System.defined[load.name];

      if (!calledRegister && !load.metadata.registered)
        throw new TypeError(load.name + ' detected as System.register but didn\'t execute.');
    }

    // named bundles are just an empty module
    if (!entry && load.metadata.format != 'es6')
      return {
        deps: load.metadata.deps,
        execute: function() {
          return loader.newModule({});
        }
      };

    // place this module onto defined for circular references
    if (entry)
      loader.defined[load.name] = entry;

    // no entry -> treat as ES6
    else
      return loaderInstantiate.call(this, load);

    entry.deps = dedupe(entry.deps);
    entry.name = load.name;
    entry.esmExports = load.metadata.esmExports !== false;

    // first, normalize all dependencies
    var normalizePromises = [];
    for (var i = 0, l = entry.deps.length; i < l; i++)
      normalizePromises.push(Promise.resolve(loader.normalize(entry.deps[i], load.name)));

    return Promise.all(normalizePromises).then(function(normalizedDeps) {

      entry.normalizedDeps = normalizedDeps;

      return {
        deps: entry.deps,
        execute: function() {
          // recursively ensure that the module and all its
          // dependencies are linked (with dependency group handling)
          link(load.name, loader);

          // now handle dependency execution in correct order
          ensureEvaluated(load.name, [], loader);

          // remove from the registry
          loader.defined[load.name] = undefined;

          var module = entry.module.exports;

          if(!entry.declarative)
            module = entry.esModule;

          // return the defined module object
          return loader.newModule(module);
        }
      };
    });
  }
}

/*
 * Extension to detect ES6 and auto-load Traceur or Babel for processing
 */
function es6(loader) {
  loader._extensions.push(es6);

  // good enough ES6 detection regex - format detections not designed to be accurate, but to handle the 99% use case
  var es6RegEx = /(^\s*|[}\);\n]\s*)(import\s+(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s+from\s+['"]|\{)|export\s+\*\s+from\s+["']|export\s+(\{|default|function|class|var|const|let|async\s+function))/;
  var strictStringRegEx = /["'].*["']/g;
  var strictCommentRegEx = /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm;

  var traceurRuntimeRegEx = /\$traceurRuntime\s*\./;
  var babelHelpersRegEx = /babelHelpers\s*\./;

  var transpilerNormalized, transpilerRuntimeNormalized;

  var firstLoad = true;

  var nodeResolver = typeof process != 'undefined' && typeof require != 'undefined' && require.resolve;

  function setConfig(loader, module, nodeModule) {
    loader.meta[module] = {format: 'global'};
    if (nodeResolver && !loader.paths[module]) {
      try {
        loader.paths[module] = require.resolve(nodeModule || module);
      }
      catch(e) {}
    }
  }

  var loaderLocate = loader.locate;
  loader.locate = function(load) {
    var self = this;
    if (firstLoad) {
      if (self.transpiler == 'traceur') {
        setConfig(self, 'traceur', 'traceur/bin/traceur.js');
        self.meta['traceur'].exports = 'traceur';
        setConfig(self, 'traceur-runtime', 'traceur/bin/traceur-runtime.js');
      }
      else if (self.transpiler == 'babel') {
        setConfig(self, 'babel', 'babel-standalone/babel.js');
      }
      firstLoad = false;
    }
    return loaderLocate.call(self, load);
  };

  function looksLikeES6(source) {
	  var sourceWithComments = source.replace(strictStringRegEx, '""')
		  .replace(strictCommentRegEx, '$1');
	  return sourceWithComments.match(es6RegEx);
  }

  var loaderTranslate = loader.translate;
  loader.translate = function(load) {
    var loader = this;

    return loaderTranslate.call(loader, load)
    .then(function(source) {

      // detect ES6
      if (load.metadata.format == 'es6' || !load.metadata.format && looksLikeES6(source)) {
        load.metadata.format = 'es6';
        return source;
      }

      if (load.metadata.format == 'register') {
        if (!loader.global.$traceurRuntime && load.source.match(traceurRuntimeRegEx)) {
          return loader['import']('traceur-runtime').then(function() {
            return source;
          });
        }
        if (!loader.global.babelHelpers && load.source.match(babelHelpersRegEx)) {
          return loader['import']('babel/external-helpers').then(function() {
            return source;
          });
        }
      }

      // ensure Traceur doesn't clobber the System global
      if (loader.transpiler == 'traceur')
        return Promise.all([
          transpilerNormalized || (transpilerNormalized = loader.normalize(loader.transpiler)),
          transpilerRuntimeNormalized || (transpilerRuntimeNormalized = loader.normalize(loader.transpiler + '-runtime'))
        ])
        .then(function(normalized) {
          if (load.name == normalized[0] || load.name == normalized[1])
            return '(function() { var curSystem = System; ' + source + '\nSystem = curSystem; })();';

          return source;
        });

      return source;
    });

  };

}

/*
  SystemJS Global Format

  Supports
    metadata.deps
    metadata.init
    metadata.exports

  Also detects writes to the global object avoiding global collisions.
  See the SystemJS readme global support section for further information.
*/
function global(loader) {

  loader._extensions.push(global);

  function readGlobalProperty(p, propValue) {
    var pParts = p.split('.');
    var value = propValue;
    while (pParts.length)
      value = value[pParts.shift()];
    return value;
  }

  function createHelpers(loader) {
    if (loader.has('@@global-helpers'))
      return;

    var hasOwnProperty = loader.global.hasOwnProperty;
    var moduleGlobals = {};

    var curGlobalObj;
    var ignoredGlobalProps;

    function makeLookupObject(arr) {
      var out = {};
      for(var i = 0, len = arr.length; i < len; i++) {
        out[arr[i]] = true;
      }
      return out;
    }

    loader.set('@@global-helpers', loader.newModule({
      prepareGlobal: function(globalModuleName, globalDeps, globalExportName) {
        var globals;
        var require;
        var moduleName = globalModuleName;
        var deps = globalDeps;
        var exportName = globalExportName;

        // handle function signature when an object is passed instead of
        // individual arguments
        if (typeof moduleName === "object") {
          var options = moduleName;

          deps = options.deps;
          globals = options.globals;
          exportName = options.exportName;
          moduleName = options.moduleName;
          require = options.require;
        }

        // first, we add all the dependency modules to the global
        if (deps) {
          for (var i = 0; i < deps.length; i++) {
            var moduleGlobal = moduleGlobals[deps[i]];
            if (moduleGlobal)
              for (var m in moduleGlobal)
                loader.global[m] = moduleGlobal[m];
          }
        }

        if (globals && require) {
          for (var j in globals) {
            loader.global[j] = require(globals[j]);
          }
        }

        // If an exportName is defined there is no need to perform the next
        // expensive operation.
        if(exportName || exportName === false || loader.inferGlobals === false) {
          return;
        }

        // now store a complete copy of the global object
        // in order to detect changes
        curGlobalObj = {};
        ignoredGlobalProps = makeLookupObject(['indexedDB', 'sessionStorage', 'localStorage',
          'clipboardData', 'frames', 'webkitStorageInfo', 'toolbar', 'statusbar',
          'scrollbars', 'personalbar', 'menubar', 'locationbar', 'webkitIndexedDB',
          'screenTop', 'screenLeft'
        ]);
        for (var g in loader.global) {
          if (ignoredGlobalProps[g]) { continue; }
          if (!hasOwnProperty || loader.global.hasOwnProperty(g)) {
            try {
              curGlobalObj[g] = loader.global[g];
            } catch (e) {
              ignoredGlobalProps[g] = true;
            }
          }
        }
      },
      retrieveGlobal: function(moduleName, exportName, init) {
        var singleGlobal;
        var multipleExports;
        var exports = {};

        // run init
        if (init)
          singleGlobal = init.call(loader.global);

        // check for global changes, creating the globalObject for the module
        // if many globals, then a module object for those is created
        // if one global, then that is the module directly
        else if (exportName) {
          var firstPart = exportName.split('.')[0];
          singleGlobal = readGlobalProperty(exportName, loader.global);
          exports[firstPart] = loader.global[firstPart];
        }

        else if(exportName !== false && loader.inferGlobals !== false) {
          for (var g in loader.global) {
            if (ignoredGlobalProps[g])
              continue;
            if ((!hasOwnProperty || loader.global.hasOwnProperty(g)) && g != loader.global && curGlobalObj[g] != loader.global[g]) {
              exports[g] = loader.global[g];
              if (singleGlobal) {
                if (singleGlobal !== loader.global[g])
                  multipleExports = true;
              }
              else if (singleGlobal === undefined) {
                singleGlobal = loader.global[g];
              }
            }
          }
        }

        moduleGlobals[moduleName] = exports;

        return multipleExports ? exports : singleGlobal;
      }
    }));
  }

  createHelpers(loader);

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;

    createHelpers(loader);

    var exportName = load.metadata.exports;

    if (!load.metadata.format)
      load.metadata.format = 'global';

    // add globals as dependencies
    if (load.metadata.globals) {
      for (var g in load.metadata.globals) {
        load.metadata.deps.push(load.metadata.globals[g]);
      }
    }

    // global is a fallback module format
    if (load.metadata.format == 'global') {
      load.metadata.execute = function(require, exports, module) {
        loader.get('@@global-helpers').prepareGlobal({
          require: require,
          moduleName: module.id,
          exportName: exportName,
          deps: load.metadata.deps,
          globals: load.metadata.globals
        });

        if (exportName)
          load.source += '\nthis["' + exportName + '"] = ' + exportName + ';';

        // disable module detection
        var define = loader.global.define;
        var require = loader.global.require;

        loader.global.define = undefined;
        loader.global.module = undefined;
        loader.global.exports = undefined;

        loader.__exec(load, loader.global);

        loader.global.require = require;
        loader.global.define = define;

        return loader.get('@@global-helpers').retrieveGlobal(module.id, exportName, load.metadata.init);
      }
    }
    return loaderInstantiate.call(loader, load);
  }
}

/*
	SystemJS CommonJS Format
*/
function cjs(loader) {
	loader._extensions.push(cjs);
	loader._determineFormat = Function.prototype;

	// CJS Module Format
	// require('...') || exports[''] = ... || exports.asd = ... || module.exports = ... || Object.defineProperty(module, "exports" ...
	var cjsExportsRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])(exports\s*(\[['"]|\.)|module(\.exports|\['exports'\]|\["exports"\])\s*(\[['"]|[=,\.])|Object.defineProperty\(\s*module\s*,\s*(?:'|")exports(?:'|"))/;
	// RegEx adjusted from https://github.com/jbrantly/yabble/blob/master/lib/yabble.js#L339
	var cjsRequireRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF."'])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')\s*\)/g;
	var commentRegEx = /(^|[^\\])(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

	var stringRegEx = /("[^"\\\n\r]*(\\.[^"\\\n\r]*)*"|'[^'\\\n\r]*(\\.[^'\\\n\r]*)*')/g;

	function getCJSDeps(source) {
		cjsRequireRegEx.lastIndex = commentRegEx.lastIndex = stringRegEx.lastIndex = 0;

		var deps = [];
		var info = {};

		var match;

		// track string and comment locations for unminified source
		var stringLocations = [], commentLocations = [];

		function inLocation(locations, match) {
			for (var i = 0; i < locations.length; i++)
				if (locations[i][0] < match.index && locations[i][1] > match.index)
					return true;
			return false;
		}

		if (source.length / source.split('\n').length < 200) {
			while (match = stringRegEx.exec(source))
				stringLocations.push([match.index, match.index + match[0].length]);

			while (match = commentRegEx.exec(source)) {
				// only track comments not starting in strings
				if (!inLocation(stringLocations, match))
					commentLocations.push([match.index, match.index + match[0].length]);
			}
		}

		while (match = cjsRequireRegEx.exec(source)) {
			// ensure we're not within a string or comment location
			if (!inLocation(stringLocations, match) && !inLocation(commentLocations, match)) {
				var dep = match[1].substr(1, match[1].length - 2);
				// skip cases like require('" + file + "')
				if (dep.match(/"|'/))
					continue;
				deps.push(dep);
				info[dep] = match.index;

			}
		}

		return {
			deps: deps,
			info: info
		};
	}

	function makeGetImportPosition(load, depInfo){
		var loader = this;
		return function(specifier){
			var position = depInfo[specifier];
			return loader._getLineAndColumnFromPosition(load.source, position);
		};
	}

	var loaderInstantiate = loader.instantiate;
	loader.instantiate = function(load) {

		if (!load.metadata.format) {
			cjsExportsRegEx.lastIndex = 0;
			cjsRequireRegEx.lastIndex = 0;
			if (cjsRequireRegEx.exec(load.source) || cjsExportsRegEx.exec(load.source)) {
				load.metadata.format = 'cjs';
				this._determineFormat(load);
			}
		}

		if (load.metadata.format == 'cjs') {
			var depInfo = getCJSDeps(load.source);
			load.metadata.deps = load.metadata.deps ?
				load.metadata.deps.concat(depInfo.deps) : depInfo.deps;
			load.metadata.getImportPosition = makeGetImportPosition.call(this,
				load, depInfo.info);

			load.metadata.executingRequire = true;

			load.metadata.execute = function(require, exports, module) {
				var dirname = (load.address || '').split('/');
				dirname.pop();
				dirname = dirname.join('/');

				// if on the server, remove the "file:" part from the dirname
				if (System._nodeRequire)
					dirname = dirname.substr(5);

				var globals = loader.global._g = {
					global: loader.global,
					exports: exports,
					module: module,
					require: require,
					__filename: System._nodeRequire ? load.address.substr(5) : load.address,
					__dirname: dirname
				};


				// disable AMD detection
				var define = loader.global.define;
				loader.global.define = undefined;

				var execLoad = {
					name: load.name,
					source: '(function() {\n(function(global, exports, module, require, __filename, __dirname){\n' + load.source +
																	'\n}).call(_g.exports, _g.global, _g.exports, _g.module, _g.require, _g.__filename, _g.__dirname);})();',
					address: load.address
				};
				try {
					loader.__exec(execLoad);
				} catch(ex) {
					if(loader.StackTrace) {
						var st = loader.StackTrace.parse(ex);
						if(!st) {
							ex.stack = new loader.StackTrace(ex.message, [
								loader.StackTrace.item("<anonymous>", load.address, 1, 0)
							]).toString();
						}
					}

					throw ex;
				}


				loader.global.define = define;

				loader.global._g = undefined;
			}
		}

		return loaderInstantiate.call(this, load);
	};
}

/*
  SystemJS AMD Format
  Provides the AMD module format definition at System.format.amd
  as well as a RequireJS-style require on System.require
*/
function amd(loader) {
  // by default we only enforce AMD noConflict mode in Node
  var isNode = typeof module != 'undefined' && module.exports;

  loader._extensions.push(amd);

  // AMD Module Format Detection RegEx
  // define([.., .., ..], ...)
  // define(varName); || define(function(require, exports) {}); || define({})
  var amdRegEx = /(?:^\uFEFF?|[^$_a-zA-Z\xA0-\uFFFF.])define\s*\(\s*("[^"]+"\s*,\s*|'[^']+'\s*,\s*)?\s*(\[(\s*(("[^"]+"|'[^']+')\s*,|\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*(\s*("[^"]+"|'[^']+')\s*,?)?(\s*(\/\/.*\r?\n|\/\*(.|\s)*?\*\/))*\s*\]|function\s*|{|[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*\))/;

  var strictCommentRegEx = /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm
  var beforeRegEx = /(function|var|let|const|return|export|\"|\'|\(|\=)$/i

  var fnBracketRegEx = /\(([^\)]*)\)/;
  var wsRegEx = /^\s+|\s+$/g;

  var requireRegExs = {};
  var chunkEndCounterpart = {
    "/*": /[\s\S]*?\*\//g,
    "//": /[^\r\n]+(?:\r?\n|$)/g,
    '"': /(?:\\[\s\S]|[^\\])*?"/g,
    "'": /(?:\\[\s\S]|[^\\])*?'/g,
    "`": /(?:\\[\s\S]|[^\\])*?`/g,
    "require": /\s*\(\s*(['"`])((?:\\[\s\S]|(?!\1)[^\\])*?)\1\s*\)/g,
    "/regexp/": /\/(?:(?:\\.|[^\/\r\n])+?)\//g
  };
  var esModuleDecl = /Object\.defineProperty\([A-Za-z]+, ?['"]__esModule['"], ?{ ?value: ?(!0|true) ?}\)/;
  /*
    Find CJS Deps in valid javascript
    Loops through the source once by progressivly identifying "chunks"
    Chunks are:
    multi-line comments, single line comments, strings using ", ', or `, regular expressions, and the special case of the requireAlias
    When the start of a chunk is potentially identified, we grab the corresponding 'endRx' and execute it on source at the same spot
    If the endRx matches correctly at that location, we advance the chunk start regex's lastIndex to the end of the chunk and continue.
    If it's the requireAlias that successfully matched, then we pull the string ('./path') out of the match and push as a dep before continuing.
  */
  function getCJSDeps (source, requireIndex) {
    var deps = [];
    // determine the require alias
    var params = source.match(fnBracketRegEx);
    var requireAlias = (params[1].split(',')[requireIndex] || 'require').replace(wsRegEx, '');

    // Create a cache of the chunk start regex based on the require alias
    var chunkStartRegex = requireRegExs[requireAlias] || (requireRegExs[requireAlias] = new RegExp("/\\*|//|\"|'|`|(?:^|\\breturn\\b|[([=,;:?><&|^*%~+-])\\s*(?=\/)|\\b" + requireAlias + "(?=\\s*\\()", "g"));
    // Look for potential chunks from the start of source
    chunkStartRegex.lastIndex = 0;
    // Make sure chunkEndCounterpart object has a key of requireAlias that points to the common 'require' ending rx for later
    chunkEndCounterpart[requireAlias] = chunkEndCounterpart.require;

    var startExec, chunkStartKey, endRx, endExec;
    // Execute our starting regex search on source to identify where chunks start
    while (startExec = chunkStartRegex.exec(source)) {
      // assume the match is a key for our chunkEndCounterpart object
      // This will be strings like "//", "'", "require", etc
      chunkStartKey = startExec[0];
      // and grab that chunk's ending regular expression
      endRx = chunkEndCounterpart[chunkStartKey];

      if (!endRx) {
        // If what we grabbed doesn't have an entry on chunkEndCounterpart, that means we're identified where a regex might be.
        // So just change our key to a common one used when identifying regular expressions in the js source
        chunkStartKey = "/regexp/";
        // and grab the regex-type chunk's ending regular expression
        endRx = chunkEndCounterpart[chunkStartKey];
      }
      // Set the endRx to start looking exactly where our chunkStartRegex loop ended the match
      endRx.lastIndex = chunkStartRegex.lastIndex;
      // and execute it on source
      endExec = endRx.exec(source);

      // if the endRx matched and it matched starting exactly where we told it to start
      if (endExec && endExec.index === chunkStartRegex.lastIndex) {
        // Then we have identified a chunk correctly and we advance our loop of chunkStartRegex to continue after this chunk
        chunkStartRegex.lastIndex = endRx.lastIndex;
		var lookbehind = startExec.index - 1;
		var skip = (lookbehind > -1 && source.charAt(lookbehind) === ".");
        // if we are specifically identifying the requireAlias-type chunk at this point,
        if (!skip && endRx === chunkEndCounterpart.require) {
          // then the second capture group of the endRx is what's inside the string, inside the ()'s, after requireAlias,
          // which is the path of a dep that we want to return.
		  if(endExec[2]) {
			  deps.push(endExec[2]);
		  }

        }
      }
    }
    return deps;
  }

  /*
    AMD-compatible require
    To copy RequireJS, set window.require = window.requirejs = loader.amdRequire
  */
  function require(names, callback, errback, referer) {
    // 'this' is bound to the loader
    var loader = this;

    // in amd, first arg can be a config object... we just ignore
    if (typeof names == 'object' && !(names instanceof Array))
      return require.apply(null, Array.prototype.splice.call(arguments, 1, arguments.length - 1));

    // amd require
    if (names instanceof Array)
      Promise.all(names.map(function(name) {
        return loader['import'](name, referer);
      })).then(function(modules) {
        if(callback) {
          callback.apply(null, modules);
        }
      }, errback);

    // commonjs require
    else if (typeof names == 'string') {
      var module = loader.get(names);
      return module.__useDefault ? module['default'] : module;
    }

    else
      throw new TypeError('Invalid require');
  };
  loader.amdRequire = function() {
    return require.apply(this, arguments);
  };

  function makeRequire(parentName, staticRequire, loader) {
    return function(names, callback, errback) {
      if (typeof names == 'string')
        return staticRequire(names);
      return require.call(loader, names, callback, errback, { name: parentName });
    }
  }

  // run once per loader
  function generateDefine(loader) {
    // script injection mode calls this function synchronously on load
    var onScriptLoad = loader.onScriptLoad;
    loader.onScriptLoad = function(load) {
      onScriptLoad(load);
      if (anonDefine || defineBundle) {
        load.metadata.format = 'defined';
        load.metadata.registered = true;
      }

      if (anonDefine) {
        load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(anonDefine.deps) : anonDefine.deps;
        load.metadata.execute = anonDefine.execute;
      }
    }

    function define(modName, modDeps, modFactory) {
      var name = modName;
      var deps = modDeps;
      var factory = modFactory;
	  var isESModule = false;
      if (typeof name != 'string') {
        factory = deps;
        deps = name;
        name = null;
      }
      if (!(deps instanceof Array)) {
        factory = deps;
        deps = ['require', 'exports', 'module'];
      }

      if (typeof factory != 'function')
        factory = (function(factory) {
          return function() { return factory; }
        })(factory);

      // in IE8, a trailing comma becomes a trailing undefined entry
      if (deps[deps.length - 1] === undefined)
        deps.pop();

      // remove system dependencies
      var requireIndex, exportsIndex, moduleIndex;

      if ((requireIndex = indexOf.call(deps, 'require')) != -1) {

        deps.splice(requireIndex, 1);

        var factoryText = factory.toString();

        deps = deps.concat(getCJSDeps(factoryText, requireIndex));
      }


      if ((exportsIndex = indexOf.call(deps, 'exports')) != -1) {
		  deps.splice(exportsIndex, 1);

		  // Detect esModule
		  if(!factoryText) {
			  factoryText = factory.toString();
			  isESModule = esModuleDecl.test(factoryText);
		  }
	  }


      if ((moduleIndex = indexOf.call(deps, 'module')) != -1)
        deps.splice(moduleIndex, 1);

      var define = {
        deps: deps,
        execute: function(require, exports, module) {

          var depValues = [];
          for (var i = 0; i < deps.length; i++)
            depValues.push(require(deps[i]));

          module.uri = loader.baseURL + module.id;

          module.config = function() {};

          // add back in system dependencies
          if (moduleIndex != -1)
            depValues.splice(moduleIndex, 0, module);

          if (exportsIndex != -1)
            depValues.splice(exportsIndex, 0, exports);

          if (requireIndex != -1)
            depValues.splice(requireIndex, 0, makeRequire(module.id, require, loader));

          var output = factory.apply(global, depValues);

          if (typeof output == 'undefined' && module)
            output = module.exports;

          if (typeof output != 'undefined')
            return output;
        }
      };

      // anonymous define
      if (!name) {
        // already defined anonymously -> throw
        if (anonDefine)
          throw new TypeError('Multiple defines for anonymous module');
        anonDefine = define;
      }
      // named define
      else {
		var parsedModuleName =
		  currentLoad && currentLoad.metadata && currentLoad.metadata.parsedModuleName;

		// register the full npm name otherwise named modules won't load
		// when the npm extension is used
		if (
		  parsedModuleName &&
		  parsedModuleName.version &&              // verify it is an npm name
		  (parsedModuleName.modulePath === name || // local module
			parsedModuleName.packageName === name) // from a dependency
		) {
		  loader.register(
			parsedModuleName.moduleName,
			define.deps,
			false,
			define.execute
		  );
		}

        // if it has no dependencies and we don't have any other
        // defines, then let this be an anonymous define
        if (deps.length == 0 && !anonDefine && !defineBundle)
          anonDefine = define;

        // otherwise its a bundle only
        else
          anonDefine = null;

        // the above is just to support single modules of the form:
        // define('jquery')
        // still loading anonymously
        // because it is done widely enough to be useful

        // note this is now a bundle
        defineBundle = true;

        // define the module through the register registry
        loader.register(name, define.deps, false, define.execute);
      }
	  if(loader.defined[name]) {
		  loader.defined[name].isESModule = isESModule;
	  }
    };
    define.amd = {};
    loader.amdDefine = define;
  }

  var anonDefine;
  // set to true if the current module turns out to be a named define bundle
  var defineBundle;

  // set on the "instantiate" hook (by "createDefine") so it's available in
  // the scope of the "define" function, it's set back to "undefined" after eval
  var currentLoad;

  var oldModule, oldExports, oldDefine;

  // adds define as a global (potentially just temporarily)
  function createDefine(loader, load) {
    if (!loader.amdDefine)
      generateDefine(loader);

    anonDefine = null;
    defineBundle = null;
	currentLoad = load;

    // ensure no NodeJS environment detection
    var global = loader.global;

    oldModule = global.module;
    oldExports = global.exports;
    oldDefine = global.define;

    global.module = undefined;
    global.exports = undefined;

    if (global.define && global.define === loader.amdDefine)
      return;

    global.define = loader.amdDefine;
  }

  function removeDefine(loader) {
    var global = loader.global;
    global.define = oldDefine;
    global.module = oldModule;
    global.exports = oldExports;
	currentLoad = undefined;
  }

  generateDefine(loader);

  if (loader.scriptLoader) {
    var loaderFetch = loader.fetch;
    loader.fetch = function(load) {
      createDefine(this, load);
      return loaderFetch.call(this, load);
    }
  }

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this,
      sourceWithoutComments = load.source.replace(strictCommentRegEx, '$1'),
      match = sourceWithoutComments.match(amdRegEx);

    if (load.metadata.format == 'amd' || !load.metadata.format && match) {

      // make sure that this is really a AMD module
      // get the content from beginning till the matched define block
      var sourceBeforeDefine = sourceWithoutComments.substring(0, sourceWithoutComments.indexOf(match[0])),
        trimmed = sourceBeforeDefine.replace(wsRegEx, "")

      // check if that there is no commen javscript keywork before
      if (!beforeRegEx.test(trimmed)) {
        load.metadata.format = 'amd';

        if (loader.execute !== false) {
          createDefine(loader, load);

          loader.__exec(load);

          removeDefine(loader);

          if (!anonDefine && !defineBundle && !isNode)
            throw new TypeError('AMD module ' + load.name + ' did not define');
        }

        if (anonDefine) {
          load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(anonDefine.deps) : anonDefine.deps;
          load.metadata.execute = anonDefine.execute;
        }
      }
    }

    return loaderInstantiate.call(loader, load);
  }
}

/*
  SystemJS map support

  Provides map configuration through
    System.map['jquery'] = 'some/module/map'

  As well as contextual map config through
    System.map['bootstrap'] = {
      jquery: 'some/module/map2'
    }

  Note that this applies for subpaths, just like RequireJS

  jquery      -> 'some/module/map'
  jquery/path -> 'some/module/map/path'
  bootstrap   -> 'bootstrap'

  Inside any module name of the form 'bootstrap' or 'bootstrap/*'
    jquery    -> 'some/module/map2'
    jquery/p  -> 'some/module/map2/p'

  Maps are carefully applied from most specific contextual map, to least specific global map
*/
function map(loader) {
  loader.map = loader.map || {};

  loader._extensions.push(map);

  // return if prefix parts (separated by '/') match the name
  // eg prefixMatch('jquery/some/thing', 'jquery') -> true
  //    prefixMatch('jqueryhere/', 'jquery') -> false
  function prefixMatch(name, prefix) {
    if (name.length < prefix.length)
      return false;
    if (name.substr(0, prefix.length) != prefix)
      return false;
    if (name[prefix.length] && name[prefix.length] != '/')
      return false;
    return true;
  }

  // get the depth of a given path
  // eg pathLen('some/name') -> 2
  function pathLen(name) {
    var len = 1;
    for (var i = 0, l = name.length; i < l; i++)
      if (name[i] === '/')
        len++;
    return len;
  }

  function doMap(name, matchLen, map) {
    return map + name.substr(matchLen);
  }

  // given a relative-resolved module name and normalized parent name,
  // apply the map configuration
  function applyMap(name, parentName, loader) {
    var curMatch, curMatchLength = 0;
    var curParent, curParentMatchLength = 0;
    var tmpParentLength, tmpPrefixLength;
    var subPath;
    var nameParts;

    // first find most specific contextual match
    if (parentName) {
      for (var p in loader.map) {
        var curMap = loader.map[p];
        if (typeof curMap != 'object')
          continue;

        // most specific parent match wins first
        if (!prefixMatch(parentName, p))
          continue;

        tmpParentLength = pathLen(p);
        if (tmpParentLength <= curParentMatchLength)
          continue;

        for (var q in curMap) {
          // most specific name match wins
          if (!prefixMatch(name, q))
            continue;
          tmpPrefixLength = pathLen(q);
          if (tmpPrefixLength <= curMatchLength)
            continue;

          curMatch = q;
          curMatchLength = tmpPrefixLength;
          curParent = p;
          curParentMatchLength = tmpParentLength;
        }
      }
    }

    // if we found a contextual match, apply it now
    if (curMatch)
      return doMap(name, curMatch.length, loader.map[curParent][curMatch]);

    // now do the global map
    for (var p in loader.map) {
      var curMap = loader.map[p];
      if (typeof curMap != 'string')
        continue;

      if (!prefixMatch(name, p))
        continue;

      var tmpPrefixLength = pathLen(p);

      if (tmpPrefixLength <= curMatchLength)
        continue;

      curMatch = p;
      curMatchLength = tmpPrefixLength;
    }

    if (curMatch)
      return doMap(name, curMatch.length, loader.map[curMatch]);

    return name;
  }

  var loaderNormalize = loader.normalize;
  loader.normalize = function(identifier, parentName, parentAddress) {
    var loader = this;
    var name = identifier;
    if (!loader.map)
      loader.map = {};

    var isPackage = false;
    if (name.substr(name.length - 1, 1) == '/') {
      isPackage = true;
      name += '#';
    }

    return Promise.resolve(loaderNormalize.call(loader, name, parentName, parentAddress))
    .then(function(normalizedName) {
      var name = applyMap(normalizedName, parentName, loader);

      // Normalize "module/" into "module/module"
      // Convenient for packages
      if (isPackage) {
        var nameParts = name.split('/');
        nameParts.pop();
        var pkgName = nameParts.pop();
        nameParts.push(pkgName);
        nameParts.push(pkgName);
        name = nameParts.join('/');
      }

      return name;
    });
  }
}

/*
  SystemJS Plugin Support

  Supports plugin syntax with "!"

  The plugin name is loaded as a module itself, and can override standard loader hooks
  for the plugin resource. See the plugin section of the systemjs readme.
*/
function plugins(loader) {
  if (typeof indexOf == 'undefined')
    indexOf = Array.prototype.indexOf;

  loader._extensions.push(plugins);

  var loaderNormalize = loader.normalize;
  loader.normalize = function(name, parentModuleName, parentAddress) {
    var loader = this;
    var parentName = parentModuleName;
    // if parent is a plugin, normalize against the parent plugin argument only
    var parentPluginIndex;
    if (parentName && (parentPluginIndex = parentName.indexOf('!')) != -1)
      parentName = parentName.substr(0, parentPluginIndex);

    return Promise.resolve(loaderNormalize.call(loader, name, parentName, parentAddress))
    .then(function(name) {
      // if this is a plugin, normalize the plugin name and the argument
      var pluginIndex = name.lastIndexOf('!');
      if (pluginIndex != -1) {
        var argumentName = name.substr(0, pluginIndex);

        // plugin name is part after "!" or the extension itself
        var pluginName = name.substr(pluginIndex + 1) || argumentName.substr(argumentName.lastIndexOf('.') + 1);

        // normalize the plugin name relative to the same parent
        return new Promise(function(resolve) {
          resolve(loader.normalize(pluginName, parentName, parentAddress));
        })
        // normalize the plugin argument
        .then(function(_pluginName) {
          pluginName = _pluginName;
          return loader.normalize(argumentName, parentName, parentAddress, true);
        })
        .then(function(argumentName) {
          return argumentName + '!' + pluginName;
        });
      }

      // standard normalization
      return name;
    });
  };

  var loaderLocate = loader.locate;
  loader.locate = function(load) {
    var loader = this;

    var name = load.name;

    // only fetch the plugin itself if this name isn't defined
    if (this.defined && this.defined[name])
      return loaderLocate.call(this, load);

    // plugin
    var pluginIndex = name.lastIndexOf('!');
    if (pluginIndex != -1) {
      var pluginName = name.substr(pluginIndex + 1);

      // the name to locate is the plugin argument only
      load.name = name.substr(0, pluginIndex);

      var pluginLoader = loader.pluginLoader || loader;

      // load the plugin module
      // NB ideally should use pluginLoader.load for normalized,
      //    but not currently working for some reason
      return pluginLoader['import'](pluginName, {
        metadata: { importingModuleName: name }
      })
      .then(function() {
        var plugin = pluginLoader.get(pluginName);
        plugin = plugin['default'] || plugin;

        // allow plugins to opt-out of build
        if (plugin.build === false && loader.pluginLoader)
          load.metadata.build = false;

        // store the plugin module itself on the metadata
        load.metadata.plugin = plugin;
        load.metadata.pluginName = pluginName;
        load.metadata.pluginArgument = load.name;
        load.metadata.buildType = plugin.buildType || "js";

        // run plugin locate if given
        if (plugin.locate)
          return plugin.locate.call(loader, load);

        // otherwise use standard locate without '.js' extension adding
        else
          return Promise.resolve(loader.locate(load))
          .then(function(address) {
            return address.replace(/\.js$/, '');
          });
      });
    }

    return loaderLocate.call(this, load);
  };

  var loaderFetch = loader.fetch;
  loader.fetch = function(load) {
    var loader = this;
    // ignore fetching build = false unless in a plugin loader
    if (load.metadata.build === false && loader.pluginLoader)
      return '';
    else if (load.metadata.plugin && load.metadata.plugin.fetch && !load.metadata.pluginFetchCalled) {
      load.metadata.pluginFetchCalled = true;
      return load.metadata.plugin.fetch.call(loader, load, loaderFetch);
    }
    else
      return loaderFetch.call(loader, load);
  };

  var loaderTranslate = loader.translate;
  loader.translate = function(load) {
    var loader = this;
    if (load.metadata.plugin && load.metadata.plugin.translate)
      return Promise.resolve(load.metadata.plugin.translate.call(loader, load)).then(function(result) {
        if (typeof result == 'string') {
			if(!load.metadata.originalSource)
				load.metadata.originalSource = load.source;
			load.source = result;
		}

        return loaderTranslate.call(loader, load);
      });
    else
      return loaderTranslate.call(loader, load);
  };

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;
    if (load.metadata.plugin && load.metadata.plugin.instantiate)
       return Promise.resolve(load.metadata.plugin.instantiate.call(loader, load)).then(function(result) {
        if (result) {
          // load.metadata.format = 'defined';
          // load.metadata.execute = function() {
          //   return result;
          // };
          return result;
        }
        return loaderInstantiate.call(loader, load);
      });
    else if (load.metadata.plugin && load.metadata.plugin.build === false) {
      load.metadata.format = 'defined';
      load.metadata.deps.push(load.metadata.pluginName);
      load.metadata.execute = function() {
        return loader.newModule({});
      };
      return loaderInstantiate.call(loader, load);
    }
    else
      return loaderInstantiate.call(loader, load);
  }

}

/*
  System bundles

  Allows a bundle module to be specified which will be dynamically
  loaded before trying to load a given module.

  For example:
  System.bundles['mybundle'] = ['jquery', 'bootstrap/js/bootstrap']

  Will result in a load to "mybundle" whenever a load to "jquery"
  or "bootstrap/js/bootstrap" is made.

  In this way, the bundle becomes the request that provides the module
*/

function bundles(loader) {
  if (typeof indexOf == 'undefined')
    indexOf = Array.prototype.indexOf;

  loader._extensions.push(bundles);

  // bundles support (just like RequireJS)
  // bundle name is module name of bundle itself
  // bundle is array of modules defined by the bundle
  // when a module in the bundle is requested, the bundle is loaded instead
  // of the form System.bundles['mybundle'] = ['jquery', 'bootstrap/js/bootstrap']
  loader.bundles = loader.bundles || {};

  var loaderFetch = loader.fetch;
  loader.fetch = function(load) {
    var loader = this;
    if (loader.trace)
      return loaderFetch.call(this, load);
    if (!loader.bundles)
      loader.bundles = {};

    // if this module is in a bundle, load the bundle first then
    for (var b in loader.bundles) {
      if (indexOf.call(loader.bundles[b], load.name) == -1)
        continue;
      // we do manual normalization in case the bundle is mapped
      // this is so we can still know the normalized name is a bundle
      return Promise.resolve(loader.normalize(b))
      .then(function(normalized) {
        loader.bundles[normalized] = loader.bundles[normalized] || loader.bundles[b];

        // note this module is a bundle in the meta
        loader.meta = loader.meta || {};
        loader.meta[normalized] = loader.meta[normalized] || {};
        loader.meta[normalized].bundle = true;

        return loader.load(normalized);
      })
      .then(function() {
		  if(loader.defined[load.name] && !load.metadata.format) {
			  load.metadata.format = "defined";
		  }

        return '';
      });
    }
    return loaderFetch.call(this, load);
  }
}

/*
 * Dependency Tree Cache
 * 
 * Allows a build to pre-populate a dependency trace tree on the loader of 
 * the expected dependency tree, to be loaded upfront when requesting the
 * module, avoinding the n round trips latency of module loading, where 
 * n is the dependency tree depth.
 *
 * eg:
 * System.depCache = {
 *  'app': ['normalized', 'deps'],
 *  'normalized': ['another'],
 *  'deps': ['tree']
 * };
 * 
 * System.import('app') 
 * // simultaneously starts loading all of:
 * // 'normalized', 'deps', 'another', 'tree'
 * // before "app" source is even loaded
 */

function depCache(loader) {
  loader.depCache = loader.depCache || {};

  loader._extensions.push(depCache);

  var loaderLocate = loader.locate;
  loader.locate = function(load) {
    var loader = this;

    if (!loader.depCache)
      loader.depCache = {};

    // load direct deps, in turn will pick up their trace trees
    var deps = loader.depCache[load.name];
    if (deps)
      for (var i = 0; i < deps.length; i++)
        loader.load(deps[i]);

    return loaderLocate.call(loader, load);
  }
}
  

core(System);
meta(System);
register(System);
es6(System);
global(System);
cjs(System);
amd(System);
map(System);
plugins(System);
bundles(System);
depCache(System);

};

var $__curScript, __eval;

(function() {

  var doEval;
  var isWorker = typeof window == 'undefined' && typeof self != 'undefined' && typeof importScripts != 'undefined';
  var isBrowser = typeof window != 'undefined' && typeof document != 'undefined';
  var isNode = typeof process === 'object' && {}.toString.call(process) === '[object process]';
  var isNW = !!(isNode && global.nw && global.nw.process);
  var isChromeExtension = isBrowser && !isNW && window.chrome && window.chrome.extension;
  var isWindows = typeof process != 'undefined' && !!process.platform.match(/^win/);
  var scriptEval;

  doEval = function(source, address, context) {
    try {
      new Function(source).call(context);
    }
    catch(e) {
      throw handleError(e, source, address, context);
    }
  };

  if(isWorker) {
    $__global.upgradeSystemLoader();
  } else if ((isBrowser || isNW) && !isChromeExtension) {
    var head;

    var scripts = document.getElementsByTagName('script');
    $__curScript = scripts[scripts.length - 1];

    // globally scoped eval for the browser
    scriptEval = function(source) {
      if (!head)
        head = document.head || document.body || document.documentElement;

      var script = document.createElement('script');
      script.text = source;
      var onerror = window.onerror;
      var e;
      window.onerror = function(_e) {
        e = _e;
      }
      head.appendChild(script);
      head.removeChild(script);
      window.onerror = onerror;
      if (e)
        throw e;
    };

    $__global.upgradeSystemLoader();
  }
  else if(isNode) {
    var es6ModuleLoader = require('./src/loader');
    $__global.System = es6ModuleLoader.System;
    $__global.Loader = es6ModuleLoader.Loader;
    $__global.upgradeSystemLoader();
    module.exports = $__global.System;

    // global scoped eval for node
    var vm = require('vm');
    doEval = function(source) {
      vm.runInThisContext(source);
    }
  }

  var errArgs = new Error(0, '_').fileName == '_';

  function cleanStack(stack, newStack) {
	  for (var i = 0; i < stack.length; i++) {
		if (typeof $__curScript == 'undefined' || stack[i].indexOf($__curScript.src) == -1)
		  newStack.push(stack[i]);
	  }
  }

  function handleError(err, source, address, context) {
    // parse the stack removing loader code lines for simplification
	var newStack = [], stack;
    if (!err.originalErr) {
      stack = (err.stack || err.message || err).toString().split('\n');
	  cleanStack(stack, newStack);
    }

	if(err.originalErr && !newStack.length) {
	  stack = err.originalErr.stack.toString().split('\n');
	  cleanStack(stack, newStack);
	}

	var isSyntaxError = (err instanceof SyntaxError);
	var isSourceOfSyntaxError = address && isSyntaxError &&
	 	!err.originalErr && newStack.length && err.stack.indexOf(address) === -1;

	if(isSourceOfSyntaxError) {
		// Find the first true stack item
		for(var i = 0; i < newStack.length; i++) {
			if(/(    at )|(@http)/.test(newStack[i])) {
				newStack.splice(i, 1, "    at eval (" + address + ":1:1)");
				err.stack = newStack.join("\n\t");
				break;
			}
		}
	}

	var newMsg = err.message;

    // Convert file:/// URLs to paths in Node
    if (!isBrowser)
      newMsg = newMsg.replace(isWindows ? /file:\/\/\//g : /file:\/\//g, '');

	var ErrorType = err.constructor || Error;
    var newErr = errArgs ? new ErrorType(newMsg, err.fileName, err.lineNumber) :
		new ErrorType(newMsg);

    // Node needs stack adjustment for throw to show message
    if (!isBrowser)
      newErr.stack = newStack.join('\n\t');
    // Clearing the stack stops unnecessary loader lines showing
    else if(newStack)
      newErr.stack = newStack.join('\n\t');

    // track the original error
    newErr.originalErr = err.originalErr || err;
	newErr.firstErr = err.firstErr || newErr;

	newErr.onModuleExecution = true;

	if(isSyntaxError) {
		newErr.onlyIncludeCodeFrameIfRootModule = true;
		return handleSyntaxError(newErr, source);
	}

    return newErr;
  }

  function handleSyntaxError(fromError, source) {
	  // This trick only works in Chrome, detect that and just return the regular
	  // error in other browsers.
	  if(typeof Error.captureStackTrace !== "function") {
		  return fromError;
	  }

	  var logError = (fromError.firstErr && fromError.firstErr.logError) ||
	  	logSyntaxError.bind(null, source);

	  return Object.defineProperty(fromError, "logError", {
		  enumerable: false,
		  value: logError
	  });
  }

  function logSyntaxError(source, c) {
	  setTimeout(function(){
		  new Function(source);
	  });
  }

  __eval = function(inSource, address, context, sourceMap, evalType) {
	var source = inSource;
    source += '\n//# sourceURL=' + address + (sourceMap ? '\n//# sourceMappingURL=' + sourceMap : '');


    var useScriptEval = evalType === 'script'
      && typeof scriptEval === 'function';
    if(useScriptEval) {
      scriptEval(source);
    } else {
      doEval(source, address, context);
    }
  };

})();

})(typeof window != 'undefined' ? window : (typeof WorkerGlobalScope != 'undefined' ? self : global));

(function(global){

	// helpers
	var camelize = function(str){
		return str.replace(/-+(.)?/g, function(match, chr){
			return chr ? chr.toUpperCase() : ''
		});
	},
		each = function( o, cb){
			var i, len;

			// weak array detection, but we only use this internally so don't
			// pass it weird stuff
			if ( typeof o.length == 'number' && (o.length - 1) in o) {
				for ( i = 0, len = o.length; i < len; i++ ) {
					cb.call(o[i], o[i], i, o);
				}
			} else {
				for ( i in o ) {
					if(o.hasOwnProperty(i)){
						cb.call(o[i], o[i], i, o);
					}
				}
			}
			return o;
		},
		map = function(o, cb) {
			var arr = [];
			each(o, function(item, i){
				arr[i] = cb(item, i);
			});
			return arr;
		},
		isString = function(o) {
			return typeof o == "string";
		},
		extend = function(d,s){
			each(s, function(v, p){
				d[p] = v;
			});
			return d;
		},
		dir = function(uri){
			var lastSlash = uri.lastIndexOf("/");
			//if no / slashes, check for \ slashes since it might be a windows path
			if(lastSlash === -1)
				lastSlash = uri.lastIndexOf("\\");
			if(lastSlash !== -1) {
				return uri.substr(0, lastSlash);
			} else {
				return uri;
			}
		},
		last = function(arr){
			return arr[arr.length - 1];
		},
		parseURI = function(url) {
			var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@\/]*(?::[^:@\/]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
				// authority = '//' + user + ':' + pass '@' + hostname + ':' port
				return (m ? {
				href     : m[0] || '',
				protocol : m[1] || '',
				authority: m[2] || '',
				host     : m[3] || '',
				hostname : m[4] || '',
				port     : m[5] || '',
				pathname : m[6] || '',
				search   : m[7] || '',
				hash     : m[8] || ''
			} : null);
		},
		joinURIs = function(base, href) {
			function removeDotSegments(input) {
				var output = [];
				input.replace(/^(\.\.?(\/|$))+/, '')
					.replace(/\/(\.(\/|$))+/g, '/')
					.replace(/\/\.\.$/, '/../')
					.replace(/\/?[^\/]*/g, function (p) {
						if (p === '/..') {
							output.pop();
						} else {
							output.push(p);
						}
					});
				return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
			}

			href = parseURI(href || '');
			base = parseURI(base || '');

			return !href || !base ? null : (href.protocol || base.protocol) +
				(href.protocol || href.authority ? href.authority : base.authority) +
				removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
					(href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
					href.hash;
		},
		relativeURI = function(base, path) {
			var uriParts = path.split("/"),
				baseParts = base.split("/"),
				result = [];
			while ( uriParts.length && baseParts.length && uriParts[0] == baseParts[0] ) {
				uriParts.shift();
				baseParts.shift();
			}
			for(var i = 0 ; i< baseParts.length-1; i++) {
				result.push("../");
			}
			return "./" + result.join("") + uriParts.join("/");
		},
		fBind = Function.prototype.bind,
		isFunction = function(obj) {
			return !!(obj && obj.constructor && obj.call && obj.apply);
		},
		isWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope,
		isNode = typeof process === "object" && {}.toString.call(process) === "[object process]",
		isBrowserWithWindow = !isNode && typeof window !== "undefined",
		isNW = isNode && (function(){
			try {
				return require("nw.gui") !== "undefined";
			} catch(e) {
				return false;
			}
		})(),
		isElectron = isNode && !!process.versions["electron"],
		isNode = isNode && !isNW && !isElectron,
		hasAWindow = isBrowserWithWindow || isNW || isElectron,
		getStealScript = function(){
			if(isBrowserWithWindow || isNW || isElectron) {
				if(document.currentScript) {
					return document.currentScript;
				}
				var scripts = document.scripts;

				if (scripts.length) {
					var currentScript = scripts[scripts.length - 1];
					return currentScript;
				}
			}
		},
		stealScript = getStealScript(),
		warn = typeof console === "object" ?
			fBind.call(console.warn, console) : function(){};

	var filename = function(uri){
		var lastSlash = uri.lastIndexOf("/");
		//if no / slashes, check for \ slashes since it might be a windows path
		if(lastSlash === -1)
			lastSlash = uri.lastIndexOf("\\");
		var matches = ( lastSlash == -1 ? uri : uri.substr(lastSlash+1) ).match(/^[\w-\s\.!]+/);
		return matches ? matches[0] : "";
	};

	var ext = function(uri){
		var fn = filename(uri);
		var dot = fn.lastIndexOf(".");
		if(dot !== -1) {
			return fn.substr(dot+1);
		} else {
			return "";
		}
	};

	var pluginCache = {};

	var normalize = function(unnormalizedName, loader){
		var name = unnormalizedName;

		// Detech if this name contains a plugin part like: app.less!steal/less
		// and catch the plugin name so that when it is normalized we do not perform
		// Steal's normalization against it.
		var pluginIndex = name.lastIndexOf('!');
		var pluginPart = "";
		if (pluginIndex != -1) {
			// argumentName is the part before the !
			var argumentName = name.substr(0, pluginIndex);
			var pluginName = name.substr(pluginIndex + 1);
			pluginPart = "!" + pluginName;

			// Set the name to the argument name so that we can normalize it alone.
			name = argumentName;
		}

		var last = filename(name),
			extension = ext(name);
		// if the name ends with /
		if(	name[name.length -1] === "/" ) {
			return name+filename( name.substr(0, name.length-1) ) + pluginPart;
		} else if(	!/^(\w+(?:s)?:\/\/|\.|file|\/)/.test(name) &&
			// and doesn't end with a dot
			 last.indexOf(".") === -1
			) {
			return name+"/"+last + pluginPart;
		} else {
			if(extension === "js") {
				return name.substr(0, name.lastIndexOf(".")) + pluginPart;
			} else {
				return name + pluginPart;
			}
		}
	};

var cloneSteal = function(System){
	var loader = System || this.System;
	var steal = makeSteal(loader.clone());
	steal.loader.set("@steal", steal.loader.newModule({
		"default": steal,
		__useDefault: true
	}));
	steal.clone = cloneSteal;
	return steal;
};



var ArraySet;
if(typeof Set === "function") {
	ArraySet = Set;
} else {
	ArraySet = function(){ this._items = []; };
	ArraySet.prototype.has = function(item) {
		return this._items.indexOf(item) !== -1;
	};
	ArraySet.prototype.add = function(item) {
		if(!this.has(item)) {
			this._items.push(item);
		}
	};
}

var makeSteal = function(System){
	var addStealExtension = function (extensionFn) {
		if (typeof System !== "undefined" && isFunction(extensionFn)) {
			if (System._extensions) {
				System._extensions.push(extensionFn);
			}
			extensionFn(System, steal);
		}
	};

	System.set('@loader', System.newModule({
		'default': System,
		__useDefault: true
	}));


	System.set("less", System.newModule({
		__useDefault: true,
		default: {
			fetch: function() {
				throw new Error(
					[
						"steal-less plugin must be installed and configured properly",
						"See https://stealjs.com/docs/steal-less.html"
					].join("\n")
				);
			}
		}
	}));

	System.config({
		map: {
			"@loader/@loader": "@loader",
			"@steal/@steal": "@steal"
		}
	});

	var configPromise,
		devPromise,
		appPromise;

	var steal = function(){
		var args = arguments;
		var afterConfig = function(){
			var imports = [];
			var factory;
			each(args, function(arg){
				if(isString(arg)) {
					imports.push( steal.System['import']( normalize(arg) ) );
				} else if(typeof arg === "function") {
					factory = arg;
				}
			});

			var modules = Promise.all(imports);
			if(factory) {
				return modules.then(function(modules) {
			        return factory && factory.apply(null, modules);
			   });
			} else {
				return modules;
			}
		};
		if(System.isEnv("production")) {
			return afterConfig();
		} else {
			// wait until the config has loaded
			return configPromise.then(afterConfig,afterConfig);
		}

	};

	System.set("@steal", System.newModule({
		"default": steal,
		__useDefault:true
	}));
	System.Set = ArraySet;

	var loaderClone = System.clone;
	System.clone = function(){
		var loader = loaderClone.apply(this, arguments);
		loader.set("@loader", loader.newModule({
			"default": loader,
			__useDefault: true
		}));
		loader.set("@steal", loader.newModule({
			"default": steal,
			__useDefault: true
		}));
		loader.Set = ArraySet;
		return loader;
	};



	// steal.System remains for backwards compat only
	steal.System = steal.loader = System;
	steal.parseURI = parseURI;
	steal.joinURIs = joinURIs;
	steal.normalize = normalize;
	steal.relativeURI = relativeURI;
	steal.addExtension = addStealExtension;

// System-Ext
// This normalize-hook does 2 things.
// 1. with specify a extension in your config
// 		you can use the "!" (bang) operator to load
// 		that file with the extension
// 		System.ext = {bar: "path/to/bar"}
// 		foo.bar! -> foo.bar!path/to/bar
// 2. if you load a javascript file e.g. require("./foo.js")
// 		normalize will remove the ".js" to load the module
addStealExtension(function addExt(loader) {
  loader.ext = {};

  var normalize = loader.normalize,
    endingExtension = /\.(\w+)!?$/;

  loader.normalize = function (name, parentName, parentAddress, pluginNormalize) {
    if (pluginNormalize) {
      return normalize.apply(this, arguments);
    }

    var matches = name.match(endingExtension);
	var outName = name;

    if (matches) {
      var hasBang = name[name.length - 1] === "!",
        ext = matches[1];
      // load js-files nodd-like
      if (parentName && loader.configMain !== name && matches[0] === '.js') {
        outName = name.substr(0, name.lastIndexOf("."));
        // matches ext mapping
      } else if (loader.ext[ext]) {
        outName = name + (hasBang ? "" : "!") + loader.ext[ext];
      }
    }
    return normalize.call(this, outName, parentName, parentAddress);
  };
});

// Steal Locate Extension
// normalize a given path e.g.
// "path/to/folder/" -> "path/to/folder/folder"
addStealExtension(function addForwardSlash(loader) {
  var normalize = loader.normalize;
  var npmLike = /@.+#.+/;

  loader.normalize = function (name, parentName, parentAddress, pluginNormalize) {
    var lastPos = name.length - 1,
      secondToLast,
      folderName,
	  newName = name;

    if (name[lastPos] === "/") {
      secondToLast = name.substring(0, lastPos).lastIndexOf("/");
      folderName = name.substring(secondToLast + 1, lastPos);
      if (npmLike.test(folderName)) {
        folderName = folderName.substr(folderName.lastIndexOf("#") + 1);
      }

      newName += folderName;
    }
    return normalize.call(this, newName, parentName, parentAddress, pluginNormalize);
  };
});

// override loader.translate to rewrite 'locate://' & 'pkg://' path schemes found
// in resources loaded by supporting plugins
addStealExtension(function addLocateProtocol(loader) {
  /**
   * @hide
   * @function normalizeAndLocate
   * @description Run a module identifier through Normalize and Locate hooks.
   * @param {String} moduleName The module to run through normalize and locate.
   * @return {Promise} A promise to resolve when the address is found.
   */
  var normalizeAndLocate = function(moduleName, parentName){
    var loader = this;
    return Promise.resolve(loader.normalize(moduleName, parentName))
      .then(function(name){
        return loader.locate({name: name, metadata: {}});
      }).then(function(address){
		var outAddress = address;
        if(address.substr(address.length - 3) === ".js") {
          outAddress = address.substr(0, address.length - 3);
        }
        return outAddress;
      });
  };

  var relative = function(base, path){
    var uriParts = path.split("/"),
      baseParts = base.split("/"),
      result = [];

    while ( uriParts.length && baseParts.length && uriParts[0] == baseParts[0] ) {
      uriParts.shift();
      baseParts.shift();
    }

    for(var i = 0 ; i< baseParts.length-1; i++) {
      result.push("../");
    }

    return result.join("") + uriParts.join("/");
  };

  var schemePattern = /(locate):\/\/([a-z0-9/._@-]*)/ig,
    parsePathSchemes = function(source, parent) {
      var locations = [];
      source.replace(schemePattern, function(whole, scheme, path, index){
        locations.push({
          start: index,
          end: index+whole.length,
          name: path,
          postLocate: function(address){
            return relative(parent, address);
          }
        });
      });
      return locations;
    };

  var _translate = loader.translate;
  loader.translate = function(load){
    var loader = this;

    // This only applies to plugin resources.
    if(!load.metadata.plugin) {
      return _translate.call(this, load);
    }

    // Use the translator if this file path scheme is supported by the plugin
    var locateSupport = load.metadata.plugin.locateScheme;
    if(!locateSupport) {
      return _translate.call(this, load);
    }

    // Parse array of module names
    var locations = parsePathSchemes(load.source, load.address);

    // no locations found
    if(!locations.length) {
      return _translate.call(this, load);
    }

    // normalize and locate all of the modules found and then replace those instances in the source.
    var promises = [];
    for(var i = 0, len = locations.length; i < len; i++) {
      promises.push(
        normalizeAndLocate.call(this, locations[i].name, load.name)
      );
    }
    return Promise.all(promises).then(function(addresses){
      for(var i = locations.length - 1; i >= 0; i--) {
        load.source = load.source.substr(0, locations[i].start)
          + locations[i].postLocate(addresses[i])
          + load.source.substr(locations[i].end, load.source.length);
      }
      return _translate.call(loader, load);
    });
  };
});

addStealExtension(function addContextual(loader) {
  loader._contextualModules = {};

  loader.setContextual = function(moduleName, definer){
    this._contextualModules[moduleName] = definer;
  };

  var normalize = loader.normalize;
  loader.normalize = function(name, parentName){
    var loader = this;
	var pluginLoader = loader.pluginLoader || loader;

    if (parentName) {
      var definer = this._contextualModules[name];

      // See if `name` is a contextual module
      if (definer) {
        var localName = name + '/' + parentName;

        if(!loader.has(localName)) {
          // `definer` could be a function or could be a moduleName
          if (typeof definer === 'string') {
            definer = pluginLoader['import'](definer);
          }

          return Promise.resolve(definer)
            .then(function(modDefiner) {
				var definer = modDefiner;
              if (definer['default']) {
                definer = definer['default'];
              }
              var definePromise = Promise.resolve(
                definer.call(loader, parentName)
              );
              return definePromise;
            })
            .then(function(moduleDef){
              loader.set(localName, loader.newModule(moduleDef));
              return localName;
            });
        }
        return Promise.resolve(localName);
      }
    }

    return normalize.apply(this, arguments);
  };
});

/**
 * Steal Script-Module Extension
 *
 * Add a steal-module script to the page and it will run after Steal has been
 * configured, e.g:
 *
 * <script type="text/steal-module">...</script>
 * <script type="steal-module">...</script>
 */
addStealExtension(function addStealModule(loader) {
	// taken from https://github.com/ModuleLoader/es6-module-loader/blob/master/src/module-tag.js
	function completed() {
		document.removeEventListener("DOMContentLoaded", completed, false);
		window.removeEventListener("load", completed, false);
		ready();
	}

	function ready() {
		var scripts = document.getElementsByTagName("script");
		for (var i = 0; i < scripts.length; i++) {
			var script = scripts[i];
			if (script.type == "steal-module" || script.type == "text/steal-module") {
				var source = script.innerHTML;
				if (/\S/.test(source)) {
					loader.module(source)["catch"](function(err) {
						setTimeout(function() {
							throw err;
						});
					});
				}
			}
		}
	}

	loader.loadScriptModules = function() {
		if (isBrowserWithWindow) {
			if (document.readyState === "complete") {
				setTimeout(ready);
			} else if (document.addEventListener) {
				document.addEventListener("DOMContentLoaded", completed, false);
				window.addEventListener("load", completed, false);
			}
		}
	};
});

// SystemJS Steal Format
// Provides the Steal module format definition.
addStealExtension(function addStealFormat(loader) {
  // Steal Module Format Detection RegEx
  // steal(module, ...)
  var stealRegEx = /(?:^\s*|[}{\(\);,\n\?\&]\s*)steal\s*\(\s*((?:"[^"]+"\s*,|'[^']+'\s*,\s*)*)/;

  // What we stole.
  var stealInstantiateResult;

  function createSteal(loader) {
    stealInstantiateResult = null;

    // ensure no NodeJS environment detection
    loader.global.module = undefined;
    loader.global.exports = undefined;

    function steal() {
      var deps = [];
      var factory;

      for( var i = 0; i < arguments.length; i++ ) {
        if (typeof arguments[i] === 'string') {
          deps.push( normalize(arguments[i]) );
        } else {
          factory = arguments[i];
        }
      }

      if (typeof factory !== 'function') {
        factory = (function(factory) {
          return function() { return factory; };
        })(factory);
      }

      stealInstantiateResult = {
        deps: deps,
        execute: function(require, exports, moduleName) {

          var depValues = [];
          for (var i = 0; i < deps.length; i++) {
            depValues.push(require(deps[i]));
          }

          var output = factory.apply(loader.global, depValues);

          if (typeof output !== 'undefined') {
            return output;
          }
        }
      };
    }

    loader.global.steal = steal;
  }

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this;

    if (load.metadata.format === 'steal' || !load.metadata.format && load.source.match(stealRegEx)) {
      load.metadata.format = 'steal';

      var oldSteal = loader.global.steal;

      createSteal(loader);

      loader.__exec(load);

      loader.global.steal = oldSteal;

      if (!stealInstantiateResult) {
        throw "Steal module " + load.name + " did not call steal";
      }

      if (stealInstantiateResult) {
        load.metadata.deps = load.metadata.deps ? load.metadata.deps.concat(stealInstantiateResult.deps) : stealInstantiateResult.deps;
        load.metadata.execute = stealInstantiateResult.execute;
      }
    }
    return loaderInstantiate.call(loader, load);
  };
});

/**
 * Extension to warn users when a module is instantiated twice
 *
 * Multiple module instantiation might cause unexpected side effects
 */
addStealExtension(function addModuleLoadedWarn(loader) {
	var superInstantiate = loader.instantiate;

	var warn = typeof console === "object" ?
	Function.prototype.bind.call(console.warn, console) :
	null;

	if(!loader._instantiatedModules) {
		Object.defineProperty(loader, '_instantiatedModules', {
			value: Object.create(null),
			writable: false
		});
	}

	// When loads are part of a failed linkset they have been instantiated
	// but might be re-instantiated if part of another linkset.
	loader._pendingState = function(load){
		var instantiated = loader._instantiatedModules;
		delete instantiated[load.address];
	};

	loader.instantiate = function(load) {
		var address = load.address;
		var loader = this;
		var instantiated = loader._instantiatedModules;

		if (warn && address && instantiated[address]) {
			var loads = (loader._traceData && loader._traceData.loads) || {};
			var map = (loader._traceData && loader._traceData.parentMap) || {};
			var instantiatedFromAddress = instantiated[load.address];

			// If we get here there might be a race condition from a failed linkset.
			if(instantiatedFromAddress.length === 1 &&
				instantiatedFromAddress[0] === load.name) {
				return superInstantiate.apply(loader, arguments);
			}

			var parentMods = instantiatedFromAddress.concat(load.name);
			var parents = parentMods
				.map(function(moduleName){
					return "\t" + moduleName + "\n" +

					(map[moduleName] ? Object.keys(map[moduleName]) : [])
					.map(function(parent) {
						// module names might confuse people
						return "\t\t - " + loads[parent].address;
					})
					.join("\n");
				})
				.join("\n\n");

			warn([
				"The module with address " + load.address +
					" is being instantiated twice.",
				"This happens when module identifiers normalize to different module names.\n",
				"Modules:\n" + (parents || "") + "\n",
				"HINT: Import the module using the ~/[modulePath] identifier.\n" +
				"Learn more at https://stealjs.com/docs/moduleName.html and " +
					"https://stealjs.com/docs/tilde.html"
			].join("\n"));
		} else if(loader._configLoaded && address) {
			instantiated[load.address] = [load.name];
		}

		return superInstantiate.apply(loader, arguments);
	};

	// When a module is deleted, remove its _instantiatedModules record as well.
	var loaderDelete = loader["delete"];
	loader["delete"] = function(moduleName){
		var res = loaderDelete.apply(this, arguments);
		var load = this.getModuleLoad(moduleName);
		if(load) {
			this._instantiatedModules[load.address] = undefined;
		}
		return res;
	};
});

/**
 * Auto-main warning. The main is no longer automatically loaded in development.
 * This warns the user in cases where they likely forgot to set a main.
 **/
addStealExtension(function addNoMainWarn(loader) {
	loader._warnNoMain = function(ms){
		var loader = this;
		this._noMainTimeoutId = setTimeout(function(){
			var msg = "No modules have loaded, did you forget to include a 'main'?" +
				"\nSee https://stealjs.com/docs/config.main.html for more information.";
			console.warn(msg);
			loader.import = loaderImport;
		}, ms);
	};

	var whitelist = {
		"package.json!npm": true,
		"npm": true,
		"@empty": true,
		"@dev": true
	};

	var loaderImport = loader.import;
	loader.import = function(name) {
		if(whitelist[name] === undefined && name !== this.configMain) {
			this.import = loaderImport;
			this._warnNoMain = Function.prototype;
			clearTimeout(this._noMainTimeoutId);
		}

		return loaderImport.apply(this, arguments);
	};

	var loaderModule = loader.module;
	loader.module = function() {
		var p = loaderModule.apply(this, arguments);
		this.module = loaderModule;
		clearTimeout(this._noMainTimeoutId);
		return p;
	};
});

addStealExtension(function addMetaDeps(loader) {
	var superTranspile = loader.transpile;
	var superDetermineFormat = loader._determineFormat;

	function prependDeps (loader, load, callback) {
		var meta = loader.meta[load.name];
		if (meta && meta.deps && meta.deps.length) {
			var imports = meta.deps.map(callback).join('\n');
			load.source = imports + "\n" + load.source;
		}
	}

	function createImport(dep) {
		return "import \"" + dep + "\";";
	}

	function createRequire(dep) {
		return "require(\"" + dep + "\");";
	}

	loader.transpile = function (load) {
		prependDeps(this, load, createImport);
		var result = superTranspile.apply(this, arguments);
		return result;
	}

	loader._determineFormat = function (load) {
		if(load.metadata.format === 'cjs') {
			prependDeps(this, load, createRequire);
		}
		var result = superDetermineFormat.apply(this, arguments);
		return result;
	};
});

addStealExtension(function addStackTrace(loader) {
	function StackTrace(message, items) {
		this.message = message;
		this.items = items;
	}

	StackTrace.prototype.toString = function(){
		var arr = ["Error: " + this.message];
		var t, desc;
		for(var i = 0, len = this.items.length; i < len; i++) {
			t = this.items[i];
			desc = "    at ";
			if(t.fnName) {
				desc += (t.fnName + " ");
			}
			desc += StackTrace.positionLink(t);
			arr.push(desc);
		}
		return arr.join("\n");
	};

	StackTrace.positionLink = function(t){
		var line = t.line || 0;
		var col = t.column || 0;
		return "(" + t.url + ":" + line + ":" + col + ")";
	};

	StackTrace.item = function(fnName, url, line, column) {
		return {
			method: fnName,
			fnName: fnName,
			url: url,
			line: line,
			column: column
		}
	};

	function parse(stack) {
	  var rawLines = stack.split('\n');

	  var v8Lines = compact(rawLines.map(parseV8Line));
	  if (v8Lines.length > 0) return v8Lines;

	  var geckoLines = compact(rawLines.map(parseGeckoLine));
	  if (geckoLines.length > 0) return geckoLines;

	  throw new Error('Unknown stack format: ' + stack);
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack
	var GECKO_LINE = /^(?:([^@]*)@)?(.*?):(\d+)(?::(\d+))?$/;

	function parseGeckoLine(line) {
	  var match = line.match(GECKO_LINE);
	  if (!match) return null;
	  var meth = match[1] || ''
	  return {
	    method:   meth,
		fnName:   meth,
	    url: match[2] || '',
	    line:     parseInt(match[3]) || 0,
	    column:   parseInt(match[4]) || 0,
	  };
	}

	// https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
	var V8_OUTER1 = /^\s*(eval )?at (.*) \((.*)\)$/;
	var V8_OUTER2 = /^\s*at()() (\S+)$/;
	var V8_INNER  = /^\(?([^\(]+):(\d+):(\d+)\)?$/;

	function parseV8Line(line) {
	  var outer = line.match(V8_OUTER1) || line.match(V8_OUTER2);
	  if (!outer) return null;
	  var inner = outer[3].match(V8_INNER);
	  if (!inner) return null;

	  var method = outer[2] || '';
	  if (outer[1]) method = 'eval at ' + method;
	  return {
	    method:   method,
		fnName:   method,
	    url: inner[1] || '',
	    line:     parseInt(inner[2]) || 0,
	    column:   parseInt(inner[3]) || 0,
	  };
	}

	// Helpers

	function compact(array) {
	  var result = [];
	  array.forEach(function(value) {
	    if (value) {
	      result.push(value);
	    }
	  });
	  return result;
	}

	StackTrace.parse = function(error) {
		try {
			var lines = parse(error.stack || error);
			if(lines.length) {
				return new StackTrace(error.message, lines);
			}
		} catch(e) {
			return undefined;
		}

	};

	loader.StackTrace = StackTrace;

	function getPositionOfError(txt) {
		var res = /at position ([0-9]+)/.exec(txt);
		if(res && res.length > 1) {
			return Number(res[1]);
		}
	}

	loader.loadCodeFrame = function(){
		if(!this.global.process) {
			this.global.process = { argv: '', env: {} };
		}

		var loader = this.pluginLoader || this;
		var isProd = loader.isEnv("production");
		var p = isProd ? Promise.resolve() : loader["import"]("@@babel-code-frame");
		return p;
	};

	loader._parseJSONError = function(err, source){
		var pos = getPositionOfError(err.message);
		if(pos) {
			return this._getLineAndColumnFromPosition(source, pos);
		} else {
			return {line: 0, column: 0};
		}
	};

	var errPos = /at position( |:)([0-9]+)/;
	var errLine = /at line ([0-9]+) column ([0-9]+)/;
	loader._parseSyntaxErrorLocation = function(error, load){
		// V8 and Edge
		var res = errPos.exec(error.message);
		if(res && res.length === 3) {
			var pos = Number(res[2]);
			return this._getLineAndColumnFromPosition(load.source, pos);
		}

		// Firefox
		res = errLine.exec(error.message);
		if(res && res.length === 3) {
			return {
				line: Number(res[1]),
				column: Number(res[2])
			};
		}
	}

	loader._addSourceInfoToError = function(err, pos, load, fnName){
		return this.loadCodeFrame()
		.then(function(codeFrame){
			if(codeFrame) {
				var src = load.metadata.originalSource || load.source;
				var codeSample = codeFrame(src, pos.line, pos.column);
				err.message += "\n\n" + codeSample + "\n";
			}
			var stackTrace = new StackTrace(err.message, [
				StackTrace.item(fnName, load.address, pos.line, pos.column)
			]);
			err.stack = stackTrace.toString();
			return Promise.reject(err);
		});
	};

	function findStackFromAddress(st, address) {
		for(var i = 0; i < st.items.length; i++) {
			if(st.items[i].url === address) {
				return st.items[i];
			}
		}
	}

	loader.rejectWithCodeFrame = function(error, load) {
		var st = StackTrace.parse(error);

		var item;
		if(error.onlyIncludeCodeFrameIfRootModule) {
			item = st && st.items[0] && st.items[0].url === load.address && st.items[0];
		} else {
			item = findStackFromAddress(st, load.address);
		}

		if(item) {
			return this.loadCodeFrame()
			.then(function(codeFrame){
				if(codeFrame) {
					var newError = new Error(error.message);

					var line = item.line;
					var column = item.column;

					// CommonJS adds 3 function wrappers
					if(load.metadata.format === "cjs") {
						line = line - 3;
					}

					var src = load.metadata.originalSource || load.source;
					var codeSample = codeFrame(src, line, column);
					if(!codeSample) return Promise.reject(error);

					newError.message += "\n\n" + codeSample + "\n";
					st.message = newError.message;
					newError.stack = st.toString();
					return Promise.reject(newError);
				} else {
					return Promise.reject(error);
				}
			});
		}

		return Promise.reject(error);
	};
});

addStealExtension(function addPrettyName(loader){
	loader.prettyName = function(load){
		var pnm = load.metadata.parsedModuleName;
		if(pnm) {
			return pnm.packageName + "/" + pnm.modulePath;
		}
		return load.name;
	};
});

addStealExtension(function addTreeShaking(loader) {
	function treeShakingEnabled(loader, load) {
		return !loader.noTreeShaking && loader.treeShaking !== false;
	}

	function determineUsedExports(load) {
		var loader = this;

		// 1. Get any new dependencies that haven't been accounted for.
		var newDeps = newDependants.call(this, load);
		var usedExports = new loader.Set();
		var allUsed = false;
		newDeps.forEach(function(depName) {
			var depLoad = loader.getModuleLoad(depName);
			var specifier = loader.moduleSpecifierFromName(depLoad, load.name);
			if (depLoad.metadata.format !== "es6") {
				allUsed = true;
				return;
			}
		});

		// Only walk the export tree if all are not being used.
		// This saves not needing to do the traversal.
		if(!allUsed) {
			allUsed = walkExports.call(loader, load, function(exps){
				exps.forEach(function(name){
					usedExports.add(name);
				});
			});
		}

		// Copy over existing exports
		if(load.metadata.usedExports) {
			load.metadata.usedExports.forEach(function(name){
				usedExports.add(name);
			});
		}

		if(!loader.treeShakeConfig[load.name]) {
			loader.treeShakeConfig[load.name] = Object.create(null);
		}

		load.metadata.usedExports = loader.treeShakeConfig[load.name].usedExports = usedExports;
		load.metadata.allExportsUsed = loader.treeShakeConfig[load.name].allExportsUsed = allUsed;

		return {
			all: allUsed,
			used: usedExports
		};
	}

	// Determine if this load's dependants have changed,
	function newDependants(load) {
		var out = [];
		var deps = this.getDependants(load.name);
		var shakenParents = load.metadata.shakenParents;
		if (!shakenParents) {
			out = deps;
		} else {
			for (var i = 0; i < deps.length; i++) {
				if (shakenParents.indexOf(deps[i]) === -1) {
					out.push(deps[i]);
				}
			}
		}
		return out;
	}

	function walkExports(load, cb) {
		var moduleName = load.name;
		var name = moduleName;
		var visited = new this.Set();

 		// The stack is an array containing stuff we are traversing.
		// It looks like:
		// [moduleName, parentA, parentB, null]
		var stack = [name].concat(this.getDependants(name));
		var namesMap = null;
		var index = 0;
		var cont = true;

		// If there is only one item in the stack, this module has no parents yet.
		if(stack.length === 1) {
			return true;
		}

		// Special case for immediate parents, as these are the ones
		// That determine when all exports are used.
		var immediateParents = Object.create(null);
		stack.forEach(function(name) {
			immediateParents[name] = true;
		});

		do {
			index++;
			var parentName = stack[index];

			if(parentName == null) {
				name = stack[++index];
				cont = index < stack.length - 1;
				continue;
			}

			if(visited.has(parentName)) {
				continue;
			}

			visited.add(parentName);
			var parentLoad = this.getModuleLoad(parentName);
			var parentSpecifier = this.moduleSpecifierFromName(
				parentLoad,
				name
			);

			var parentIsESModule = parentLoad.metadata.format === "es6";
			var parentImportNames = parentLoad.metadata.importNames;
			var parentExportNames = parentLoad.metadata.exportNames;

			// If this isn't an ES module then return true (indicating all are used)
			if(!parentIsESModule && immediateParents[parentName]) {
				return true;
			}

			if(parentImportNames && parentImportNames[parentSpecifier]) {
				var names = parentImportNames[parentSpecifier];
				if(namesMap) {
					var parentsNames = names;
					names = [];
					parentsNames.forEach(function(name){
						if(namesMap.has(name)) {
							names.push(namesMap.get(name));
						}
					});
				}


				cont = cb(names) !== false;
			}

			if(parentExportNames && parentExportNames[parentSpecifier]) {
				var names = parentExportNames[parentSpecifier];
				var parentDependants = this.getDependants(parentName);
				// Named exports
				if(isNaN(names)) {
					namesMap = names;
				}
				// export * with no dependants should result in no tree-shaking
				else if(!parentDependants.length) {
					return true;
				}

				stack.push(null);
				stack.push(parentName);
				stack.push.apply(stack, parentDependants);
			}

			cont = cont !== false && index < stack.length - 1;
		} while(cont);

		return false;
	}

	/**
	 * Determine if the new parent has resulted in new used export names
	 * If so, redefine this module so that it goes into the registry correctly.
	 */
	function reexecuteIfNecessary(load, parentName) {
		var usedExports = [];
		var allExportsUsed = walkExports.call(this, load, function(exps) {
			usedExports.push.apply(usedExports, exps);
		});

		// Given the parent's used exports, loop over and see if any are not
		// within the usedExports set.
		var hasNewExports = allExportsUsed;

		// If there isn't a usedExports Set, we have yet to check.
		if(!allExportsUsed && load.metadata.usedExports) {
			for (var i = 0; i < usedExports.length; i++) {
				if (!load.metadata.usedExports.has(usedExports[i])) {
					hasNewExports = true;
					break;
				}
			}
		}

		if (hasNewExports) {
			var source = load.metadata.originalSource || load.source;
			this.provide(load.name, source, load);
		}

		return Promise.resolve();
	}

	// Check if a module has already been tree-shaken.
	// And if so, re-execute it if there are new dependant modules.
	var notifyLoad = loader.notifyLoad;
	loader.notifyLoad = function(specifier, name, parentName){
		var load = loader.getModuleLoad(name);

		// If this module is already marked as tree-shakable it means
		// it has been loaded before. Determine if it needs to be reexecuted.
		if (load && load.metadata.treeShakable) {
			return reexecuteIfNecessary.call(this, load, parentName);
		}
		return notifyLoad.apply(this, arguments);
	};

	function treeShakePlugin(loader, load) {
		// existence of this type of Node means the module is not tree-shakable
		var notShakable = {
			exit: function(path, state) {
				state.treeShakable = false;
			}
		};

		// "bare" imports like `import "foo";` do not affect tree-shaking
		// any non-"bare" import means module cannot be tree-shaken
		var checkImportForShakability = {
			exit: function(path, state) {
				state.treeShakable = path.node.specifiers.length === 0;
			}
		};

		var notShakeableVisitors = {
			ImportDeclaration: checkImportForShakability,
			FunctionDeclaration: notShakable,
			VariableDeclaration: notShakable
		};

		var usedResult;
		// Call determineUsedExports, caching the result.
		function _determineUsedExports() {
			if(usedResult) {
				return usedResult;
			}
			usedResult = determineUsedExports.call(
				loader,
				load
			);
			return usedResult;
		}

		return {
			visitor: {
				Program: {
					enter: function(path) {
						var state = {};
						path.traverse(notShakeableVisitors, state);

						load.metadata.treeShakable = state.treeShakable !== false;
						if(!loader.treeShakeConfig[load.name]) {
							loader.treeShakeConfig[load.name] = Object.create(null);
						}
						loader.treeShakeConfig[load.name].treeShakable = load.metadata.treeShakable;
					}
				},

				ExportNamedDeclaration: function(path, state) {
					if (load.metadata.treeShakable) {
						var usedResult = _determineUsedExports();
						var usedExports = usedResult.used;
						var allUsed = usedResult.all;

						if (!allUsed) {
							path.get("specifiers").forEach(function(path) {
								var name = path.get("exported.name").node;
								if (
									!usedExports.has(name) &&
									name !== "__esModule"
								) {
									path.remove();
								}
							});

							if (path.get("specifiers").length === 0) {
								path.remove();
							}
						}
					}
				},

				ExportAllDeclaration: function(path, state) {
					if(load.metadata.treeShakable) {
						// This forces the load.metadata.usedExports property to be set
						// This is needed in modules that *only* have `export *` declarations.
						_determineUsedExports();
					}
				}
			}
		};
	}

	// Collect syntax plugins, because we need to always include these.
	var getSyntaxPlugins = (function(){
		var plugins;
		return function(babel) {
			if(!plugins) {
				plugins = [];
				for(var p in babel.availablePlugins) {
					if(p.indexOf("syntax-") === 0) {
						plugins.push(babel.availablePlugins[p]);
					}
				}
			}
			return plugins;
		};
	})();




	function applyBabelPlugin(load) {
		var loader = this;
		var pluginLoader = loader.pluginLoader || loader;

		return pluginLoader.import("babel").then(function(mod) {
			var transpiler = mod.__useDefault ? mod.default : mod;
			var babel = transpiler.Babel || transpiler.babel || transpiler;

			try {
				var babelPlugins = [].concat(getSyntaxPlugins(babel));
				babelPlugins.push(loader._getImportSpecifierPositionsPlugin.bind(null, load));
				if(treeShakingEnabled(loader, load)) {
					babelPlugins.push(treeShakePlugin.bind(null, loader, load));
				}
				var code = babel.transform(load.source, {
					plugins: babelPlugins,
					compact: false,
					filename: load && load.address
				}).code;

				// If everything is tree shaken still mark as ES6
				// Not doing this and steal won't accept the transform.
				if(code === "") {
					return '"format es6";';
				}

				return code;
			} catch (e) {
				// Probably using some syntax that requires additional plugins.
				if(e instanceof SyntaxError) {
					return Promise.resolve();
				}
				return Promise.reject(e);
			}
		});
	}

	var translate = loader.translate;
	var es6RegEx = /(^\s*|[}\);\n]\s*)(import\s+(['"]|(\*\s+as\s+)?[^"'\(\)\n;]+\s+from\s+['"]|\{)|export\s+\*\s+from\s+["']|export\s+(\{|default|function|class|var|const|let|async\s+function))/;
	loader.translate = function treeshakeTranslate(load) {
		var loader = this;
		return Promise.resolve()
			.then(function() {
				if (es6RegEx.test(load.source)) {
					if(!load.metadata.originalSource)
						load.metadata.originalSource = load.source;
					return applyBabelPlugin.call(loader, load);
				}
			})
			.then(function(source) {
				if (source) {
					load.source = source;
				}
				return translate.call(loader, load);
			});
	};

	// For the build, wrap the _newLoader hook. This is to copy config over
	// that needs to exist for all loaders.
	loader.treeShakeConfig = Object.create(null);
	var newLoader = loader._newLoader || Function.prototype;
	loader._newLoader = function(loader){
		var treeShakeConfig = this.treeShakeConfig;
		loader.treeShakeConfig = this.treeShakeConfig;

		for(var moduleName in treeShakeConfig) {
			var moduleTreeShakeConfig = treeShakeConfig[moduleName];

			var metaConfig = Object.create(null);
			metaConfig.treeShakable = moduleTreeShakeConfig.treeShakable;
			metaConfig.usedExports = new this.Set(moduleTreeShakeConfig.usedExports);
			metaConfig.allExportsUsed = moduleTreeShakeConfig.allExportsUsed;

			var config = {meta:{}};
			config.meta[moduleName] = metaConfig;
			loader.config(config);
		}
	};
});

addStealExtension(function addMJS(loader){
	var mjsExp = /\.mjs$/;
	var jsExp = /\.js$/;

	var locate = loader.locate;
	loader.locate = function(load){
		var isMJS = mjsExp.test(load.name);
		var p = locate.apply(this, arguments);

		if(isMJS) {
			return Promise.resolve(p).then(function(address) {
				if(jsExp.test(address)) {
					return address.substr(0, address.length - 3);
				}
				return address;
			});
		}

		return p;
	};
});

addStealExtension(function applyTraceExtension(loader) {
	loader._traceData = {
		loads: {},
		parentMap: {}
	};

	loader.getDependencies = function(moduleName){
		var load = this.getModuleLoad(moduleName);
		return load ? load.metadata.dependencies : undefined;
	};
	loader.getDependants = function(moduleName){
		var deps = [];
		var pars = this._traceData.parentMap[moduleName] || {};
		eachOf(pars, function(name) { deps.push(name); });
		return deps;
	};
	loader.getModuleLoad = function(moduleName){
		return this._traceData.loads[moduleName];
	};
	loader.getBundles = function(moduleName, argVisited){
		var visited = argVisited || {};
		visited[moduleName] = true;
		var loader = this;
		var parentMap = loader._traceData.parentMap;
		var parents = parentMap[moduleName];
		if(!parents) return [moduleName];

		var bundles = [];
		eachOf(parents, function(parentName, value){
			if(!visited[parentName])
				bundles = bundles.concat(loader.getBundles(parentName, visited));
		});
		return bundles;
	};
	loader.getImportSpecifier = function(fullModuleName, load){
		var idx = 0, specifier;
		while(idx < load.metadata.dependencies.length) {
			if(load.metadata.dependencies[idx] === fullModuleName) {
				specifier = load.metadata.deps[idx];
				break;
			}
			idx++;
		}
		if(specifier) {
			if(load.metadata.importSpecifiers) {
				return (load.metadata.importSpecifiers[specifier] || {}).start;
			} else if(load.metadata.getImportPosition) {
				return load.metadata.getImportPosition(specifier);
			}
		}
	};
	loader.moduleSpecifierFromName = function(load, moduleName) {
		var deps = load.metadata.dependencies;
		if(!deps) return undefined;
		var idx = deps.indexOf(moduleName);
		return load.metadata.deps[idx];
	};
	loader._allowModuleExecution = {};
	loader.allowModuleExecution = function(name){
		var loader = this;
		return loader.normalize(name).then(function(name){
			loader._allowModuleExecution[name] = true;
		});
	};

	function eachOf(obj, callback){
		var name, val;
		for(name in obj) {
			callback(name, obj[name]);
		}
	}

	var normalize = loader.normalize;
	loader.normalize = function(name, parentName){
		var normalizePromise = normalize.apply(this, arguments);

		if(parentName) {
			var parentMap = this._traceData.parentMap;
			return normalizePromise.then(function(name){
				if(!parentMap[name]) {
					parentMap[name] = {};
				}
				parentMap[name][parentName] = true;
				return name;
			});
		}

		return normalizePromise;
	};

	var emptyExecute = function(){
		return loader.newModule({});
	};

	var passThroughModules = {
		traceur: true,
		babel: true
	};
	var isAllowedToExecute = function(load){
		return passThroughModules[load.name] || this._allowModuleExecution[load.name];
	};

	var map = [].map || function(callback){
		var res = [];
		for(var i = 0, len = this.length; i < len; i++) {
			res.push(callback(this[i]));
		}
		return res;
	};

	var esImportDepsExp = /import [\s\S]*?["'](.+)["']/g;
	var esExportDepsExp = /export .+ from ["'](.+)["']/g;
	var commentRegEx = /(?:(?:^|\s)\/\/(.+?)$)|(?:\/\*([\S\s]*?)\*\/)/gm;
	var stringRegEx = /(?:("|')[^\1\\\n\r]*(?:\\.[^\1\\\n\r]*)*\1|`[^`]*`)/g;

	function getESDeps(source) {
		var cleanSource = source.replace(commentRegEx, "");

		esImportDepsExp.lastIndex = commentRegEx.lastIndex =
			esExportDepsExp.lastIndex = stringRegEx.lastIndex = 0;

		var match;
		var deps = [];
		var stringLocations = []; // track string for unminified source

		function inLocation(locations, match) {
		  for (var i = 0; i < locations.length; i++)
			if (locations[i][0] < match.index && locations[i][1] > match.index)
			  return true;
		  return false;
		}

		function addDeps(exp) {
			while (match = exp.exec(cleanSource)) {
			  // ensure we're not within a string location
			  if (!inLocation(stringLocations, match)) {
				var dep = match[1];
				deps.push(dep);
			  }
			}
		}

		if (source.length / source.split('\n').length < 200) {
		  while (match = stringRegEx.exec(cleanSource))
			stringLocations.push([match.index, match.index + match[0].length]);
		}

		addDeps(esImportDepsExp);
		addDeps(esExportDepsExp);

		return deps;
	}

	var instantiate = loader.instantiate;
	loader.instantiate = function(load){
		this._traceData.loads[load.name] = load;
		var loader = this;
		var instantiatePromise = Promise.resolve(instantiate.apply(this, arguments));

		function finalizeResult(result){
			var preventExecution = loader.preventModuleExecution &&
				!isAllowedToExecute.call(loader, load);

			// deps either comes from the instantiate result, or if an
			// es6 module it was found in the transpile hook.
			var deps = result ? result.deps : load.metadata.deps;
			var normalize = loader.normalizeSpecifier || loader.normalize;

			return Promise.all(map.call(deps, function(depName){
				return normalize.call(loader, depName, load.name);
			})).then(function(dependencies){
				load.metadata.deps = deps;
				load.metadata.dependencies = dependencies;

				if(preventExecution) {
					return {
						deps: deps,
						execute: emptyExecute
					};
				}

				return result;

			});
		}

		return instantiatePromise.then(function(result){
			// This must be es6
			if(!result) {
				var deps = getESDeps(load.source);
				load.metadata.deps = deps;
			}
			return finalizeResult(result);
		});
	};

	var transpile = loader.transpile;
	// Allow transpile to be memoized, but only once
	loader.transpile = function(load){
		var transpiled = load.metadata.transpiledSource;
		if(transpiled) {
			delete load.metadata.transpiledSource;
			return Promise.resolve(transpiled);
		}
		return transpile.apply(this, arguments);
	};

	loader.eachModule = function(cb){
		for (var moduleName in this._loader.modules) {
			cb.call(this, moduleName, this.get(moduleName));
		}
	};
});

// Steal JSON Format
// Provides the JSON module format definition.
addStealExtension(function addJSON(loader) {
  var jsonExt = /\.json$/i;
  var jsExt = /\.js$/i;

  // taken from prototypejs
  // https://github.com/sstephenson/prototype/blob/master/src/prototype/lang/string.js#L682-L706
  function isJSON(json) {
	var str = json;
    if (!str) return false;

    str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
    str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
    str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
    return (/^[\],:{}\s]*$/).test(str);
  }

  // if someone has a moduleName that is .json, make sure it loads a json file
  // no matter what paths might do
  var loaderLocate = loader.locate;
  loader.locate = function(load){
    return loaderLocate.apply(this, arguments).then(function(address){
      if(jsonExt.test(load.name)) {
        return address.replace(jsExt, "");
      }

      return address;
    });
  };

  var transform = function(loader, load, data){
    var fn = loader.jsonOptions && loader.jsonOptions.transform;
    if(!fn) return data;
    return fn.call(loader, load, data);
  };

  // If we are in a build we should convert to CommonJS instead.
  if(isNode) {
    var loaderTranslate = loader.translate;
    loader.translate = function(load){
      var address = load.metadata.address || load.address;
      if(jsonExt.test(address) && load.name.indexOf('!') === -1) {
        var parsed = parse.call(this, load);
        if(parsed) {
          parsed = transform(this, load, parsed);
          return "def" + "ine([], function(){\n" +
            "\treturn " + JSON.stringify(parsed) + "\n});";
        }
      }

      return loaderTranslate.call(this, load);
    };
    return;
  }

  var loaderInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var loader = this,
      parsed;

    parsed = parse.call(this, load);
    if(parsed) {
      parsed = transform(loader, load, parsed);
      load.metadata.format = 'json';

      load.metadata.execute = function(){
        return parsed;
      };
    }

    return loaderInstantiate.call(loader, load);
  };

  return loader;

  // Attempt to parse a load as json.
  function parse(load){
    if ((load.metadata.format === 'json' || !load.metadata.format) &&
		(isJSON(load.source) || jsonExt.test(load.name))) {
      try {
        return JSON.parse(load.source);
      } catch(e) {
		var warn = console.warn.bind(console);
		if(e instanceof SyntaxError) {
			var loc = this._parseSyntaxErrorLocation(e, load);

			if(loc) {
				var msg = "Unable to parse " + load.address;
				var newError = new SyntaxError(msg);
				newError.promise = this._addSourceInfoToError(newError,
					loc, load, "JSON.parse");
				throw newError;
			}
		}
        warn("Error parsing " + load.address + ":", e);
        return {};
      }
    }

  }
});

// Steal Cache-Bust Extension
// if enabled, Steal Cache-Bust will add a
// cacheKey and cacheVersion to the required file address
addStealExtension(function addCacheBust(loader) {
	var fetch = loader.fetch;

	loader.fetch = function(load) {
		var loader = this;

		if(loader.isEnv("production") && loader.cacheVersion) {
			var cacheVersion = loader.cacheVersion,
				cacheKey = loader.cacheKey || "version",
				cacheKeyVersion = cacheKey + "=" + cacheVersion;

			load.address = load.address + (load.address.indexOf('?') === -1 ? '?' : '&') + cacheKeyVersion;
		}
		return fetch.call(this, load);
	};
});

	// Overwrites System.config with setter hooks
	var setterConfig = function(loader, configOrder, configSpecial){
		var oldConfig = loader.config;

		loader.config =  function(cfg){

			var data = extend({},cfg);
			// check each special
			each(configOrder, function(name){
				var special = configSpecial[name];
				// if there is a setter and a value
				if(special.set && data[name]){
					// call the setter
					var res = special.set.call(loader,data[name], cfg);
					// if the setter returns a value
					if(res !== undefined) {
						// set that on the loader
						loader[name] = res;
					}
					// delete the property b/c setting is done
					delete data[name];
				}
			});
			oldConfig.call(this, data);
		};
	};

	var setIfNotPresent = function(obj, prop, value){
		if(!obj[prop]) {
			obj[prop] = value;
		}
	};

	// steal.js's default configuration values
	System.configMain = "@config";
	System.devBundle = "@empty";
	System.depsBundle = "@empty";
	System.paths[System.configMain] = "stealconfig.js";
	System.env = (isWebWorker ? "worker" : "window") + "-development";
	System.ext = Object.create(null);
	System.logLevel = 0;
	System.forceES5 = true;
	var cssBundlesNameGlob = "bundles/*.css",
		jsBundlesNameGlob = "bundles/*";
	setIfNotPresent(System.paths,cssBundlesNameGlob, "dist/bundles/*css");
	setIfNotPresent(System.paths,jsBundlesNameGlob, "dist/bundles/*.js");
	var less = System.global.less || (System.global.less = {});
	less.async = true;

	var configSetter = function(order){
		return {
			order: order,
			set: function(val){
				var name = filename(val),
					root = dir(val);

				if(!isNode) {
					System.configPath = joinURIs( location.href, val);
				}
				System.configMain = name;
				System.paths[name] = name;
				this.config({ baseURL: (root === val ? "." : root) + "/" });
			}
		}
	},
		valueSetter = function(prop, order) {
			return {
				order: order,
				set: function(val) {
					this[prop] = val;
				}
			}
		},
		booleanSetter = function(prop, order) {
			return {
				order: order,
				set: function(val) {
					this[prop] = !!val && val !== "false";
				}
			}
		},
		fileSetter = function(prop, order) {
			return {
				order: order,
				set: function(val) {
					this[prop] = envPath(val);
				}
			};
		};

	// checks if we're running in node, then prepends the "file:" protocol if we are
	var envPath = function(pathVal) {
		var val = pathVal;
		if(isNode && !/^file:/.test(val)) {
			// If relative join with the current working directory
			if(val[0] === "." && (val[1] === "/" ||
								 (val[1] === "." && val[2] === "/"))) {
				val = require("path").join(process.cwd(), val);
			}
			if(!val) return val;

			return "file:" + val;
		}
		return val;
	};

	var setToSystem = function(prop){
		return {
			set: function(val){
				if(typeof val === "object" && typeof steal.System[prop] === "object") {
					this[prop] = extend(this[prop] || {},val || {});
				} else {
					this[prop] = val;
				}
			}
		};
	};

	var pluginPart = function(name) {
		var bang = name.lastIndexOf("!");
		if(bang !== -1) {
			return name.substr(bang+1);
		}
	};

	var pluginResource = function(name){
		var bang = name.lastIndexOf("!");
		if(bang !== -1) {
			return name.substr(0, bang);
		}
	};

	var addProductionBundles = function(){
		// we don't want add the main bundled module if steal is bundled inside!
		if(this.loadBundles && this.main && !this.stealBundled) {
			var main = this.main,
				bundlesDir = this.bundlesName || "bundles/",
				mainBundleName = bundlesDir+main;

			setIfNotPresent(this.meta, mainBundleName, {format:"amd"});

			// If the configMain has a plugin like package.json!npm,
			// plugin has to be defined prior to importing.
			var plugin = pluginPart(System.configMain);
			var bundle = [main, System.configMain];
			if(plugin){
				System.set(plugin, System.newModule({}));
			}
			plugin = pluginPart(main);
			if(plugin) {
				var resource = pluginResource(main);
				bundle.push(plugin);
				bundle.push(resource);

				mainBundleName = bundlesDir+resource.substr(0, resource.indexOf("."));
			}

			this.bundles[mainBundleName] = bundle;
		}
	};

	var setEnvsConfig = function(){
		if(this.envs) {
			var envConfig = this.envs[this.env];
			if(envConfig) {
				this.config(envConfig);
			}
		}
	};

	var setupLiveReload = function(){
		if(this.liveReloadInstalled) {
			var loader = this;
			this["import"]("live-reload", {
				name: "@@steal"
			}).then(function(reload){
				reload(loader.configMain, function(){
					setEnvsConfig.call(loader);
				});
			});
		}
	};

	var specialConfigOrder = [];
	var envsSpecial = { map: true, paths: true, meta: true };
	var specialConfig = {
		instantiated: {
			order: 1,
			set: function(val){
				var loader = this;

				each(val || {}, function(value, name){
					loader.set(name,  loader.newModule(value));
				});
			}
		},
		envs: {
			order: 2,
			set: function(val){
				// envs should be set, deep
				var envs = this.envs;
				if(!envs) envs = this.envs = {};
				each(val, function(cfg, name){
					var env = envs[name];
					if(!env) env = envs[name] = {};

					each(cfg, function(val, name){
						if(envsSpecial[name] && env[name]) {
							extend(env[name], val);
						} else {
							env[name] = val;
						}
					});
				});
			}
		},
		env: {
			order: 3,
			set: function(val){
				this.env = val;

				if(this.isEnv("production")) {
					this.loadBundles = true;
				}
			}
		},
		loadBundles: booleanSetter("loadBundles", 4),
		stealBundled: booleanSetter("stealBundled", 5),
		// System.config does not like being passed arrays.
		bundle: {
			order: 6,
			set: function(val){
				System.bundle = val;
			}
		},
		bundlesPath: {
			order: 7,
			set: function(val){
				this.paths[cssBundlesNameGlob] = val+"/*css";
				this.paths[jsBundlesNameGlob]  = val+"/*.js";
				return val;
			}
		},
		meta: {
			order: 8,
			set: function(cfg){
				var loader = this;
				each(cfg || {}, function(value, name){
					if(typeof value !== "object") {
						return;
					}
					var cur = loader.meta[name];
					if(cur && cur.format === value.format) {
						// Keep the deps, if we have any
						var deps = value.deps;
						extend(value, cur);
						if(deps) {
							value.deps = deps;
						}
					}
				});
				extend(this.meta, cfg);
			}
		},
		configMain: valueSetter("configMain", 9),
		config: configSetter(10),
		configPath: configSetter(11),
		baseURL: fileSetter("baseURL", 12),
		main: valueSetter("main", 13),
		// this gets called with the __dirname steal is in
		// directly called from steal-tools
		stealPath: {
			order: 14,
			set: function(identifier, cfg) {
				var dirname = envPath(identifier);
				var parts = dirname.split("/");

				// steal keeps this around to make things easy no matter how you are using it.
				setIfNotPresent(this.paths,"@dev", dirname+"/ext/dev.js");
				setIfNotPresent(this.paths,"npm", dirname+"/ext/npm.js");
				setIfNotPresent(this.paths,"npm-extension", dirname+"/ext/npm-extension.js");
				setIfNotPresent(this.paths,"npm-utils", dirname+"/ext/npm-utils.js");
				setIfNotPresent(this.paths,"npm-crawl", dirname+"/ext/npm-crawl.js");
				setIfNotPresent(this.paths,"npm-load", dirname+"/ext/npm-load.js");
				setIfNotPresent(this.paths,"npm-convert", dirname+"/ext/npm-convert.js");
				setIfNotPresent(this.paths,"semver", dirname+"/ext/semver.js");
				setIfNotPresent(this.paths,"live-reload", dirname+"/ext/live-reload.js");
				setIfNotPresent(this.paths,"steal-clone", dirname+"/ext/steal-clone.js");
				this.paths["traceur"] = dirname+"/ext/traceur.js";
				this.paths["traceur-runtime"] = dirname+"/ext/traceur-runtime.js";
				this.paths["babel"] = dirname+"/ext/babel.js";
				this.paths["babel-runtime"] = dirname+"/ext/babel-runtime.js";
				this.paths["@@babel-code-frame"] = dirname+"/ext/babel-code-frame.js";
				setIfNotPresent(this.meta,"traceur",{"exports":"traceur"});
				setIfNotPresent(this.meta, "@@babel-code-frame", {"format":"global","exports":"BabelCodeFrame"});

				// steal-clone is contextual so it can override modules using relative paths
				this.setContextual('steal-clone', 'steal-clone');

				if(isNode) {
					if(this.configMain === "@config" && last(parts) === "steal") {
						parts.pop();
						if(last(parts) === "node_modules") {
							this.configMain = "package.json!npm";
							parts.pop();
						}
					}
					if(this.isEnv("production") || this.loadBundles) {
						addProductionBundles.call(this);
					}
				} else {
					// make sure we don't set baseURL if it already set
					if(!cfg.baseURL && !cfg.config && !cfg.configPath) {

						// if we loading steal.js and it is located in node_modules
						// we rewrite the baseURL relative to steal.js (one directory up!)
						// we do this because, normaly our app is located as a sibling folder to
						// node_modules
						if ( last(parts) === "steal" ) {
							parts.pop();
							var isFromPackage = false;
							if (last(parts) === "node_modules") {
								System.configMain = "package.json!npm";
								addProductionBundles.call(this);
								parts.pop();
								isFromPackage = true;
							}
							if(!isFromPackage) {
								parts.push("steal");
							}
						}
						this.config({ baseURL: parts.join("/")+"/"});
					}
				}
				System.stealPath = dirname;
			}
		},
		stealURL: {
			order: 15,
			// http://domain.com/steal/steal.js?moduleName,env&
			set: function(url, cfg)	{
				var urlParts = url.split("?"),
					path = urlParts.shift(),
					paths = path.split("/"),
					lastPart = paths.pop(),
					stealPath = paths.join("/"),
					platform = this.getPlatform() || (isWebWorker ? "worker" : "window");

				System.stealURL = path;

				// if steal is bundled or we are loading steal.production
				// we always are in production environment
				if((this.stealBundled && this.stealBundled === true) ||
					((lastPart.indexOf("steal.production") > -1) ||
						(lastPart.indexOf("steal-with-promises.production") > -1)
					 	&& !cfg.env)) {
					this.config({ env: platform+"-production" });
				}

				if(this.isEnv("production") || this.loadBundles) {
					addProductionBundles.call(this);
				}

				specialConfig.stealPath.set.call(this,stealPath, cfg);
			}
		},
		devBundle: {
			order: 16,

			set: function(dirname, cfg) {
				var path = (dirname === true) ? "dev-bundle" : dirname;

				if (path) {
					this.devBundle = path;
				}
			}
		},
		depsBundle: {
			order: 17,

			set: function(dirname, cfg) {
				var path = (dirname === true) ? "dev-bundle" : dirname;

				if (path) {
					this.depsBundle = path;
				}
			}
		}
	};

	/*
	 make a setter order
	 currently:

	 instantiated
	 envs
	 env
	 loadBundles
	 stealBundled
	 bundle
	 bundlesPath
	 meta
	 config
	 configPath
	 baseURL
	 main
	 stealPath
	 stealURL
	 */
	each(specialConfig, function(setter, name){
		if(!setter.order) {
			specialConfigOrder.push(name)
		}else{
			specialConfigOrder.splice(setter.order, 0, name);
		}
	});

	// special setter config
	setterConfig(System, specialConfigOrder, specialConfig);

	steal.config = function(cfg){
		if(typeof cfg === "string") {
			return this.loader[cfg];
		} else {
			this.loader.config(cfg);
		}
	};

// Steal Env Extension
// adds some special environment functions to the loader
addStealExtension(function addEnv(loader) {

	loader.getEnv = function(){
		var envParts = (this.env || "").split("-");
		// Fallback to this.env for legacy
		return envParts[1] || this.env;
	};

	loader.getPlatform = function(){
		var envParts = (this.env || "").split("-");
		return envParts.length === 2 ? envParts[0] : undefined;
	};

	loader.isEnv = function(name){
		return this.getEnv() === name;
	};

	loader.isPlatform = function(name){
		return this.getPlatform() === name;
	};
});

	// get config by the URL query
	// like ?main=foo&env=production
	// formally used for Webworkers
	var getQueryOptions = function(url) {
		var queryOptions = {},
			urlRegEx = /Url$/,
			urlParts = url.split("?"),
			path = urlParts.shift(),
			search = urlParts.join("?"),
			searchParts = search.split("&"),
			paths = path.split("/"),
			lastPart = paths.pop(),
			stealPath = paths.join("/");

		if(searchParts.length && searchParts[0].length) {
				var searchPart;
			for(var i =0; i < searchParts.length; i++) {
				searchPart = searchParts[i];
				var paramParts = searchPart.split("=");
				if(paramParts.length > 1) {
					var optionName = camelize(paramParts[0]);
					// make options uniform e.g. baseUrl => baseURL
					optionName = optionName.replace(urlRegEx, "URL")
					queryOptions[optionName] = paramParts.slice(1).join("=");
				}
			}
		}
		return queryOptions;
	};

	// extract the script tag options
	var getScriptOptions = function (script) {
		var scriptOptions = {},
			urlRegEx = /Url$/;

		scriptOptions.stealURL = script.src;

		each(script.attributes, function(attr){
			var nodeName = attr.nodeName || attr.name;
			// get option, remove "data" and camelize
			var optionName =
				camelize( nodeName.indexOf("data-") === 0 ?
					nodeName.replace("data-","") :
					nodeName );
			// make options uniform e.g. baseUrl => baseURL
			optionName = optionName.replace(urlRegEx, "URL")
			scriptOptions[optionName] = (attr.value === "") ? true : attr.value;
		});

		// main source within steals script is deprecated
		// and will be removed in future releases
		var source = script.innerHTML;
		if(/\S/.test(source)){
			scriptOptions.mainSource = source;
		}

		// script config ever wins!
		var config = extend(getQueryOptions(script.src), scriptOptions);
		if (config.main) {
			// if main was passed as an html boolean, let steal figure what
			// is the main module, but turn on auto main loading
			if (typeof config.main === "boolean") {
				delete config.main;
			}
			config.loadMainOnStartup = true;
		}

		return config;
	};

	// get steal URL
	// if we are in a browser, we need to know which script is steal
	// to extract the script tag options => getScriptOptions()
	var getUrlOptions = function (){
		var steal = this;
		return new Promise(function(resolve, reject){

			// for Workers get options from steal query
			if (isWebWorker) {
				resolve(extend({
					loadMainOnStartup: true,
					stealURL: location.href
				}, getQueryOptions(location.href)));
				return;
			} else if(hasAWindow) {
				// if the browser supports currentScript, use it!
				steal.script = stealScript || getStealScript();
				resolve(getScriptOptions(steal.script));
				return;
			} else {
				// or the only option is where steal is.
				resolve({
					loadMainOnStartup: true,
					stealPath: __dirname
				});
			}
		});
	};

	// configure and startup steal
	// load the main module(s) if everything is configured
	steal.startup = function(startupConfig){
		var steal = this;
		var loader = this.loader;
		var configResolve;
		var configReject;

		configPromise = new Promise(function(resolve, reject){
			configResolve = resolve;
			configReject = reject;
		});

		appPromise = getUrlOptions.call(this).then(function(urlOptions) {
			var config;

			if (typeof startupConfig === 'object') {
				// the url options are the source of truth
				config = extend(startupConfig, urlOptions);
			} else {
				config = urlOptions;
			}

			// set the config
			loader.config(config);

			setEnvsConfig.call(loader);

			// we only load things with force = true
			if (loader.loadBundles) {
				if (
					!loader.main &&
					loader.isEnv("production") &&
					!loader.stealBundled
				) {
					// prevent this warning from being removed by Uglify
					warn("Attribute 'main' is required in production environment. Please add it to the script tag.");
				}

				loader["import"](loader.configMain).then(
					configResolve,
					configReject
				);

				return configPromise.then(function (cfg) {
					setEnvsConfig.call(loader);
					loader._configLoaded = true;
					return loader.main && config.loadMainOnStartup
						? loader["import"](loader.main)
						: cfg;
				});

			} else {
				function handleDevBundleError(err) {
					if(err.statusCode === 404 && steal.script) {
						var type = (loader.devBundle ? "dev-" : "deps-") + "bundle";
						var msg = "This page has " + type + " enabled " +
							"but " + err.url + " could not be retrieved.\nDid you " +
							"forget to generate the bundle first?\n" +
							"See https://stealjs.com/docs/StealJS.development-bundles.html for more information.";
						var newError = new Error(msg);
						// A stack is not useful here. Ideally we could get the line/column
						// In the HTML, but there is no way to get this.
						newError.stack = null;
						return Promise.reject(newError);
					}
					return Promise.reject(err);
				}

				// devBundle includes the same modules as "depsBundle and it also
				// includes the @config graph, so it should be loaded before of
				// configMain
				loader["import"](loader.devBundle)
					.then(function() {
						return loader["import"](loader.configMain);
					}, handleDevBundleError)
					.then(function() {
						// depsBundle includes the dependencies in the node_modules
						// folder so it has to be loaded after configMain finished
						// loading
						return loader["import"](loader.depsBundle)
						.then(null, handleDevBundleError);
					})
					.then(configResolve, configReject);

				devPromise = configPromise.then(function () {
					setEnvsConfig.call(loader);
					setupLiveReload.call(loader);
					loader._configLoaded = true;

					// If a configuration was passed to startup we'll use that to overwrite
					// what was loaded in stealconfig.js
					// This means we call it twice, but that's ok
					if (config) {
						loader.config(config);
					}

					return loader["import"]("@dev");
				});

				return devPromise.then(function () {
					// if there's a main, get it, otherwise, we are just
					// loading the config.
					if (!loader.main || loader.localLoader) {
						return configPromise;
					}
					if (config.loadMainOnStartup) {
						var main = loader.main;
						if (typeof main === "string") {
							main = [main];
						}
						return Promise.all(
							map(main, function (main) {
								return loader["import"](main);
							})
						);
					} else {
						loader._warnNoMain(steal._mainWarnMs || 2000);
					}
				});
			}
		}).then(function(main){
			if(loader.mainSource) {
				return loader.module(loader.mainSource);
			}

			// load script modules they are tagged as
			// text/steal-module
			loader.loadScriptModules();

			return main;
		});

		return appPromise;
	};
	steal.done = function(){
		return appPromise;
	};

	steal["import"] = function(){
		var names = arguments;
		var loader = this.System;

		function afterConfig(){
			var imports = [];
			each(names, function(name){
				imports.push(loader["import"](name));
			});
			if(imports.length > 1) {
				return Promise.all(imports);
			} else {
				return imports[0];
			}
		}

		if(!configPromise) {
			// In Node a main isn't required, but we still want
			// to call startup() to do autoconfiguration,
			// so setting to empty allows this to work.
			if(!loader.main) {
				loader.main = "@empty";
			}
			steal.startup();
		}

		return configPromise.then(afterConfig);
	};
	steal.setContextual = fBind.call(System.setContextual, System);
	steal.isEnv = fBind.call(System.isEnv, System);
	steal.isPlatform = fBind.call(System.isPlatform, System);
	return steal;

};
	if( isNode && !isNW && !isElectron ) {

		global.steal = makeSteal(System);
		global.steal.System = System;
		global.steal.dev = require("./ext/dev.js");
		steal.clone = cloneSteal;
		module.exports = global.steal;

	} else {
		var oldSteal = global.steal;
		global.steal = makeSteal(System);
		global.steal.startup(oldSteal && typeof oldSteal == 'object' && oldSteal)
			.then(null, logErrors);
		global.steal.clone = cloneSteal;

		function logErrors(error) {
			if(typeof console !== "undefined") {
				// Hide from uglify
				var c = console;

				// if the error contains a logError function, defer to that.
				if(typeof error.logError === "function") {
					error.logError(c);
				} else {
					var type = c.error ? "error" : "log";
					c[type](error);
				}
			}
		}
	}

})(typeof window == "undefined" ? (typeof global === "undefined" ? this : global) : window);

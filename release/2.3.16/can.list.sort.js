/*!
 * CanJS - 2.3.16
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Wed, 17 Feb 2016 00:30:11 GMT
 * Licensed MIT
 */

/*[global-shim-start]*/
(function (exports, global){
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		modules[moduleName] = module && module.exports ? module.exports : result;
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				eval("(function() { " + __load.source + " \n }).call(global);");
			}
		};
	});
})({},window)
/*can@2.3.16#list/sort/sort*/
define('can/list/sort/sort', [
    'can/util/util',
    'can/list/list'
], function (can) {
    var oldBubbleRule = can.List._bubbleRule;
    can.List._bubbleRule = function (eventName, list) {
        var oldBubble = oldBubbleRule.apply(this, arguments);
        if (list.comparator && can.inArray('change', oldBubble) === -1) {
            oldBubble.push('change');
        }
        return oldBubble;
    };
    var proto = can.List.prototype, _changes = proto._changes || function () {
        }, setup = proto.setup, unbind = proto.unbind;
    can.extend(proto, {
        setup: function (instances, options) {
            setup.apply(this, arguments);
            this.bind('change', can.proxy(this._changes, this));
            this._comparatorBound = false;
            this.bind('comparator', can.proxy(this._comparatorUpdated, this));
            delete this._init;
            if (this.comparator) {
                this.sort();
            }
        },
        _comparatorUpdated: function (ev, newValue) {
            if (newValue || newValue === 0) {
                this.sort();
                if (this._bindings > 0 && !this._comparatorBound) {
                    this.bind('change', this._comparatorBound = function () {
                    });
                }
            } else if (this._comparatorBound) {
                unbind.call(this, 'change', this._comparatorBound);
                this._comparatorBound = false;
            }
        },
        unbind: function (ev, handler) {
            var res = unbind.apply(this, arguments);
            if (this._comparatorBound && this._bindings === 1) {
                unbind.call(this, 'change', this._comparatorBound);
                this._comparatorBound = false;
            }
            return res;
        },
        _comparator: function (a, b) {
            var comparator = this.comparator;
            if (comparator && typeof comparator === 'function') {
                return comparator(a, b);
            }
            if (typeof a === 'string' && typeof b === 'string' && ''.localeCompare) {
                return a.localeCompare(b);
            }
            return a === b ? 0 : a < b ? -1 : 1;
        },
        _changes: function (ev, attr, how, newVal, oldVal) {
            var dotIndex = ('' + attr).indexOf('.');
            if (this.comparator && dotIndex !== -1) {
                if (ev.batchNum) {
                    if (ev.batchNum === this._lastProcessedBatchNum) {
                        return;
                    } else {
                        this.sort();
                        this._lastProcessedBatchNum = ev.batchNum;
                        return;
                    }
                }
                var currentIndex = +attr.substr(0, dotIndex);
                var item = this[currentIndex];
                var changedAttr = attr.substr(dotIndex + 1);
                if (typeof item !== 'undefined' && (typeof this.comparator !== 'string' || this.comparator.indexOf(changedAttr) === 0)) {
                    var newIndex = this._getRelativeInsertIndex(item, currentIndex);
                    if (newIndex !== currentIndex) {
                        this._swapItems(currentIndex, newIndex);
                        can.batch.trigger(this, 'length', [this.length]);
                    }
                }
            }
            _changes.apply(this, arguments);
        },
        _getInsertIndex: function (item, lowerBound, upperBound) {
            var insertIndex = 0;
            var a = this._getComparatorValue(item);
            var b, dir, comparedItem, testIndex;
            lowerBound = typeof lowerBound === 'number' ? lowerBound : 0;
            upperBound = typeof upperBound === 'number' ? upperBound : this.length - 1;
            while (lowerBound <= upperBound) {
                testIndex = (lowerBound + upperBound) / 2 | 0;
                comparedItem = this[testIndex];
                b = this._getComparatorValue(comparedItem);
                dir = this._comparator(a, b);
                if (dir < 0) {
                    upperBound = testIndex - 1;
                } else if (dir >= 0) {
                    lowerBound = testIndex + 1;
                    insertIndex = lowerBound;
                }
            }
            return insertIndex;
        },
        _getRelativeInsertIndex: function (item, currentIndex) {
            var naiveInsertIndex = this._getInsertIndex(item);
            var nextItemIndex = currentIndex + 1;
            var a = this._getComparatorValue(item);
            var b;
            if (naiveInsertIndex >= currentIndex) {
                naiveInsertIndex -= 1;
            }
            if (currentIndex < naiveInsertIndex && nextItemIndex < this.length) {
                b = this._getComparatorValue(this[nextItemIndex]);
                if (this._comparator(a, b) === 0) {
                    return currentIndex;
                }
            }
            return naiveInsertIndex;
        },
        _getComparatorValue: function (item, overwrittenComparator) {
            var comparator = typeof overwrittenComparator === 'string' ? overwrittenComparator : this.comparator;
            if (item && comparator && typeof comparator === 'string') {
                item = typeof item[comparator] === 'function' ? item[comparator]() : item.attr(comparator);
            }
            return item;
        },
        _getComparatorValues: function () {
            var self = this;
            var a = [];
            this.each(function (item, index) {
                a.push(self._getComparatorValue(item));
            });
            return a;
        },
        sort: function (comparator, silent) {
            var a, b, c, isSorted;
            var comparatorFn = can.isFunction(comparator) ? comparator : this._comparator;
            for (var i, iMin, j = 0, n = this.length; j < n - 1; j++) {
                iMin = j;
                isSorted = true;
                c = undefined;
                for (i = j + 1; i < n; i++) {
                    a = this._getComparatorValue(this.attr(i), comparator);
                    b = this._getComparatorValue(this.attr(iMin), comparator);
                    if (comparatorFn.call(this, a, b) < 0) {
                        isSorted = false;
                        iMin = i;
                    }
                    if (c && comparatorFn.call(this, a, c) < 0) {
                        isSorted = false;
                    }
                    c = a;
                }
                if (isSorted) {
                    break;
                }
                if (iMin !== j) {
                    this._swapItems(iMin, j, silent);
                }
            }
            if (!silent) {
                can.batch.trigger(this, 'length', [this.length]);
            }
            return this;
        },
        _swapItems: function (oldIndex, newIndex, silent) {
            var temporaryItemReference = this[oldIndex];
            [].splice.call(this, oldIndex, 1);
            [].splice.call(this, newIndex, 0, temporaryItemReference);
            if (!silent) {
                can.batch.trigger(this, 'move', [
                    temporaryItemReference,
                    newIndex,
                    oldIndex
                ]);
            }
        }
    });
    can.each({
        push: 'length',
        unshift: 0
    }, function (where, name) {
        var proto = can.List.prototype, old = proto[name];
        proto[name] = function () {
            if (this.comparator && arguments.length) {
                var args = can.makeArray(arguments);
                var length = args.length;
                var i = 0;
                var newIndex, val;
                while (i < length) {
                    val = can.bubble.set(this, i, this.__type(args[i], i));
                    newIndex = this._getInsertIndex(val);
                    Array.prototype.splice.apply(this, [
                        newIndex,
                        0,
                        val
                    ]);
                    this._triggerChange('' + newIndex, 'add', [val], undefined);
                    i++;
                }
                can.batch.trigger(this, 'reset', [args]);
                return this;
            } else {
                return old.apply(this, arguments);
            }
        };
    });
    (function () {
        var proto = can.List.prototype;
        var oldSplice = proto.splice;
        proto.splice = function (index, howMany) {
            var args = can.makeArray(arguments);
            if (!this.comparator) {
                return oldSplice.apply(this, args);
            }
            oldSplice.call(this, index, howMany);
            args.splice(0, 2);
            proto.push.apply(this, args);
        };
    }());
    return can.Map;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
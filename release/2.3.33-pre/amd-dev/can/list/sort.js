/*!
 * CanJS - 2.3.32
 * http://canjs.com/
 * Copyright (c) 2017 Bitovi
 * Wed, 13 Sep 2017 22:08:47 GMT
 * Licensed MIT
 */

/*can@2.3.32#list/sort/sort*/
define([
    'can/util/library',
    'can/list'
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
        _getComparatorValue: function (item, singleUseComparator) {
            var comparator = singleUseComparator || this.comparator;
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
        sort: function (singleUseComparator) {
            var a, b, c, isSorted;
            var comparatorFn = can.isFunction(singleUseComparator) ? singleUseComparator : this._comparator;
            for (var i, iMin, j = 0, n = this.length; j < n - 1; j++) {
                iMin = j;
                isSorted = true;
                c = undefined;
                for (i = j + 1; i < n; i++) {
                    a = this._getComparatorValue(this.attr(i), singleUseComparator);
                    b = this._getComparatorValue(this.attr(iMin), singleUseComparator);
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
                    this._swapItems(iMin, j);
                }
            }
            can.batch.trigger(this, 'length', [this.length]);
            return this;
        },
        _swapItems: function (oldIndex, newIndex) {
            var temporaryItemReference = this[oldIndex];
            [].splice.call(this, oldIndex, 1);
            [].splice.call(this, newIndex, 0, temporaryItemReference);
            can.batch.trigger(this, 'move', [
                temporaryItemReference,
                newIndex,
                oldIndex
            ]);
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
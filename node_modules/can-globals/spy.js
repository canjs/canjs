'use strict';
function spy(value) {
    var fn;
    var calls = [];

    if (typeof value === 'function') {
        fn = value;
    } else {
        fn = function () {
            return value;
        };
    }

    function wrapper() {
        var args = Array.prototype.slice.call(arguments);
        /* jshint -W040 */
        var ret = fn.apply(this, args);
        calls.push({
            calledWith: args,
            returned: ret
        });
        return ret;
    }

    Object.defineProperties(wrapper, {
        reset: {
            value: function () {
                calls = [];
            }
        },
        callCount: {
            get: function () {
                return calls.length;
            }
        },
        calls: {
            get: function () {
                return calls;
            }
        }
    });

    return wrapper;
}

module.exports = spy;

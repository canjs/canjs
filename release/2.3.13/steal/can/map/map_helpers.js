/*!
 * CanJS - 2.3.13
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Mon, 01 Feb 2016 23:57:40 GMT
 * Licensed MIT
 */

/*can@2.3.13#map/map_helpers*/
steal('can/util', 'can/util/object/isplain', function (can) {
    var mapHelpers = {
        attrParts: function (attr, keepKey) {
            if (keepKey) {
                return [attr];
            }
            return typeof attr === 'object' ? attr : ('' + attr).split('.');
        },
        canMakeObserve: function (obj) {
            return obj && !can.isDeferred(obj) && (can.isArray(obj) || can.isPlainObject(obj));
        },
        serialize: function () {
            var serializeMap = null;
            return function (map, how, where) {
                var cid = can.cid(map), firstSerialize = false;
                if (!serializeMap) {
                    firstSerialize = true;
                    serializeMap = {
                        attr: {},
                        serialize: {}
                    };
                }
                serializeMap[how][cid] = where;
                map.each(function (val, name) {
                    var result, isObservable = can.isMapLike(val), serialized = isObservable && serializeMap[how][can.cid(val)];
                    if (serialized) {
                        result = serialized;
                    } else {
                        if (map['___' + how]) {
                            result = map['___' + how](name, val);
                        } else {
                            result = mapHelpers.getValue(map, name, val, how);
                        }
                    }
                    if (result !== undefined) {
                        where[name] = result;
                    }
                });
                if (firstSerialize) {
                    serializeMap = null;
                }
                return where;
            };
        }(),
        getValue: function (map, name, val, how) {
            if (can.isMapLike(val)) {
                return val[how]();
            } else {
                return val;
            }
        },
        define: null,
        addComputedAttr: function (map, attrName, compute) {
            map._computedAttrs[attrName] = {
                compute: compute,
                count: 0,
                handler: function (ev, newVal, oldVal) {
                    map._triggerChange(attrName, 'set', newVal, oldVal, ev.batchNum);
                }
            };
        },
        addToMap: function addToMap(obj, instance) {
            var teardown;
            if (!madeMap) {
                teardown = teardownMap;
                madeMap = {};
            }
            var hasCid = obj._cid;
            var cid = can.cid(obj);
            if (!madeMap[cid]) {
                madeMap[cid] = {
                    obj: obj,
                    instance: instance,
                    added: !hasCid
                };
            }
            return teardown;
        },
        getMapFromObject: function (obj) {
            return madeMap && madeMap[obj._cid] && madeMap[obj._cid].instance;
        }
    };
    var madeMap = null;
    var teardownMap = function () {
        for (var cid in madeMap) {
            if (madeMap[cid].added) {
                delete madeMap[cid].obj._cid;
            }
        }
        madeMap = null;
    };
    return mapHelpers;
});
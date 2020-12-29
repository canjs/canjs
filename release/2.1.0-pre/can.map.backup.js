/*!
 * CanJS - 2.1.0-pre
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Fri, 02 May 2014 01:43:43 GMT
 * Licensed MIT
 * Includes: can/map/backup
 * Download from: http://canjs.com
 */
(function(can) {
    var flatProps = function(a, cur) {
        var obj = {};
        for (var prop in a) {
            if (typeof a[prop] !== 'object' || a[prop] === null || a[prop] instanceof Date) {
                obj[prop] = a[prop];
            } else {
                obj[prop] = cur.attr(prop);
            }
        }
        return obj;
    };
    can.extend(can.Map.prototype, {

            backup: function() {
                this._backupStore = this._attrs();
                return this;
            },
            isDirty: function(checkAssociations) {
                return this._backupStore && !can.Object.same(this._attrs(), this._backupStore, undefined, undefined, undefined, !! checkAssociations);
            },
            restore: function(restoreAssociations) {
                var props = restoreAssociations ? this._backupStore : flatProps(this._backupStore, this);
                if (this.isDirty(restoreAssociations)) {
                    this._attrs(props, true);
                }
                return this;
            }
        });
    return can.Map;
})(can);
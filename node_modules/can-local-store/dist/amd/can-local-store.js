/*can-local-store@1.0.0#can-local-store*/
define('can-local-store', [
    'require',
    'exports',
    'module',
    'can-reflect',
    'can-memory-store/make-simple-store',
    'can-namespace'
], function (require, exports, module) {
    var canReflect = require('can-reflect');
    var makeSimpleStore = require('can-memory-store/make-simple-store');
    var namespace = require('can-namespace');
    module.exports = namespace.localStore = function localStore(baseConnection) {
        baseConnection.constructor = localStore;
        var behavior = Object.create(makeSimpleStore(baseConnection));
        canReflect.assignMap(behavior, {
            clear: function () {
                localStorage.removeItem(this.name + '/queries');
                localStorage.removeItem(this.name + '/records');
                this._recordsMap = null;
                return Promise.resolve();
            },
            updateQueryDataSync: function (queries) {
                localStorage.setItem(this.name + '/queries', JSON.stringify(queries));
            },
            getQueryDataSync: function () {
                return JSON.parse(localStorage.getItem(this.name + '/queries')) || [];
            },
            getRecord: function (id) {
                if (!this._recordsMap) {
                    this.getAllRecords();
                }
                return this._recordsMap[id];
            },
            getAllRecords: function () {
                if (!this.cacheLocalStorageReads || !this._recordsMap) {
                    var recordsMap = JSON.parse(localStorage.getItem(this.name + '/records')) || {};
                    this._recordsMap = recordsMap;
                }
                var records = [];
                for (var id in this._recordsMap) {
                    records.push(this._recordsMap[id]);
                }
                return records;
            },
            destroyRecords: function (records) {
                if (!this._recordsMap) {
                    this.getAllRecords();
                }
                canReflect.eachIndex(records, function (record) {
                    var id = canReflect.getIdentity(record, this.queryLogic.schema);
                    delete this._recordsMap[id];
                }, this);
                localStorage.setItem(this.name + '/records', JSON.stringify(this._recordsMap));
            },
            updateRecordsSync: function (records) {
                if (!this._recordsMap) {
                    this.getAllRecords();
                }
                records.forEach(function (record) {
                    var id = canReflect.getIdentity(record, this.queryLogic.schema);
                    this._recordsMap[id] = record;
                }, this);
                localStorage.setItem(this.name + '/records', JSON.stringify(this._recordsMap));
            }
        });
        return behavior;
    };
});
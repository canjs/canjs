var defineInstanceKey = require("./define-instance-key");
var defineInstanceKeyEnumerable = require("./define-instance-key-enumerable");
var onInstanceBoundChange = require("./on-instance-bound-change");
var onInstanceBatches = require("./on-instance-patches");

module.exports = function(name, makeType) {
    defineInstanceKey(name, makeType);
    defineInstanceKeyEnumerable(name,makeType);
    onInstanceBoundChange(name, makeType);
    onInstanceBatches(name, makeType);
};

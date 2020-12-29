"use strict";
var deep = require("./deep/deep"),
    list = require("./list/list"),
    map = require("./map/map"),
    mergeDeep = require("./merge-deep/merge-deep"),
    Patcher = require("./patcher/patcher"),
    namespace = require("can-namespace");

var diff = {
    deep: deep,
    list: list,
    map: map,
    mergeDeep: mergeDeep,
    Patcher: Patcher
};

module.exports = namespace.diff = diff;

"use strict";
var deleteKey = require("can-key/delete/delete"),
    get = require("can-key/get/get"),
    replaceWith = require("can-key/replace-with/replace-with"),
    set = require("can-key/set/set"),
    transform = require("can-key/transform/transform"),
    walk = require("can-key/walk/walk"),
    namespace = require("can-namespace");

module.exports = namespace.key = {
    deleteKey: deleteKey,
    get: get,
    replaceWith: replaceWith,
    set: set,
    transform: transform,
    walk: walk
};

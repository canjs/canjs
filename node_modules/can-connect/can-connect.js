"use strict";
var connect = require("./connect");
var base = require("./base/base");
var ns = require("can-namespace");

connect.base = base;

module.exports = ns.connect = connect;

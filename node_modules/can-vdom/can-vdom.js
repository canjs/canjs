"use strict";
var assign = require("can-assign");
var makeWindow = require("./make-window/make-window");

var GLOBAL = require("can-globals/global/global");

var global = GLOBAL();
assign(global, makeWindow(global));

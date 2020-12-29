"use strict";
var namespace = require('can-namespace');
var canDefineStream = require('can-define-stream');
var canStreamKefir = require('can-stream-kefir');

module.exports = namespace.defineStreamKefir = canDefineStream(canStreamKefir);

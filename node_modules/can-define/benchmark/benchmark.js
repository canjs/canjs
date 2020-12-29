"use strict";
var DefineMap = require("can-define/map/");


var TestType = DefineMap.extend({
	a: "any",
	b: "any",
	c: DefineMap,
	k: "any",
	l: DefineMap,
	q: "any",
	r: "any",
	s: "any",
	t: "any",
	u: "any",
	v: "any",
	w: "any",
	x: {}
});

var obj = {
	a: 1,
	b: 2,
	c: {d: 4, e:5 , f: 6, g: 7, h: 8, i: 9, j: 10},
	k: "k",
	l: { m: {n: {o: {p: "P"}}}},
	q: "Q",
	r: "R",
	s: "S",
	t: "T",
	u: "U",
	v: "V",
	w: "W",
	x: {y: "Y", z: "Z"}
};

var now = new Date();
var list = [];
for(var i  = 0; i<  10000; i++) {
	list.push(new TestType(obj));
}

console.log(new Date() - now);

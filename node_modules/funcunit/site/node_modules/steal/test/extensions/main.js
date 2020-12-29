require('extensions/main.less!');
require('extensions/main.css!');
var text = require('extensions/hello.txt!');
var crazy = require('extensions/hello.crazy!');

if(typeof window !== "undefined" && window.QUnit) {
	QUnit.equal(text, 'hello world', "text loaded from the .txt file");
	QUnit.equal(crazy, 'hello crazy', "text loaded from the .crazy file");
	QUnit.equal(document.getElementById("test-element1").clientWidth, 200, "element width set by css");
	QUnit.equal(document.getElementById("test-element2").clientWidth, 200, "element width set by css");

	QUnit.start();
	removeMyself();
} else {
	console.log("width", document.getElementById("test-element1").clientWidth);
	console.log("width", document.getElementById("test-element2").clientWidth);
	console.log("text",text);
	console.log("crazy",crazy);
}

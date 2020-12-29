"format cjs";

require("main.css");

var btn = document.getElementById('test-element');
var links = document.getElementsByTagName('link');

if (typeof window !== "undefined" && window.assert) {

	assert.notEqual(links.length, 2, "not append the same stylesheet again");
	assert.equal(getComputedStyle(btn).backgroundColor, 'rgb(255, 0, 0)', 'css applied');

	done();
}else{
	console.log(getComputedStyle(btn));
}

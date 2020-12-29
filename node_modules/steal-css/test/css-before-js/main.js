"format cjs";

require("main.css");

var btn = document.getElementById('test-element');
var links = document.getElementsByTagName('link');

if (typeof window !== "undefined" && window.assert) {

	assert.equal(links.length, 1, "css file is loaded and appended on the document");
	assert.equal(getComputedStyle(btn).backgroundColor, 'rgb(255, 0, 0)', 'css applied');

	assert.equal(steal.System.cssOptions.timeout, '15', 'css timeout has been defined in config');
	done();
}else{
	console.log(getComputedStyle(btn));
}

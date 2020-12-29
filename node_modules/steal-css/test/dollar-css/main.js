require("./main.css!$css");

var btn = document.querySelector(".btn");
var s = getComputedStyle(btn);

if(typeof window !== "undefined" && window.assert) {
	assert.equal(s.backgroundColor, 'rgb(0, 128, 0)');
	done();
} else {
	console.log(s.backgroundColor);
}

require("./main.css!$css");

var span = document.querySelector(".pt");
var s = getComputedStyle(span);

if (window && window.assert) {
	assert.equal(s.color, "rgb(0, 128, 0)", "should apply styles correctly");
	done();
}
else {
	console.log(s.color);
}

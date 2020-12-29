var poll = require("../helpers").poll;

// IE9 and lower: a document may load up to 31 stylesheets
require("./styles/common1.css");
require("./styles/common2.css");
require("./styles/common3.css");
require("./styles/common4.css");
require("./styles/common5.css");
require("./styles/common6.css");
require("./styles/common7.css");
require("./styles/common8.css");
require("./styles/common9.css");
require("./styles/common10.css");
require("./styles/common11.css");
require("./styles/common12.css");
require("./styles/common13.css");
require("./styles/common14.css");
require("./styles/common15.css");
require("./styles/common16.css");
require("./styles/common17.css");
require("./styles/common18.css");
require("./styles/common19.css");
require("./styles/common20.css");
require("./styles/common21.css");
require("./styles/common22.css");
require("./styles/common23.css");
require("./styles/common24.css");
require("./styles/common25.css");
require("./styles/common26.css");
require("./styles/common27.css");
require("./styles/common28.css");
require("./styles/common29.css");
require("./styles/common30.css");
require("./styles/common31.css");
require("./styles/common32.css");

var yellow = "rgb(255, 255, 0)";

function predicate() {
	var s = getComputedStyle(document.body);
	return s.backgroundColor === yellow;
}

function runAssertions() {
	var s = getComputedStyle(document.body);

	if (window.assert) {
		assert.equal(s.backgroundColor, yellow, "should apply styles correctly");
		done();
	}
	else {
		console.log("backgroundColor: ", s.backgroundColor);
	}
}

poll(predicate)
	.then(runAssertions)
	.catch(runAssertions);

module.exports = function makeIframe(src, assert) {
	var done = assert.async();
	var iframe = document.createElement("iframe");

	window.assert = assert;
	window.done = function() {
		done();
		document.body.removeChild(iframe);
	};

	document.body.appendChild(iframe);
	iframe.src = src;
};

export default can.Control({}, {
	'h2 click': function(el, ev) {
		this.element.toggleClass('collapsed');
	}
});
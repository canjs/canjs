export default can.Control({}, {
	init: function() {
		this.state = new can.Observe({});
		this.element.html(can.view('site/static/templates/socialStats.mustache', this.state, {
			plural: function(word, count) {
				// if we ever get an irregular plural (like 'people') we'll have to special-case.
				return count === 1 ? word : word + 's';
			}
		}));

		Bitovi.OSS.ActivitySummary.findOne().done(can.proxy(function(summary) {
			this.state.attr(summary);
		}, this));
	}
});
import Bitovi from '../bitovi';

can.Control('Bitovi.OSS.CDNChooser', {
	defaults: {
		version: '',
		libraries: [],
		selectedLibrary: '',
		cdn: Bitovi.URL.CDN
	}
}, {
	init: function() {
		this.options = new can.Observe(this.options);

		var self = this;
		Bitovi.OSS.Configuration.findOne().done(function(config) {
			self.options.libraries.attr(config.libraries);
			self.options.attr('version', config.version);
			self.element.find('select').change();
		});

		this.element.html(can.view('docs/static/templates/cdnChooser.mustache', this.options));
	},
	// function adapted from http://stackoverflow.com/questions/11128130/select-text-in-javascript
	selectText: function(element) {
		if (document.body.createTextRange) { // ms
	        var range = document.body.createTextRange();
	        range.moveToElementText(element);
	        range.select();
	    } else if (window.getSelection) { // moz, opera, webkit
	        var selection = window.getSelection();
	        var range = document.createRange();
	        range.selectNodeContents(element);
	        selection.removeAllRanges();
	        selection.addRange(range);
	    }
	},
	'.cdn-link click': function(el, ev) {
		this.selectText(el[0]);
	},
	'select change': function(el, ev) {
		this.options.attr('selectedLibrary', el.val());
	}
});
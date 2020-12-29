can.Control('Bitovi.OSS.DemoFrame', {
	init: function() {
		// Render out the demo container.
		this.element.html(can.view('docs/static/templates/demoFrame.mustache', {demoSrc: '../' + this.element.data('demoSrc')}));

		// Start with the demo tab showing.
		this.showTab('html');

		// When the iframe loads, grab the HTML and JS and fill in the other tabs.
		var self = this;
		$('[data-for=demo] > iframe').load(function() {
			$('[data-for=html] > pre').html(self.prettify(this.contentDocument.getElementById('demo-html').innerHTML));
			$('[data-for=js] > pre').html(self.prettify(this.contentDocument.getElementById('demo-source').innerHTML));
			//prettyPrint();
		});
	},
	'.tab click': function(el, ev) {
		this.showTab(el.data('tab'));
	},
	showTab: function(tabName) {
		$('.tab', this.element).removeClass('active');
		$('.tab-content', this.element).hide();
		$('.tab[data-tab=' + tabName + ']', this.element).addClass('active');
		$('[data-for=' + tabName + ']', this.element).show();
	},
	prettify: function(unescaped) {
		return prettyPrintOne(unescaped.replace(/</g, '&lt;'));
	}
});
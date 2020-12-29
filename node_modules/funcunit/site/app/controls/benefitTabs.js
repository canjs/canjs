export default can.Control({
	/*defaults: {
		tabs: {
			flexible: {
				className: 'flexible',
				title: 'Flexible',
				tagline: 'Works with jQuery, Dojo, Mootools, YUI, and Zepto. Reuse your existing templates.',
				link: 'guides/Why.html#Flexible'
			},
			powerful: {
				className: 'powerful',
				title: 'Powerful',
				tagline: 'Live binding, restful models, observables, declarative events, and memory safety.',
				link: 'guides/Why.html#Powerful'
			},
			fast: {
				className: 'fast',
				title: 'Fast',
				tagline: 'Fast templates, responsive widgets, and you can learn it in a day.',
				link: 'guides/Why.html#Fast'
			}
		}
	}*/
}, {
	init: function() {
		this.active = this.element.find('li.active');
	},
	'li mouseover': function(el, ev) {
		// hide old
		var name = this.active.removeClass('active').data('benefit');
		this.element.find('div.'+name).hide();

		name = el.addClass('active').data('benefit');
		this.element.find('div.'+name).show();
		this.active = el;
	}
});
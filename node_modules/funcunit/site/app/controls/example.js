export default can.Control({

	defaults: {
		state: new can.Map({
			runner: null
		})
	}

}, {
	init: function() {

		if(this.element.length) {
			this.setHeight($(window));

			this.content = this.element.find('.content');
			this.options.state.attr('runner', 'qunit');
		}
	},

	'{state} change': function(o, ev, attr, how, newVal, oldVal) {
		this.started = false;
		this[newVal]();

		prettyPrint();
	},

	'{window} resize': function(el) {
		this.setHeight($(el));
	},

	'li.tab click': function(el, ev) {
		this.element.find('li.tab').removeClass('selected');
		el.addClass('selected');

		this.options.state.attr('runner', el.text().toLowerCase());
	},

	'.runner click': function(el, ev) {
		ev.preventDefault();
		var iframe = this.element.find('.result')[0].contentWindow;

		if(!this.started) {
			if(this.options.state.attr('runner') === 'qunit') {
				iframe.QUnit.start();
			}
			else {
				iframe.jasmine.getEnv().execute();
			}

			this.started = true;
		}
		else {
			//clears the ?init flag which is used to stop the tests from running only on initial page load
			iframe.location = iframe.location.pathname;
		}
	},

	qunit: function() {
		this.content.html(can.view('site/static/templates/example/qunit.mustache', {}));
	},

	jasmine: function() {
		this.content.html(can.view('site/static/templates/example/jasmine.mustache', {}));
	},

	setHeight: function(el) {
		this.element.height(el.height());
	}

});
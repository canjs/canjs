import can from 'can';

can.Mustache.registerHelper('makeHref', function(src) {
	return src().replace(/ /g, '_')
		.replace(/&#46;/g, '.')
		.replace(/&gt;/g, '_gt_')
		.replace(/\*/g, '_star_')
		.replace(/\//g, '|') + '.html';
});

can.Control('Bitovi.OSS.Menu', {
	defaults: {
		emptyText: 'Nothing found...'
	}
}, {
	search: function(regex) {
		this.element.addClass('search-results').find('[data-search]').each(function() {
			var el = $(this),
				searchTerm = el.data('search');

			if(searchTerm && regex.test(searchTerm)) {
				// Show parent search containers
				el.show().parents('.search-container').show()
					// Show all children
					.end().closest('.search-container').find('.search-container').show();
			}
		});

		// Show main headings
		this.element.find('.api > .search-container > [data-search]').show();
	},

	reset: function() {
		this.element.removeClass('search-results').find('.search-container').css('display', '')
			.end().find('[data-search]').css('display', '');
	},

	'.search input keyup': function(el) {
		var value = el.val().replace(/([.?*+^$[\]\\(){}|-])/g);
		if(value.length > 1) {
			this.element.find('.search-container').hide();
			this.search(new RegExp(value, 'gim'));
		} else {
			this.reset();
		}
	}/*,

	'li.active > a click': function(el, ev) {
		ev.preventDefault();
	},

	'li.active click': function(el, ev) {
		el.toggleClass('collapsed');
	}*/
});

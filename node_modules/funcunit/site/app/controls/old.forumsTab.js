Bitovi.OSS.CommunityTab('Bitovi.OSS.ForumsTab', {
	defaults: {
		view: 'docs/static/templates/forumsTab.mustache'
	}
}, {
	init: function() {
		this._super();

		can.Mustache.registerHelper('truncatePost', function(post) {
			var div = $('<div></div>').html(post());
			/* Here's the 'smart' (ish?) way, but that's not how Bithub does it.
			return div[0].childNodes[0].nodeValue || div.children().first().text();
			*/
			return div.text().substr(0, 200);
		});

	},
	'#forumSearch button click': function(el, ev) {
		var terms = $('input[type=search]').val();
		window.location.href = 'https://forum.javascriptmvc.com/#Search/' + terms;
	},
	'#forumSearch input[type=search] keypress': function(el, ev) {
		if(ev.which === 13/* Return */) {
			ev.preventDefault();
			var terms = el.val();
			window.location.href = 'https://forum.javascriptmvc.com/#Search/' + terms;
		}
	}
});
import Bitovi from '../bitovi';

can.Control('Bitovi.OSS.CommunityTabs', {
	defaults: {
		tabControls: {
			'forums': 'ForumsTab',
			'irc': 'IRCTab',
			'plugins': 'PluginsTab',
			'twitter': 'TwitterTab',
			'issues': 'IssuesTab',
			'github': 'GithubTab'
		}
	}
}, {
	init: function() {
		// get data for all six tabs up front
		// this way, it doesn't call for the data every time a tab switches.
		this.state = new can.Observe({});
		var self = this;

		Bitovi.OSS.ForumPost.findAll({limit: 6}).done(function(posts) {
			self.state.attr('forumPosts', posts);
		});
		// Missing counts for forum categories
		Bitovi.OSS.ChatLine.findAll({limit: 30}).done(function(lines) {
			self.state.attr('lines', lines);
		});
		Bitovi.OSS.Plugin.findAll({limit: 6}).done(function(plugins) {
			self.state.attr('plugins', plugins);
		});
		// Missing counts for plugins/apps/articles
		Bitovi.OSS.Tweet.findAll({limit: 3}).done(function(tweets) {
			self.state.attr('tweets', tweets);
		});
		Bitovi.OSS.GithubIssue.findAll({limit: 3}).done(function(issues) {
			self.state.attr('issues', issues);
		});
		Bitovi.OSS.GithubEvent.findAll({limit: 3}).done(function(commits) {
			self.state.attr('commits', commits);
		});
		// Missing follower counts for github

		this.element.html(can.view('docs/static/templates/communityTabs.mustache', {}));
	},
	//'li mouseenter': '_switchTab',
	'li click': function(el, ev) {
		can.route.attr('type', el.prop('class'));
	},
	':type route': function(data) {
		this._switchTab(data.type);
	},
	_switchTab: function(selectedTab) {
		this.element
			.find('li').removeClass('active')
			.filter('.' + selectedTab).addClass('active');
		var tabControl = this.options.tabControls[selectedTab];
		new Bitovi.OSS[tabControl]($('.content > .container'), {state: this.state});
	}
});
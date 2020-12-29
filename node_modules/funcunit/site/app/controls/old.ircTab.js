Bitovi.OSS.CommunityTab('Bitovi.OSS.IRCTab', {
	defaults: {
		view: 'docs/static/templates/ircTab.mustache'
	}
}, {
	init: function() {
		this._super();
		this.scrollToBottom();
	},
	scrollToBottom: function() {
		var chatbox = $('.irc-chat-container', this.element);
		chatbox.scrollTop(chatbox.prop('scrollHeight'));
	},
	'{state} lines': function(ev, newVal, oldVal) {
		// we have to wait until the tempate re-renders
		window.setTimeout(can.proxy(this.scrollToBottom, this), 0);
	}
});
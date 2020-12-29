import Bitovi from '../bitovi';

can.Model('Bitovi.OSS.ForumPost', {
	model: function(data) {
		return {
			actor: data.actor,
			title: data.title,
			body: data.body,

			feed: data.feed,
			link: data.url,
			points: data.upvotes,
			date: new Date(data.origin_ts)
		};
	},
	findAll: {
		url: Bitovi.URL.BITHUB + '?feed=forums&order=origin_ts:desc&limit={limit}',
		dataType: 'json'
	}
}, { });
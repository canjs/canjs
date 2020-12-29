import Bitovi from '../bitovi';

can.Model('Bitovi.OSS.GithubIssue', {
	model: function(data) {
		return {
			actor: data.actor,
			actorID: data._author,
			picture: data.source_data.org.avatar_url,
			title: data.title,
			body: data.body,

			feed: data.feed,
			category: data.category,
			link: data.url,
			points: data.upvotes,
			date: new Date(data.origin_ts)
		};
	},
	findAll: {
		url: Bitovi.URL.BITHUB +  '?category=bug&also=source_data&order=upvotes&limit={limit}',
		dataType: 'json'
	}
}, { });
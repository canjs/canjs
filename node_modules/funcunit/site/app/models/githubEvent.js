import Bitovi from '../bitovi';

can.Model('Bitovi.OSS.GithubEvent', {
	model: function(data) {
		return {
			actor: data.actor,
			actorID: data._author,
			picture: data.source_data.org.avatar_url,
			title: data.title,
			commits: data.source_data.payload.commits ? data.source_data.payload.commits.map(function(el) {
				return {
					hash: el.sha,
					message: el.message
				};
			}) : [],
			feed: data.feed,
			category: data.category,
			link: data.url,
			points: data.points,
			date: new Date(data.origin_ts)
		};
	},
	findAll: {
		url: Bitovi.URL.BITHUB + '?category=code&also=source_data&order=origin_ts:desc&limit={limit}',
		dataType: 'json'
	}
}, { });
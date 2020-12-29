import Bitovi from '../bitovi';

can.Model('Bitovi.OSS.Tweet', {
	model: function(data) {
		return {
			handle: data.actor,
			realName: data.source_data[data.source_data.event === 'follow' ? 'source' : 'user'].name,
			picture: data.source_data[data.source_data.event === 'follow' ? 'source' : 'user'].profile_image_url,
			body: data.title,

			feed: data.feed,
			link: data.url,
			points: data.upvotes,
			date: new Date(data.origin_ts)
		};
	},
	findAll: {
		url: Bitovi.URL.BITHUB + '?feed=twitter&order=origin_ts:desc&limit={limit}',
		dataType: 'json'
	}
}, { });
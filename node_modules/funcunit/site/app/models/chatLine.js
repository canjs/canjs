import Bitovi from '../bitovi';

can.Model('Bitovi.OSS.ChatLine', {
	models: function(list) {
		var models = list.data.map(function(el) {
			return Bitovi.OSS.ChatLine.model(el);
		});

		return new can.Observe.List(models).reverse();
	},
	model: function(data) {
		return {
			actor: data.actor,
			body: data.title,
			feed: data.feed,
			date: new Date(data.origin_ts)
		};
	},
	findAll: {
		url: Bitovi.URL.BITHUB + '?category=chat&order=origin_ts:desc&limit={limit}',
		dataType: 'json'
	}
}, { });


import Bitovi from '../bitovi';

can.Model('Bitovi.OSS.Plugin', {
	model: function(data) {
		// The API's not returning plugins and apps yet, so this may
		// end up being innacurate.
		data.date = new Date(data.origin_ts);
		data.link = data.url;
		data.points = data.upvotes;
		return data;
	},
	findAll: {
		url: Bitovi.URL.BITHUB + '?category=article|app|plugin&order=upvotes:desc&limit={limit}',
		dataType: 'json'
	}
}, { });
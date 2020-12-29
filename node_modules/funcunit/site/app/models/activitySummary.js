import moment from '../lib/moment';
import Bitovi from '../bitovi';

can.Model('Bitovi.OSS.ActivitySummary', {
	summary: null,
	// the configuration is not going to change,
	// and it's pretty much a singleton, so:
	findOne: function() {
		if(Bitovi.OSS.ActivitySummary.summary === null) {
			Bitovi.OSS.ActivitySummary.summary = $.ajax({
				url: Bitovi.URL.BITHUB + 'summary',
				dataType: 'json',
				data: {
					origin_date: moment().subtract('years', 3).format('YYYY-MM-DD:')
				}
			});
		}

		return Bitovi.OSS.ActivitySummary.summary;
	},
	model: function(data) {
		//{"data":{"app":23,"article":30,"plugin":7,"code":1041,"chat":5578,"twitter":1510,"issues_event":247,"github":2547}}
		data = data.data;
		// it's very strange that it's doing this.  Why not forward the data directly and change the template
		return {
			apps: data.app,
			commits: data.code,
			posts: data.posts,
			articles: data.article,
			plugins: data.plugin,
			question: data.question
		};
	}
}, { });
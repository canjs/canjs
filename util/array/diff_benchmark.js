steal(
'steal-benchmark',
'can/util/array/diff.js',
function (Benchmarks, diff) {

	new Benchmarks.suite('diff')
		.on('cycle', function (ev) {
			var benchmark = ev.target;
			console.log('Average runtime:', benchmark.stats.mean * 1000);
		})
		.add({
			name: '10k - same',
			diffLib: diff,
			setup: function () {
				/* jshint ignore:start */
				var oldList = [];
				var newList = [];
				var obj;

				for (var i = 0; i <= 10000; i++) {
					obj = { foo: 'bar-' + i };

					oldList.push(obj);
					newList.push(obj);
				}
				/* jshint ignore:end */
			},
			fn: function () {
				/* jshint ignore:start */
				var patch = this.diffLib(oldList, newList);
				/* jshint ignore:end */
			}
		})
		.add({
			name: '10k - slightly different',
			diffLib: diff,
			setup: function () {
				/* jshint ignore:start */
				var oldList = [];
				var newList = [];
				var obj;

				for (var i = 0; i <= 10000; i++) {
					obj = { foo: 'bar-' + i };

					oldList.push(obj);
					newList.push(obj);
				}

				newList.splice(100, 1);
				newList.splice(501, 1);
				/* jshint ignore:end */
			},
			fn: function () {
				/* jshint ignore:start */
				var patch = this.diffLib(oldList, newList);
				/* jshint ignore:end */
			}
		})
		.add({
			name: '10k - very different',
			diffLib: diff,
			setup: function () {
				/* jshint ignore:start */
				var oldList = [];
				var newList = [];
				var obj;

				for (var i = 0; i <= 10000; i++) {
					obj = { foo: 'bar-' + i };

					oldList.push(obj);

					if (i % 2 !== 0) {
						newList.push(obj);
					}
				}
				/* jshint ignore:end */
			},
			fn: function () {
				/* jshint ignore:start */
				var patch = this.diffLib(oldList, newList);
				/* jshint ignore:end */
			}
		});
});
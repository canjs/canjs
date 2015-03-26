steal('can/util', function (can) {
	can.extend(can, {
		debounce: function (fn, time, context) {
			var timeout;
			return function () {
				var args = arguments;
				clearTimeout(timeout);
				timeout = setTimeout(can.proxy(function () {
					fn.apply(this, args);
				}, context || this), time);
			};
		},
		throttle: function (fn, time, context) {
			var run;
			return function () {
				var args = arguments;
				var ctx = context || this;
				if (!run) {
					run = true;
					setTimeout(function () {
						fn.apply(ctx, args);
						run = false;
					}, time);
				}
			};
		},
		defer: function (fn, context) {
			var args = arguments;
			var ctx = context || this;
			setTimeout(function () {
				fn.apply(ctx, args);
			}, 0);
		}
	});
	return can;
});

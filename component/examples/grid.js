can.Component.extend({
	tag: 'grid',
	viewModel: {
		items: []
	},
	template: '<table><tbody><content></content></tbody></table>',
	events: {
		init: function () {
			this.update();
		},
		'{deferreddata} change': 'update',
		update: function () {
			var deferred = this.scope.attr('deferreddata'),
				scope = this.scope;
			if (can.isDeferred(deferred)) {
				this.element.find('tbody')
					.css('opacity', 0.5);
				deferred.then(function (items) {
					scope.attr('items')
						.attr(items, true);
				});
			} else {
				scope.attr('items')
					.attr(deferred, true);
			}
		},
		'{items} change': function () {
			this.element.find('tbody')
				.css('opacity', 1);
		}
	}
});

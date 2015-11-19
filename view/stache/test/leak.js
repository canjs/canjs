// Found leaks
// - No `<ul>`
// - {{@key}} (not confirmed here)
// - <content /> === {{childMap.value}}
// - User template doesn't have root node (or has whitespace)

steal(
'can/util',
'can/view/stache',
'can/component', 
'can/map/define', function (can) {

	/**
	 * Reusable scope
	 **/

	var makeViewModel = function () {
		return {
			define: {
				showCollection: {
					value: false
				},
				parentMap: {
					value: function () {
						var map = {}; 

						for (var i = 0; i < 1000; i++) {
							map['key-' + i] = 'foo';
						}

						return new can.Map(map);
					}
				},
				parentCollection: {
					value: function () {
						var collection = []; 

						for (var i = 0; i < 1000; i++) {
							collection.push(new can.Map({
								id: i,
								child: {
									id: i + i
								}
							}));
						}

						return new can.List(collection);
					}
				}
			},
			runTest: function () {
				for (var i = 0; i < 6; i++) {
					this.attr('showCollection', 
						! this.attr('showCollection'));
				}
			}
		};
	};

	/**
	 * Leak #1
	 * 
	 * The user content provided to <list-viewer-1> has more than one child
	 * DOM node
	 **/

	can.Component.extend({
		tag: 'list-toggler-1',
		template: can.stache(
			'<button can-click="{runTest}">' + 
				'Leak #1' +
			'</button>' +
			'{{#if showCollection}}' +
				'<list-viewer-1 local-collection="{parentCollection}">\n' + 
					'{{id}}\n' +
				'</list-viewer-1>' + 
			'{{/if}}'),
		viewModel: makeViewModel()
	});

	can.Component.extend({
		tag: 'list-viewer-1',
		template: can.stache(
			'<ul>' + 
				'{{#each localCollection}}' +
					'<li class="leaked">' +
						'<content />' + 
					'</li>' +
				'{{/each}}' +
			'</ul>')
	});


	/**
	 * Leak #2
	 * 
	 * The template of <list-viewer-2> doesn't have a root node
	 **/

	can.Component.extend({
		tag: 'list-toggler-2',
		template: can.stache(
			'<button can-click="{runTest}">' + 
				'Leak #2' +
			'</button>' +
			'{{#if showCollection}}' +
				'<list-viewer-2 local-collection="{parentCollection}"></list-viewer-2>' + 
			'{{/if}}'),
		viewModel: makeViewModel()
	});

	can.Component.extend({
		tag: 'list-viewer-2',
		template: can.stache(
			'{{#each localCollection}}' +
				'<li class="leaked">' +
					'{{id}}' +
				'</li>' +
			'{{/each}}')
	});


	/**
	 * Leak #3
	 * 
	 * {{@key}} is used in a template
	 **/

	can.Component.extend({
		tag: 'list-toggler-3',
		template: can.stache(
			'<button can-click="{runTest}">' + 
				'Leak #3' +
			'</button>' +
			'{{#if showCollection}}' +
				'<list-viewer-3 local-collection="{parentMap}"></list-viewer-3>' + 
			'{{/if}}'),
		viewModel: makeViewModel()
	});

	can.Component.extend({
		tag: 'list-viewer-3',
		template: can.stache(
			'{{#each localCollection}}' +
				'<li class="leaked">' +
					'{{@key}} - {{.}}' +
				'</li>' +
			'{{/each}}')
	});

	var template = can.stache(
		'<list-toggler-1></list-toggler-1>\n' +
		'<list-toggler-2></list-toggler-2>\n' +
		'<list-toggler-3></list-toggler-3>\n');
	var frag = template();
	$(document.body).append(frag);
});

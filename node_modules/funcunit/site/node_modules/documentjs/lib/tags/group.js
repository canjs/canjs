var getParent = require('./helpers/getParent'),
	tnd = require('./helpers/typeNameDescription');
	/**
	 * @function documentjs.tags.group @group
	 * @parent documentjs.tags
	 *
	 * Declares that other tags belong to a group within
	 * the current `docObject`.
	 * 
	 *
	 * @signature `@group name [ORDER] title`
	 * 
	 * 
	 * @param {String} name The unique name of the group.
	 * @param {Number} [order] The placement of this group in the parent's list of children.
	 * @param {String} title The title that should be shown in the sidebar.
	 * 
	 * @body
	 * 
	 * ## Use
	 * 
	 * For example, in `myapp.md`, the following will create a "Guides" grouping:
	 * 
	 * @codestart
	 * @@page MyApp
	 * @@group MyApp.guides 0 Guides
	 * @codeend
	 * 
	 * And in `guides/installing.md`, the following will add an Installing page to the "Guides" grouping:
	 * 
	 * @codestart
	 * @@page Installing
	 * @@parent MyApp.guides
	 * @codeend
	 * 
	 *
	 */
	module.exports = {
		add: function (line, curData, scope, docMap) {
			var m = line.match(/@group[\s+](.*?)([\s+]([\d]+))?[\s+](.*)/),
				currentName = this.name;

			if (m) {
				var name = m[1],
					title = m[4] || m[1],
					order = parseInt(m[3],10) || 0,
					docObject = docMap[name] ?
						docMap[name] :
						docMap[name] = {
							name: name,
							title: title || name,
							type: "group",
							parent: currentName,
							description: '',
							order: order
						};

				return ["scope", docObject]
			} else {
				console.warn("WARN!: did not match @group for ",line);
			}
		}
	};

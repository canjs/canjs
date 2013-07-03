//allows you to backup and restore a observe instance
steal('can/util', 'can/observe', 'can/util/object', function (can) {
	var flatProps = function (a) {
		var obj = {};
		for (var prop in a) {
			if (typeof a[prop] !== 'object' || a[prop] === null || a[prop] instanceof Date) {
				obj[prop] = a[prop]
			}
		}
		return obj;
	};

	can.extend(can.Observe.prototype, {

		/**
		 * @function can.Observe.backup.prototype.backup backup
		 * @plugin can/observe/backup
		 * @parent can.Observe.backup
		 *
		 * @description Save the values of the properties of an Observe.
		 *
		 * @signature `observe.backup()`
		 * @return {can.Observe} The Observe, for chaining.
		 *
		 * `backup` backs up the current state of the properties of an Observe and marks
		 * the Observe as clean. If any of the properties change value, the original
		 * values can be restored with `[can.Observe.prototype.restore]`:
		 *
		 * @codestart
		 * var recipe = new can.Observe({
		 *   title: 'Pancake Mix',
		 *   yields: '3 batches',
		 *   ingredients: [{
		 *     ingredient: 'flour',
		 *     quantity: '6 cups'
		 *   },{
		 *     ingredient: 'baking soda',
		 *     quantity: '1 1/2 teaspoons'
		 *   },{
		 *     ingredient: 'baking powder',
		 *     quantity: '3 teaspoons'
		 *   },{
		 *     ingredient: 'salt',
		 *     quantity: '1 tablespoon'
		 *   },{
		 *     ingredient: 'sugar',
		 *     quantity: '2 tablespoons'
		 *   }]
		 * });
		 * recipe.backup();
		 * 
		 * recipe.attr('title', 'Flapjack Mix');
		 * recipe.title;     // 'Flapjack Mix'
		 * 
		 * recipe.restore();
		 * recipe.title;     // 'Pancake Mix'
		 * @codeend
		 */
		backup : function () {
			this._backupStore = this._attrs();
			return this;
		},

		/**
		 * @function can.Observe.backup.prototype.isDirty isDirty
		 * @plugin can/observe/backup
		 * @parent can.Observe.backup
		 *
		 * @description Check whether an Observe has changed since the last time it was backed up.
		 *
		 * @signature `observe.isDirty([deep])`
		 * @param {bool} [deep=false] whether to check nested Observes
		 * @return {bool} Whether the Observe has changed since the last time it was [can.Observe.prototype.backup backed up].
		 * If the Observe has never been backed up, `isDirty` returns `undefined`.
		 *
		 * `isDirty` checks whether any properties have changed value or whether any properties have
		 * been added or removed since the last time the Observe was backed up. If _deep_ is `true`,
		 * `isDirty` will include nested Observes in its checks.
		 *
		 * @codestart
		 * var recipe = new can.Observe({
		 *   title: 'Pancake Mix',
		 *   yields: '3 batches',
		 *   ingredients: [{
		 *     ingredient: 'flour',
		 *     quantity: '6 cups'
		 *   },{
		 *     ingredient: 'baking soda',
		 *     quantity: '1 1/2 teaspoons'
		 *   },{
		 *     ingredient: 'baking powder',
		 *     quantity: '3 teaspoons'
		 *   },{
		 *     ingredient: 'salt',
		 *     quantity: '1 tablespoon'
		 *   },{
		 *     ingredient: 'sugar',
		 *     quantity: '2 tablespoons'
		 *   }]
		 * });
		 *
		 * recipe.isDirty();     // false
		 * recipe.backup();
		 * 
		 * recipe.attr('title', 'Flapjack Mix');
		 * recipe.isDirty();     // true
		 * recipe.restore();
		 * * recipe.isDirty();   // false
		 *
		 * recipe.attr('ingredients.0.quantity', '7 cups');
		 * recipe.isDirty();     // false
		 * recipe.isDirty(true); // true
		 *
		 * recipe.backup();
		 * recipe.isDirty();     // false
		 * recipe.isDirty(true); // false
		 * @codeend
		 */
		isDirty : function (checkAssociations) {
			return this._backupStore &&
				!can.Object.same(this._attrs(),
					this._backupStore,
					undefined,
					undefined,
					undefined,
					!!checkAssociations);
		},

		/**
		 * @function can.Observe.backup.prototype.restore restore
		 * @plugin can/observe/backup
		 * @parent can.Observe.backup
		 * 
		 * @description Restore saved values of an Observe's properties.
		 *
		 * @signature `observe.restore( [deep] )`
		 * @param {bool} [deep=false] whether to restore properties in nested Observes
		 * @return {can.Observe} The Observe, for chaining.
		 *
		 * `restore` sets the properties of an Observe back to what they were the last time 
		 * [can.Observe.prototype.backup backup] was called. If _deep_ is `true`,
		 * `restore` will also restore the properties of nested Observes.
		 * 
		 * `restore` will not remove properties that were added since the last backup, but it
		 * will re-add properties that have been removed.
		 * 
		 * @codestart
		 * var recipe = new can.Observe({
		 *   title: 'Pancake Mix',
		 *   yields: '3 batches',
		 *   ingredients: [{
		 *     ingredient: 'flour',
		 *     quantity: '6 cups'
		 *   },{
		 *     ingredient: 'baking soda',
		 *     quantity: '1 1/2 teaspoons'
		 *   },{
		 *     ingredient: 'baking powder',
		 *     quantity: '3 teaspoons'
		 *   },{
		 *     ingredient: 'salt',
		 *     quantity: '1 tablespoon'
		 *   },{
		 *     ingredient: 'sugar',
		 *     quantity: '2 tablespoons'
		 *   }]
		 * });
		 *
		 * recipe.backup();
		 * 
		 * recipe.attr('title', 'Flapjack Mix');
		 * recipe.restore();
		 * recipe.attr('title'); // 'Pancake Mix'
		 *
		 * recipe.attr('ingredients.0.quantity', '7 cups');
		 * recipe.restore();
		 * recipe.attr('ingredients.0.quantity'); // '7 cups'
		 * recipe.restore(true);
		 * recipe.attr('ingredients.0.quantity'); // '6 cups'
		 * @codeend
		 * 
		 * ## Events
		 * When `restore` sets values or re-adds properties, the same events will be fired (including
		 * _change_, _add_, and _set_) as if the values of the properties had been set using `[can.Observe.attr attr]`.
		 */
		restore : function (restoreAssociations) {
			var props = restoreAssociations ? this._backupStore : flatProps(this._backupStore)

			if (this.isDirty(restoreAssociations)) {
				this._attrs(props);
			}

			return this;
		}

	})

	return can.Observe;
})



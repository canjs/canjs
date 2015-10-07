steal( 'can/util', function( can ) {
	/**
	 * @description Read and write a component element's viewModel.
	 *
	 * @function can.viewModel
	 * @parent can.util
	 * @signature `can.viewModel(el[, attr[, value]])`
	 * @param {HTMLElement|NodeList} el can.Component element to get viewModel of.
	 * @param {String} [attr] Attribute name to access.
	 * @param {*} [val] Value to write to the viewModel attribute.
	 *
	 * @return {*} If only one argument, returns the viewModel itself. If two
	 * arguments are given, returns the attribute value. If three arguments
	 * are given, returns the element itself after assigning the value (for
	 * chaining).
	 *
	 * @body
	 *
	 * `can.viewModel` can be used to directly access a [can.Component]'s
	 * viewModel. Depending on how it's called, it can be used to get the
	 * entire viewModel object, read a specific property from it, or write a
	 * property. The property read and write features can be seen as a
	 * shorthand for code such as `$("my-thing").viewModel().attr("foo", val);`
	 *
	 * If using jQuery, this function is accessible as a jQuery plugin,
	 * with one fewer argument to the call. For example,
	 * `$("my-element").viewModel("name", "Whatnot");`
	 *
	 */
		// Define the `can.viewModel` function that can be used to retrieve the
		// `viewModel` from the element

	var $ = can.$;

	// If `$` has an `fn` object create the
	// `scope` plugin that returns the scope object.
	if ($.fn) {
		$.fn.scope = $.fn.viewModel = function () {
			// Just use `can.scope` as the base for this function instead
			// of repeating ourselves.
			return can.viewModel.apply(can, [this].concat(can.makeArray(arguments)));
		};
	}
});
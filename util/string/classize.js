steal('./string', function () {
	/**
	 * @function can.classize can.classize
	 * @parent can.util
	 * @plugin can/string/classize
	 *
	 * @description Make a string into a class name.
	 *
	 * @signature `can.classize(str)`
	 *
	 * `can.classize` splits a string by underscores or
	 * dashes and capitalizes each part before joining
	 * them back together. This method is useful for
	 * taking HTML class names and getting the original
	 * Control name from them.
	 *
	 * 
	 *     can.classize('my_control_name'); // 'MyControlName'
	 * 
	 * @param {String} str The string to transform.
	 * @return {String} The string as a class name.
	 */
	can.classize = function (s, join) {
		// this can be moved out ..
		// used for getter setter
		var parts = s.split(can.undHash),
			i = 0;
		for (; i < parts.length; i++) {
			parts[i] = can.capitalize(parts[i]);
		}
		return parts.join(join || '');
	};
});

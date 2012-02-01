steal('./string', function(){
	
/**
 * Like [jQuery.String.camelize|camelize], but the first part is also capitalized
 * @param {String} s
 * @return {String} the classized string
 */
Can.String.classize =  function( s , join) {
	// this can be moved out ..
	// used for getter setter
	var parts = s.split(Can.String._regs.undHash),
		i = 0;
	for (; i < parts.length; i++ ) {
		parts[i] = Can.String.capitalize(parts[i]);
	}

	return parts.join(join || '');
}
	
	
})

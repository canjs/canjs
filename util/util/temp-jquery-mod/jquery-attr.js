var $ = require('can/util/node-list'),
	extend = require('can/util/extend');

var boolHook, attr, removeAttr;

//jquery/src/attributes/attr
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};

attr = function( elem, name, value ) {
	var ret, hooks,
		nType = elem.nodeType;

	// Don't get/set attributes on text, comment and attribute nodes
	if ( nType === 3 || nType === 8 || nType === 2 ) {
		return;
	}

	// Fallback to prop when attributes are not supported
	if ( typeof elem.getAttribute === "undefined" ) {
		return jQuery.prop( elem, name, value );
	}

	// All attributes are lowercase
	// Grab necessary hook if one is defined
	if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
		hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
			( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
	}

	if ( value !== undefined ) {
		if ( value === null ) {
			removeAttr( elem, name );
			return;
		}

		if ( hooks && "set" in hooks &&
			( ret = hooks.set( elem, value, name ) ) !== undefined ) {
			return ret;
		}

		elem.setAttribute( name, value + "" );
		return value;
	}

	if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
		return ret;
	}

	ret = jQuery.find.attr( elem, name );

	// Non-existent attributes return null, we normalize to undefined
	return ret == null ? undefined : ret;
};

removeAttr = function( elem, value ) {
	//jquery/var/rnotwhite
	var rnotwhite = function(){return ( /\S+/g );},
		name,
		i = 0,
		attrNames = value && value.match( rnotwhite );

	if ( attrNames && elem.nodeType === 1 ) {
		while ( ( name = attrNames[ i++ ] ) ) {
			elem.removeAttribute( name );
		}
	}
}

extend($, {
	attr: attr,
	removeAttr: removeAttr
});

module.exports = $;
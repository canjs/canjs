var global = require('can/util/global');
module.exports = function(el) {
	return (el.ownerDocument || el) === global.document;
};

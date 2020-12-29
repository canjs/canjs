// ES6ML puts file: before all addresses.  This removes it.
// For Windows, we might want to make it change to c: or something else.
module.exports = function(address){
	if(address.indexOf("file:") ===0) {
		return address.substr(5);
	}
	return address;
};

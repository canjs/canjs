var notSpecial = "[^@#\\}]";
var onlyMatch = new RegExp("("+notSpecial+"*)(?:@("+notSpecial+"+))?");
var onlyProps = ["name","resource"];
var mergeCWD = {resource: true};
var path = require('path');

module.exports = function(only){
	return only.map(function(only){
		var parts = only.match(onlyMatch);
		var data = {};
		onlyProps.forEach(function(prop, index){
			if(parts[index+1]) {
				if(mergeCWD[prop]) {
					data[prop] = path.join(process.cwd(),parts[index+1]);
				} else {
					data[prop] = parts[index+1];
				}
				
			}
		});
		return data;
	});
};

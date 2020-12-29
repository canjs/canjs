
module.exports = function(exp, str){
	var results = [];
	var res = exp.exec(str);

	while(res) {
		results.push(res);

		res = exp.exec(str);
	}

	exp.lastIndex = 0;

	return results;
};

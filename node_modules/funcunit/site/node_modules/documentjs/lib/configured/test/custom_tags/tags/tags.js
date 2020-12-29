var _ = require("lodash");

module.exports = function(existingTags){
	
	
	return _.extend({},existingTags,{
		returns: existingTags["return"],
		private: existingTags.hide,
		example: {
			add: function(line){
				return {
					lines: []
				};
			},
			addMore: function(line, curData) {
				curData.lines.push(line);
			},
			end: function(curData){
				this.body += "```\n"+
					curData.lines.join("\n").trim()+
					"\n```\n";
			}
		},
		"static": {
			add: function(){}
		}
	});
};

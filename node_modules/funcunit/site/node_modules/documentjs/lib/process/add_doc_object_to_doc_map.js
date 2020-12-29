var _ = require("lodash");

module.exports = function(docObject, docMap, filename, line){
	if (docObject.name) {
		
		// we might be able to allow rewrites. Just change the key in the docMap.
		preventNameRewrites(docObject);
		
		if (docMap[docObject.name]) {
			// merge props
			for (var prop in docObject) {
				// only change if there is a value
				if( docObject[prop] ) {
					docMap[docObject.name][prop] = docObject[prop];
				}
			}
		} else {
			docMap[docObject.name] = docObject;
		}
		if(filename) {
			docObject.src = filename + "";
		} else 
		
		if (line) {
			docObject.line = line;
		}
	} else if(!_.isEmpty( _.omit(docObject,['body','description']) )  && docObject.type !== "hide"){
		console.log("WARNING!!\nNo name for:\n",docObject);
	}
};


var preventNameRewrites = function(docObject){
	var propDescriptor = Object.getOwnPropertyDescriptor(docObject,"name");
	if(propDescriptor && propDescriptor.get && propDescriptor.set) {
		return;
	} else {
		var name = docObject.name;
		Object.defineProperty(docObject,"name",{
			get: function(){
				return name;	
			},
			set: function(val){
				// we might be able to allow rewrites. Just change the key in the docMap.
				if(val !== name) {
					throw new Error({
						message: "Changing name of "+name+" to "+val, 
						docObject: docObject,
						toString: function(){
							return this.message;
						}
					});
				}
				
				
				name = val;
			},
			enumerable: true
		});
		
	}
};

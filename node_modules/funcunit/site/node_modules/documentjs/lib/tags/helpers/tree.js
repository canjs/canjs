var _ = require("lodash");

var matches = {
 "(" : ")",
 "<" : ">",
 "{" : "}",
 "[" : "]"
},
    reverse = {},
    regStr = "";
for(var left in matches){
  regStr += "\\"+left+"\\"+matches[left]
  reverse[matches[left]] = left
}


var makeCounter = function(){
  var counters = {}
  for(var left in matches){
    counters[left] = 0
  }
  
  return {
    add: function(token){
      if(matches[token]){
        counters[token] ++
      } else {
         counters[reverse[token]]--
      }
    },
    allZero: function(){
      for(var left in counters){
        if(counters[left]){
          return false;
        }
      }
      return true;
    }
  }
  
}


function tree(str, tokens, ignore){
	
	var reg = new RegExp("(["+regStr+"])|(\\\\)"+(
		tokens? 
			"|"+tokens :
			"" )
		+(ignore? "|"+ignore : "")	
			
		,"g");
	
	var root = {
		children : []
	},
		stack = [root],
		match,
		currentIndex = 0,
		current = function(){
			return stack[stack.length-1]
		},
		// adds to current's last child
		addToCurrent = function(item){
			var cur = current();
			cur.children.push(item);
		};
		
	reg.lastIndex  = 0;
	
	while(match = reg.exec(str)){
		
		// if we found something like (
		if(match[2]) { // escaping \
			match = reg.exec(str);
			continue;
		}
		// the content from the previous match to this one
		var prev = str.substring(currentIndex, reg.lastIndex - match[0].length ).replace(/\\/g,"");
		
		if(prev){
			addToCurrent({
				start: currentIndex,
				end: currentIndex+prev.length,
				token: prev
			});
		}
		
		if(match[4]) { // ignore matched
			
		} else if(!match[1]) { // not a nested
			var cur = current();

			cur.children.push({
				token: match[0],
				start: currentIndex,
				end: reg.lastIndex
			});

			
		} else if(matches[match[0]]) { // a nested
			var node = {
				token: match[0],
				children: [],
				start: reg.lastIndex - match[0].length
			};
			current().children.push(node);
			stack.push(node);
		} else if( reverse[match[0]] ) {
			// we had something like } with a previous {
			if(current().token === reverse[match[0]]) {
				var top = stack.pop();
				top.end = reg.lastIndex;
			} else {
				// there isn't a matching token
				// so add to current
				addToCurrent({
					start: currentIndex+prev.length,
					end: currentIndex+prev.length+match[0].length,
					token: match[0]
				});
			}
			
		}
		currentIndex = reg.lastIndex;
	}
	var last = str.substring(currentIndex).replace(/\\/g,"");
	if(last){
		root.children.push({
			token: last,
			start: currentIndex,
			end: str.length
		});
	}
	return root.children;

};
tree.matches = matches;
module.exports = tree;
	
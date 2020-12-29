steal('steal',function(s){
	
	
var matches = {
 "(" : ")",
 "<" : ">",
 "{" : "}"
},
    reverse = {},
    regStr = "";
for(var left in matches){
  regStr += "\\"+left+"\\"+matches[left]
  reverse[matches[left]] = left
}
var reg = new RegExp("["+regStr+"]","g")

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


return function matcher(str, lastIndex){
  lastIndex = lastIndex || 0
  reg.lastIndex  = lastIndex;
  var match = reg.exec(str);
  if(!match){
    return str;
  } else if(reg.lastIndex -1 > lastIndex){
    return str.substring(lastIndex, reg.lastIndex -1)
  }
  
  // begin the counting
  var counter = makeCounter();
  counter.add(match[0])
  
  while(!counter.allZero()){
    var match = reg.exec(str)
    if(!match){
      throw "reached end of string without match"
    }
    counter.add(match[0])
  }
  return str.substring(lastIndex, reg.lastIndex)

}
	
	
	
})

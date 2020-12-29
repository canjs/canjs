define("id-1",["a-1", "b-1"], function(){
	
});

define("id-2",["a-2", "b-2"], function(){
	
});

define("id-3",["require", "b-3"], function(rez, b2){
	rez("b-4");
});
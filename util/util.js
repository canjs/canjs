Can = {};
if (window.STEALDOJO){
	steal('can/util/dojo')
} else if( window.STEALMOO) {
	steal('can/util/mootools')
} else if(window.STEALZEPTO){
	steal('can/util/zepto');
} else {
	steal('can/util/jquery')
}





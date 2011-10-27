(function(){
	var isReady,
		stateAfterScript;
		
//we probably have to have this only describing where the tests are
steal('jquery').then(function(){
	$(function(){
			isReady = true;
	})
},'jquery/class/class_test.js',
	  'jquery/controller/controller_test.js',
	  'jquery/dom/compare/compare_test.js',
	  'jquery/dom/cur_styles/cur_styles_test.js',
	  'jquery/dom/dimensions/dimensions_test.js',
	  'jquery/dom/form_params/form_params_test.js',
	  'jquery/dom/route/route_test.js',
	  'jquery/lang/lang_test.js',
	  'jquery/dom/fixture/fixture_test.js',
	  'jquery/event/default/default_test.js',
	  'jquery/event/destroyed/destroyed_test.js',
	  'jquery/event/drag/drag_test.js',
	  'jquery/event/hover/hover_test.js',
	  'jquery/event/key/key_test.js',
	  'jquery/tie/tie_test.js'
	  
	  
	  ).then(	

'jquery/controller/view/test/qunit',
'jquery/model/test/qunit',

'jquery/view/test/qunit',
'jquery/view/ejs/test/qunit'


).then('./integration.js',
	   'jquery/event/default/default_pause_test.js',function(){
	
	stateAfterScript = isReady;
	module('jquery v steal');


	test("jquery isn't ready", function(){
		ok(!stateAfterScript, "jQuery isn't ready yet")
	})
   	
});

})();

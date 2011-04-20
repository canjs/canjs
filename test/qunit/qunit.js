//we probably have to have this only describing where the tests are
steal('//jquery/class/class_test',
	  '//jquery/lang/lang_test',
	  '//jquery/dom/fixture/fixture_test',
	  '//jquery/event/drag/drag_test',
	  '//jquery/event/key/key_test').plugins(	
'jquery/controller/test/qunit',
'jquery/controller/view/test/qunit',

'jquery/dom/compare/test/qunit',
'jquery/dom/cur_styles/test/qunit',
'jquery/dom/dimensions/test/qunit',

'jquery/dom/form_params/test/qunit',
'jquery/event/default/test/qunit',
'jquery/event/destroyed/test/qunit',
'jquery/event/hover/test/qunit',




'jquery/model/test/qunit',

'jquery/view/test/qunit',
	'jquery/view/ejs/test/qunit'
).then('integration')

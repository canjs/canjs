// get observe and all of it's plugins
steal('jquery/lang/observe/setter',
	  'jquery/lang/observe/attributes'
	/*,
	  'jquery/lang/observe/validate',
	  'jquery/lang/observe/convert'*/).then('./model_core')
	  .then('./elements/elements.js')

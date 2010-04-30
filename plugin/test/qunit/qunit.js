//we probably have to have this only describing where the tests are
steal
 .plugins("jquery/plugin")  //load your app
 .plugins('funcunit/qunit', 'steal/test/synthetic')  //load qunit
 .then("plugin_test")
 
if(steal.browser.rhino){
  steal.plugins('funcunit/qunit/env')
}
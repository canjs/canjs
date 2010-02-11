//we probably have to have this only describing where the tests are
steal
 .apps("jquery/plugin")  //load your app
 .plugins('steal/test/qunit', 'steal/test/synthetic')  //load qunit
 .then("plugin_test")
 
if(steal.browser.rhino){
  steal.plugins('steal/test/qunit/env')
}
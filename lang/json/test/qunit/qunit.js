//we probably have to have this only describing where the tests are
steal
 .plugins("jquery/lang/json")  //load your app
 .plugins('funcunit/qunit')  //load qunit
 .then("json_test")
 
if(steal.browser.rhino){
  steal.plugins('funcunit/qunit/env')
}
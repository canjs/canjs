//we probably have to have this only describing where the tests are
steal
 .apps("jquery/lang/json")  //load your app
 .plugins('steal/test/qunit')  //load qunit
 .then("json_test")
 
if(steal.browser.rhino){
  steal.plugins('steal/test/qunit/env')
}
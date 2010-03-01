//we probably have to have this only describing where the tests are
steal
 .plugins("jquery/event/drag/limit")  //load your app
 .plugins('funcunit/qunit')  //load qunit
 .then("limit_test")
 
if(steal.browser.rhino){
  steal.plugins('funcunit/qunit/env')
}
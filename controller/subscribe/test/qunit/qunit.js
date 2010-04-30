//we probably have to have this only describing where the tests are
steal
 .plugins("jquery/controller/subscribe")  //load your app
 .plugins('funcunit/qunit')  //load qunit
 .then("subscribe_test")
 
if(steal.browser.rhino){
  steal.plugins('funcunit/qunit/env')
}
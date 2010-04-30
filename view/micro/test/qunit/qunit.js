//we probably have to have this only describing where the tests are
steal
 .plugins("jquery/view/micro")  //load your app
 .plugins('funcunit/qunit')  //load qunit
 .then("micro_test")
 
if(steal.browser.rhino){
  steal.plugins('funcunit/qunit/env')
}
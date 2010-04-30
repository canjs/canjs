//we probably have to have this only describing where the tests are
steal
 .plugins("jquery/controller",'jquery/controller/subscribe')  //load your app
 .plugins('funcunit/qunit')  //load qunit
 .then("controller_test")
 
if(steal.browser.rhino){
  steal.plugins('funcunit/qunit/env')
}
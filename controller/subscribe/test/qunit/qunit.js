//we probably have to have this only describing where the tests are
steal
 .apps("jquery/controller/subscribe")  //load your app
 .plugins('steal/test/qunit')  //load qunit
 .then("subscribe_test")
 
if(steal.browser.rhino){
  steal.plugins('steal/test/qunit/env')
}
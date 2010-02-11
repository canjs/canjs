//we probably have to have this only describing where the tests are
steal
 .apps("jquery/event/default")  //load your app
 .plugins('steal/test/qunit','jquery/view/micro')  //load qunit
 .then("default_test")
 
if(steal.browser.rhino){
  steal.plugins('steal/test/qunit/env')
}
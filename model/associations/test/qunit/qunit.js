//we probably have to have this only describing where the tests are
steal
 .plugins("jquery/model/associations")  //load your app
 .plugins('steal/test/qunit')  //load qunit
 .then("associations_test")
 
if(steal.browser.rhino){
  steal.plugins('steal/test/qunit/env')
}
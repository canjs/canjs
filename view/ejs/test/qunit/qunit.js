//we probably have to have this only describing where the tests are
steal
 .apps("jquery/view/ejs")  //load your app
 .plugins('steal/test/qunit')  //load qunit
 .then("ejs_test")
 
if(steal.browser.rhino){
  steal.plugins('steal/test/qunit/env')
}
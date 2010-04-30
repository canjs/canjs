//we probably have to have this only describing where the tests are
steal
 .plugins("jquery/view/ejs")  //load your app
 .plugins('funcunit/qunit')  //load qunit
 .then("ejs_test")
 
if(steal.browser.rhino){
  steal.plugins('funcunit/qunit/env')
}
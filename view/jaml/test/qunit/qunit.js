//we probably have to have this only describing where the tests are
steal
 .plugins("jquery/view/jaml")  //load your app
 .plugins('funcunit/qunit')  //load qunit
 .then("jaml_test")
 
if(steal.browser.rhino){
  steal.plugins('funcunit/qunit/env')
}
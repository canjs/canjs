//we probably have to have this only describing where the tests are
include
 .apps("jquery/view/jaml")  //load your app
 .plugins('jmvc/test/qunit')  //load qunit
 .then("jaml_test")
 
if(include.browser.rhino){
  include.plugins('jmvc/test/qunit/env')
}
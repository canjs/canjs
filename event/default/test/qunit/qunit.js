//we probably have to have this only describing where the tests are
include
 .apps("jquery/event/default")  //load your app
 .plugins('jmvc/test/qunit','jquery/view/micro')  //load qunit
 .then("default_test")
 
if(include.browser.rhino){
  include.plugins('jmvc/test/qunit/env')
}
//we probably have to have this only describing where the tests are
include
 .apps("jquery/events/drag",'jmvc/test/synthetic')  //load your app
 .plugins('jmvc/test/qunit' )  //load qunit
 .then("drag_test")
 
if(include.browser.rhino){
  include.plugins('jmvc/test/qunit/env')
}
//we probably have to have this only describing where the tests are
include
 .apps("jquery/plugin")  //load your app
 .plugins('jmvc/test/qunit', 'jmvc/test/synthetic')  //load qunit
 .then("plugin_test")
 
if(include.browser.rhino){
  include.plugins('jmvc/test/qunit/env')
}
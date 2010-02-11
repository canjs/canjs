//we probably have to have this only describing where the tests are
include
 .apps("jquery/view","jquery/view/micro","jquery/view/ejs","jquery/view/jaml")  //load your app
 .plugins('jmvc/test/qunit')  //load qunit
 .then("view_test")
 
if(include.browser.rhino){
  include.plugins('jmvc/test/qunit/env')
}
//we probably have to have this only describing where the tests are
steal
 .apps("jquery/events/drag",'steal/test/synthetic')  //load your app
 .plugins('funcunit/qunit' )  //load qunit
 .then("drag_test")
 
if(steal.browser.rhino){
  steal.plugins('funcunit/qunit/env')
}
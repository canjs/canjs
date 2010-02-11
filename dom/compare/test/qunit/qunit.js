//we probably have to have this only describing where the tests are
include
 .apps("jquery/dom/compare")  //load your app
 .plugins('jmvc/test/qunit')  //load qunit
 .then("compare")
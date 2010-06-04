//we probably have to have this only describing where the tests are
steal
 .plugins("jquery/dom/compare")  //load your app
 .plugins('funcunit/qunit')  //load qunit
 .then("compare_test")
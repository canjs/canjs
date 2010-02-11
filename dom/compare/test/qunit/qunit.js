//we probably have to have this only describing where the tests are
steal
 .apps("jquery/dom/compare")  //load your app
 .plugins('steal/test/qunit')  //load qunit
 .then("compare")
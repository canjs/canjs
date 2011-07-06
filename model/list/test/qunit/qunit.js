//we probably have to have this only describing where the tests are
steal("jquery/model/list")  //load your app
 .then('funcunit/qunit')  //load qunit
 .then("./list_test.js")
 

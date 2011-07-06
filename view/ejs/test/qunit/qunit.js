//we probably have to have this only describing where the tests are
steal("jquery/view/ejs")  //load your app
 .then('funcunit/qunit')  //load qunit
 .then("./ejs_test.js")
 
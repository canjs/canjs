//we probably have to have this only describing where the tests are
steal("jquery/model","jquery/dom/fixture")  //load your app
 .then('funcunit/qunit')  //load qunit
 .then("./model_test.js","./associations_test.js")
 
//we probably have to have this only describing where the tests are
steal
 .plugins("jquery/model")  //load your app
 .plugins('funcunit/qunit')  //load qunit
 .then("model_test").plugins("jquery/model/associations/test/qunit")
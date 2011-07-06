//we probably have to have this only describing where the tests are
steal("jquery/view","jquery/view/micro","jquery/view/ejs","jquery/view/jaml","jquery/view/tmpl")  //load your app
 .then('funcunit/qunit')  //load qunit
 .then("./view_test.js","jquery/view/tmpl/tmpl_test.js")
 
if(steal.browser.rhino){
  steal('funcunit/qunit/rhino')
}
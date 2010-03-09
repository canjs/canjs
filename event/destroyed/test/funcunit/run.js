//load("jquery/event/destroyed/test/funcunit/run.js")


//load global selenium settings, change if you want something different
load('settings/selenium.js')

load('steal/rhino/loader.js');
rhinoLoader(function(){
    steal.plugins('jquery/event/destroyed/test/funcunit');  // load tests
}, true);
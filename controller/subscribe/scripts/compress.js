//js jquery/controller/subscribe/compress.js

load("steal/compress/compress.js")
var compress = new Steal.Compress(['jquery/controller/subscribe/subscribe.html',
                                   'jquery/controller/subscribe']);
compress.init();
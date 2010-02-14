//js jquery/dom/cookie/compress.js

load("steal/compress/compress.js")
var compress = new Steal.Compress(['jquery/dom/cookie/cookie.html',
                                   'jquery/dom/cookie']);
compress.init();
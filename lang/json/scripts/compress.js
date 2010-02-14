//js jquery/lang/json/compress.js

load("steal/compress/compress.js")
var compress = new Steal.Compress(['jquery/lang/json/json.html',
                                   'jquery/lang/json']);
compress.init();
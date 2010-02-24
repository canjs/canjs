//js jquery/model/associations/compress.js

load("steal/compress/compress.js")
var compress = new Steal.Compress(['jquery/model/associations/associations.html',
                                   'jquery/model/associations']);
compress.init();
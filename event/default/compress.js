//js default/compress.js

var compressPage = 'default/default.html';
var outputFolder = 'default';
load("steal/compress/compress.js")
var compress = new Steal.Compress([compressPage, outputFolder]);
compress.init();
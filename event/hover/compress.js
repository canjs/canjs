//js hover/compress.js

var compressPage = 'hover/hover.html';
var outputFolder = 'hover';
load("steal/compress/compress.js")
var compress = new Compress([compressPage, outputFolder]);
compress.init();
//js livehack/compress.js

var compressPage = 'livehack/livehack.html';
var outputFolder = 'livehack';
load("steal/compress/compress.js")
var compress = new Compress([compressPage, outputFolder]);
compress.init();
//js micro/compress.js

var compressPage = 'micro/micro.html';
var outputFolder = 'micro';
load("steal/compress/compress.js")
var compress = new Steal.Compress([compressPage, outputFolder]);
compress.init();
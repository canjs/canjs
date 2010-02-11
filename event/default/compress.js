//js default/compress.js

var compressPage = 'default/default.html';
var outputFolder = 'default';
load("jmvc/compress/compress.js")
var compress = new Steal.Compress([compressPage, outputFolder]);
compress.init();
//js drop/compress.js

var compressPage = 'drop/drop.html';
var outputFolder = 'drop';
load("jmvc/compress/compress.js")
var compress = new Steal.Compress([compressPage, outputFolder]);
compress.init();
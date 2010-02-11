//js mixin/compress.js

var compressPage = 'mixin/mixin.html';
var outputFolder = 'mixin';
load("jmvc/compress/compress.js")
var compress = new Steal.Compress([compressPage, outputFolder]);
compress.init();
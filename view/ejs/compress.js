//js ejs/compress.js

var compressPage = 'ejs/ejs.html';
var outputFolder = 'ejs';
load("jmvc/compress/compress.js")
var compress = new Steal.Compress([compressPage, outputFolder]);
compress.init();
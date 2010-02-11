//js jaml/compress.js

var compressPage = 'jaml/jaml.html';
var outputFolder = 'jaml';
load("steal/compress/compress.js")
var compress = new Steal.Compress([compressPage, outputFolder]);
compress.init();
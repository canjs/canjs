// load('steal/compress/test/run.js')

/**
 * Tests compressing a very basic page and one that is using steal
 */

load('steal/test/helpers.js')
_S.clear();

load('steal/file/file.js');
new steal.File("jquery/view/test/compression/test.ejs").save("<h1>Hello World</h1>");
_S.clear();

load("steal/compress/compress.js")
new steal.Compress(['jquery/view/test/compression/dev.html','jquery/view/test/compression']);
_S.clear();
_S.remove("jquery/view/test/compression/test.ejs")


steal = {env: "production"};

_S.open('jquery/view/test/compression/dev.html')
_S.ok(  /hello world/i.test( $("#content").text() ), "hello world not in page!" );

_S.clear();
_S.remove("jquery/view/test/compression/production.js")

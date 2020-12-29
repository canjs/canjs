var express = require('express');
var fs = require('fs');
var ndjson = require('ndjson');

var app = express();

app.use(express.static(__dirname + '/..'));

app.get('/api/ndjson', function(req, res) {
  var chunks = [];
  var readStream = fs.createReadStream(__dirname + '/todos.ndjson').pipe(ndjson.parse());

  res.writeHead(200, {'Content-Type': 'application/ndjson'});

  readStream.on('data', function(data){
    chunks.push(JSON.stringify(data));
  });

  readStream.on('end', function(){
    var id = setInterval(function(){
      if (chunks.length) {
        res.write(chunks.shift() + '\n');
      } else {
        clearInterval(id);
        res.end();
      }
    }, 500);
  });
  
});

app.get('/api', function(req, res) {
  fs.readFile(__dirname + '/todos.json', "utf8", function(err, data){
    if(err) throw err;
    res.send(data);
  });
  
});

app.listen(8080, function() {
  console.log('Checkout demo on http://localhost:8080/demo/can-connect-ndjson.html');
});

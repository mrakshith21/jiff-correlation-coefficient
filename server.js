var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);

//Serve static files
//Configure App
app.use('/', express.static(__dirname));
app.use('/dist', express.static(path.join(__dirname, '..', '..', 'dist')));
app.use('/lib/ext', express.static(path.join(__dirname, '..', '..', 'lib', 'ext')));

var JIFFServer = require('./lib/jiff-server.js');
new JIFFServer(http, { logs: true });

// Serve static files.
http.listen(8080, function () {
  console.log('Started jiff server on port 8080');
  console.log('Direct your browser to http://localhost:8080/client.html.');

});

// console.log('To run a node.js based party: node demos/sum/party <input>');
console.log();

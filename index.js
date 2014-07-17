var JSONStream = require('JSONStream');
var es = require('event-stream');
var express = require('express');
var fs = require('fs');
var http = require('http');
var request = require('request');
var sse = require('sse-stream');


function locationStream() {
  return fs.createReadStream('data.json') // Stub for Heroku event stream API
    .pipe(JSONStream.parse('events.*.source_ip'))
    .pipe(es.map(function (data, cb) {
      request('http://freegeoip.net/json/' + data, function(err, res, body) {
        if (err) {
          console.log(err);
        }
        else {
          cb(null, body);
        }
      });
    }));
}


var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/locations', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  locationStream().pipe(sse()).pipe(res);
});


var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});

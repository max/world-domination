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
        cb(null, body);
      });
    }));
}

var app = express();

app.get('/locations', function(req, res) {
  var locations = locationStream();
  locations.pipe(sse()).pipe(res);

  locations.on('data', function(data) {
    res.write(data);
  });

  locations.on('end', function(data) {
    res.end();
  });
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});

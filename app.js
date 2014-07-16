var JSONStream = require('JSONStream');
var es = require('event-stream');
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
      })
    }));
}

http.createServer(function(req, res){
  locationStream().pipe(sse()).pipe(res);
}).listen(3000);

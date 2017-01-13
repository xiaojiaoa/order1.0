//////var http = require('http');
//////
//////
//////http.createServer(function ($request, $response) {
//////
//////    $response.writeHead('200', {"Content-Type": 'application/json'});
//////
//////    $response.write('{"name":"fang"}');
//////
//////    $response.end();
//////
//////}).listen('8001');
////
////var express      = require('express');
////var cookieParser = require('cookie-parser');
////
////var app = express();
////app.use(cookieParser());
////
////var url=require('url');
////var qs=require('querystring');//解析参数的库
////
////app.get('/data', function(req, res) {
////    //先从路径中拿参数
////    var arg=url.parse(req.url).query;
////    //把参数转换成键值对，再从中拿值
////    var nameValue=qs.parse(arg)['name'];
////    //打印出来是价值对
////    console.log(qs.parse(arg));
////    //打印出来是值
////    console.log(nameValue);
////
////    res.send('{"name":"fang"}');
////});
////
////app.listen(8088);
//
////var qs = require('qs');
////
////var aaa = {name:"jiahui",age:"18"};
////
////console.log(qs.stringify(aaa));
//
////var redis = require('redis');
////var client = redis.createClient({
////    host: '127.0.0.1',
////    port: 6379
////}); //creates a new client
////
////client.on('connect', function() {
////    console.log('connected');
////});
////
////client.on('error', function (err) {
////    assert(err instanceof Error);
////    assert(err instanceof redis.AbortError);
////    assert(err instanceof redis.AggregateError);
////    assert.strictEqual(err.errors.length, 2); // The set and get got aggregated in here
////    assert.strictEqual(err.code, 'NR_CLOSED');
////});
////
////client.on('end', function (err) {
////    console.log('quited');
////});
////
////
////
////
////client.set('framework', 'AngularJS');
////
////
////client.quit();
//
//var redis = require("redis");
//var sub = redis.createClient(),
//    sub2 = redis.createClient(),
//    pub = redis.createClient();
//var msg_count = 0;
//
//sub.on("message", function (channel, message) {
//    console.log("sub channel " + channel + ": " + message);
//    msg_count += 1;
//    if (msg_count === 3) {
//        sub.unsubscribe();
//        sub2.unsubscribe();
//        sub.quit();
//        sub2.quit();
//        pub.quit();
//    }
//});
//sub2.on("message", function (channel, message) {
//    console.log("sub channel " + channel + ": " + message);
//    msg_count += 1;
//    if (msg_count === 3) {
//        sub.unsubscribe();
//        sub2.unsubscribe();
//        sub.quit();
//        sub2.quit();
//        pub.quit();
//    }
//});
//
//sub.subscribe("dongman");
//sub2.subscribe("a nice channel");
//
//pub.publish("a nice channel", "I am sending my last message.");
//pub.publish("dongman", "I am sending a message.");
//pub.publish("dongman", "I am sending a second message.");
//pub.publish("a nice channel", "I am sending my last message.");
//pub.publish("dongman", "I am sending my last message.");
//
//
//
//
//
//


//function aaa(){
//    return ''||'aaa';
//}
//
//console.log(aaa());


//
//var http = require('http');
//var fs = require('fs');
//
//function upload() {
//    var boundaryKey = '----' + new Date().getTime();
//    var options = {
//        host: '192.2.17.63',
//        port: '8088',
//        method: 'POST',
//        path: '/api/statics/file',//上传服务路径
//        headers: {
//            'Content-Type': 'multipart/form-data; boundary=' + boundaryKey,
//            'Connection': 'keep-alive'
//        }
//    };
//    var req = http.request(options, function (res) {
//        res.setEncoding('utf8');
//        res.on('data', function (chunk) {
//            console.log('body: ' + chunk);
//        });
//        res.on('end', function () {
//            console.log('res end.');
//        });
//    });
//
//
//    req.write(
//        '--' + boundaryKey + '\r\n' +
//        'Content-Disposition: form-data; name="hello" \r\n\r\n' +
//        'value1\r\n'+
//        'Content-Type: application/json\r\n\r\n'
//)
//    ;
//
//    req.write(
//        '--' + boundaryKey + '\r\n' +
//        'Content-Disposition: form-data; name="file"; filename="file.json"\r\n' +
//        'Content-Type: application/x-zip-compressed\r\n\r\n'
//    );
//    //设置1M的缓冲区
//
//
//    var stream = require('stream');
//
//// Initiate the source
//    var bufferStream = new stream.PassThrough();
//
//// Write your buffer
//    bufferStream.end(new Buffer('Test data.'));
//
//// Pipe it to something else  (i.e. stdout)
//
//
//    //var fileStream = fs.createReadStream('./uploads/6202d2fdb7d3553a5e50185374229739', {bufferSize: 1024 * 1024});
//
//    console.log(bufferStream);
//
//    bufferStream.pipe(req, {end: false});
//
//    bufferStream.on('end', function () {
//        req.end('\r\n--' + boundaryKey + '--');
//    });
//}
//
//upload();


//var stream = require('stream');
//var fs = require('fs');
//
//var buffer = new Buffer('foo');
//var bufferStream = new stream.PassThrough();
//bufferStream.end(buffer);
//bufferStream.pipe(process.stdout);

//var bufferStream = new stream.PassThrough();
//
//bufferStream.end(new Buffer('Test data.'));
//
//console.log(bufferStream.pipe(fs.createReadStream()));

//
//'use strict';
//
//var util = require('util');
//var stream = require('stream');
//
//
//console.log(new stream.Readable(new Buffer('Test data.')));
//
//var createReadStream = function (object, options) {
//    return new MultiStream (object, options);
//};
//
//var MultiStream = function (object, options) {
//    if (object instanceof Buffer || typeof object === 'string') {
//        options = options || {};
//        stream.Readable.call(this, {
//            highWaterMark: options.highWaterMark,
//            encoding: options.encoding
//        });
//    } else {
//        stream.Readable.call(this, { objectMode: true });
//    }
//    this._object = object;
//};
//
//util.inherits(MultiStream, stream.Readable);
//
//MultiStream.prototype._read = function () {
//    this.push(this._object);
//    this._object = null;
//};
//
//var aaa = createReadStream(new Buffer('Test data.'));
//
//
//console.log(aaa._read());


var _ = require('lodash');
//
//var aaa = {body: 1, query: 2};
//
//_.each({body: aaa.body, query: aaa.query}, function (value, key) {
//    value = 5;
//})
//
//console.log(aaa);

//var object = {'a': 1, b: {name: 'jiahui', age: '18'}, 'c': 3};
//var object_2 = {'a': 1, 'b': object.b, 'c': object.c};
//
//_.forOwn(object, function(value, key) {
//    console.log(object[key] = 5);
//});

//object.b.name = 5
//object.c = 50

//var util = require('util');
//
//var req = {
//    body: {
//        name: 'Jiahui',
//        age: "118",
//        info: ""
//    },
//    foot: '200',
//    head: '',
//};
//
//console.log(util.inspect(util));
////console.log(req);
//
////_.forOwn(req.body, function (val,key) {
////    console.log(key);
////    console.log();
////})
//

console.log(JSON.parse(""))
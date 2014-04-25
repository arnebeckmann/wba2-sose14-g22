/*
 * WBA 2 
 * Cologne University of applied sciences
 * Group 22: Daniel Röger, Patrick Rüschenberg, Arne Beckmann
 * 
 * Server js-application for PARKLOTSE ONLINE
 * 
 */

/* load required modules
 * 
 * express      able to differ between POST and GET messages, able to handle JSON-objects
 * faye         pub/sub module
 * http
 * mongoskin    connection to the mongoDB
 */
var express = require('express');
var faye = require('faye');
var http = require('http');
var mongoDB = require('mongoskin');
var db = mongoDB.db('mongodb://localhost/mydb?auto_reconnect=true', {
     safe: true
});

db.bind("parkinglots");
var parkinglots = db.parkinglots; 

var app = express();
var server = http.createServer(app);

var adapter = new faye.NodeAdapter({
    mount: '/faye',
    timeout: 45
});

var pubClient = adapter.getClient();

adapter.attach(server);

//beginning of actual server code
app.configure(function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.json());
    app.use(express.urlencoded());
    
    app.use(function(err, req, res, next){
       console.error(err.stack);
       res.end(err.status + '' + err.messages); 
    });
    
    app.post('/position', function(req, res){
        console.log(req.body);
    });
       
});
//end of actual server code

server.listen(80, function(){
    console.log('Server running...'); 
});
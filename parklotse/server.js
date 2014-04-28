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

db.bind("parkingspace");
var parkingspace = db.parkingspace;


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
    
    app.get('/parkingspace', function(req, res){
        parkingspace.findItems(function (error, result) {
            if(error){
                next(error);
            }
            else{
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify(result));
            }
        });
    });
    
    app.get('/parkinglots', function(req, res){
        parkinglots.findItems(function (error, result) {
            //error handling
            if(error){
                next(error);
            }

            //transmit JSON to user if nothing went wrong
            else {
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify(result));
            }

       });       
    });
    
    app.post('/position', function(req, res){
        if (typeof(Number.prototype.toRad) === "undefined") {
            Number.prototype.toRad = function() {
                return this * Math.PI / 180;
            }
        }
        
        lat1 = req.body.lat *1;
        lon1 = req.body.lon *1;

        lat2 = 47.137967*1;
        lon2 = 10.249798*1;

        temp1 = lat2-lat1;
        temp2 = lon2-lon1;


        var R = 6371; // km

        var dLat = temp1.toRad();
        var dLon = temp2.toRad(); 

        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c;

        //Meter
        final = d * 1000;

        console.log(final);
    });
      
});
//end of actual server code
   
server.listen(80, function(){
    console.log('Server running...'); 
});
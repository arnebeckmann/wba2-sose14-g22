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
    
    app.get('/parkinglots/:pid', function(req, res){
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end(req.param("pid"));
        console.log(req.param("pid")); 
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
    
    app.get('/randsensor', function(req, res){
        //Amount of Parkinglots
        var counter;
        var max = new Array();
        parkinglots.findItems(function (error, result){
            result.forEach(function(parkinglots){
                counter++;
                parkingspace.findItems(function(error, result2){
                    var counter2 = 0;
                    var counter3 = 0;
                    result2.forEach(function(parkingspaces){
                        if(parkingspaces.parkplatz_id == parkinglots.id){
                            counter2++;
                            
                            if(parkingspaces.status == "frei"){
                                counter3++;
                            }
                        }    
                    });
                    var rand_plusminus = Math.floor((Math.random() *2));
                    var rand_amount = Math.floor((Math.random() * 5));
                    
                    if(rand_plusminus == 0 && counter3+rand_amount <= counter2){
                        var publication = pubClient.publish('/parkingslots/'+parkinglots.id, {
                            "amount": counter3+rand_amount
                            
                        });                       
                    }else if(rand_plusminus == 1 && counter3-rand_amount >= 0){
                        var amount = counter3-rand_amount;
                        var publication = pubClient.publish('/parkinglots/'+parkinglots.id, {
                            "amount": amount
                            
                        });
                    }                                      
                });
            });
        });
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.end("<html><head><meta http-equiv='refresh' content='5'></head></html> ");        
    });
    
      
});
//end of actual server code
   
server.listen(80, function(){
    console.log('Server running...'); 
});
/*
 * Webbasierte Anwendungen 2
 * Fachhochschule Köln SoSe 2014 | Workshop 3
 * Gruppe 22: Daniel Röger, Patrick Rüschenberg, Arne Beckmann 
 *  
 */

//returns current time in format HH:MM:SS
//required for logging 
function timestamp(){
    var timestamp = new Date();
    
    var hours = timestamp.getHours();
    //ensures that variable hours has two digits
    if(hours <= 9) hours = "0" + hours;
    
    var minutes = timestamp.getMinutes();
    //ensures that variable minutes has two digits
    if(minutes <= 9) minutes = "0" + minutes;
    
    var seconds = timestamp.getSeconds();
    //ensures that variable seconds has two digits
    if(seconds <= 9) seconds = "0" + seconds;
    
    //creates timestring
    var time = hours + ':' + minutes + ':' + seconds;
    
    //returns timestring
    return time;
 }


//load required modules
//express differs between POST and GET messages and is able to handle JSON-objects
var express = require('express');

//pubsub module
var faye = require('faye');
var http = require('http');

var app = express();
var server = http.createServer(app);

var adapter = new faye.NodeAdapter({
    mount: '/faye',
    timeout: 45
});

//attach nodeadapter to http-server
adapter.attach(server);

//mongoskin acts like an wrapper for mongoDB
var mongoDB = require('mongoskin');


//establish connection to the local database by using mongoskin
var db = mongoDB.db('mongodb://localhost/mydb?auto_reconnect=true', {
    safe: true
});

//bind 'planeten'
db.bind("planets");

//make collection available through a variable
var planetsCollection = db.planets;

//create pubClient
var pubClient = adapter.getClient();

app.configure(function(){
    //Defines root folder of the webservice
    app.use(express.static(__dirname + '/public'));

    app.use(express.json());
    app.use(express.urlencoded());
    
    //handles GET messages on the resource 'planeten'
    app.get('/planeten', function (req, res, next){
        //logs the access on the terminal
        console.log(timestamp() + " | received GET /planeten");
        
        //outputs content of database in JSON format
        planetsCollection.findItems(function (error, result) {
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
   
    //handles POST messages on the resource 'planeten'
    app.post('/planeten', function(req, res){
        //publishes new planet to all subscribers via pubSub
        var publication = pubClient.publish('/planets', {
            "name": req.body.name,
            "diameter": req.body.diameter,
            "sun_offset": req.body.sun_offset
        });
        
        //logs planet to the console if publication was successful
        publication.then(function(){
            console.log(timestamp() +' | published "'+ req.body.name +'" to all subscribers');
        },
        function (error){
            next(error)
        });        

        //inserts user generated planet into mongoDB
        planetsCollection.insert(req.body, function (err, planets){
            //logs the new planet on the terminal
            console.log(timestamp() +' | New planet "'+ req.body.name +'" was saved to local database');
        });

        res.end();
    });
    
    //handles errors and gives back error messages to the user
    app.use(function(err, req, res, next){
        console.error(err.stack);
        res.end(err.status + '' + err.messages);
    });
});

//web service will be reachable at localhost:3000 and 127.0.0.1:3000             
server.listen(3000, function(){
    console.log(timestamp() +' | Server started on localhost (127.0.0.1)');
    console.log(timestamp() +' | Server listens on port 3000');
});
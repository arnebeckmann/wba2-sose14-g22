/*
 * Webbasierte Anwendungen 2
 * Fachhochschule Köln SoSe 2014 | Workshop 2
 * Gruppe 22: Daniel Röger, Patrick Rüschenberg, Arne Beckmann 
 *  
 */

//load required modules
//express differs between POST and GET messages and is able to handle JSON-objects
var express = require('express');

var app = express();

app.configure(function(){
    //Defines root folder of the webservice
    app.use(express.static(__dirname + '/public'));

    app.use(express.json());
    app.use(express.urlencoded());
    
    //handles GET messages on the resource 'planeten'
    app.get('/planeten', function (req, res){
        //logs the access on the terminal
        console.log("requested /planeten");
        
        //replies with status code 200 (OK) and displays the arrays planets
        res.writeHead(200, {"Content-Type": "html"});
        res.write("<html><table cellpadding='5' border='1'><tr><th>Name</th><th>Durchmesser</th><th>Abstand zur Sonne</th></tr>");
        planets.forEach(function(i){
            res.write("<tr><td>" + i.name + "</td><td>" + i.diameter + "</td><td>" + i.sun_offset + "</td></tr>");
        });
        
        //hyperlink to the form
        res.write("</table><a href='index.html'>Planeten hinzufuegen</a></html>");
        
        //tells the clients browser that the transmission has finished
        res.end();
    });
    
    //handles POST messages on the resource 'planeten'
    app.post('/planeten', function(req, res){
        //pushes the AJAX-Generated JSON-object to the array 'planets'
        planets.push(req.body);
        //logs the new array line on the terminal
        console.log(req.body);
        res.end();
    });
    
    //handles errors and gives back error messages to the user
    app.use(function(err, req, res, next){
        console.error(err.stack);
        res.end(err.status + '' + err.messages);
    });
});

//JSON array with eight planets
var planets = [
{ "name":"Merkur" , "diameter":"4879", "sun_offset":"58" },
{ "name":"Venus" , "diameter":"12103", "sun_offset":"108" },
{ "name":"Erde" , "diameter":"12734", "sun_offset":"150" },
{ "name":"Mars" , "diameter":"6772", "sun_offset":"228" },
{ "name":"Jupiter" , "diameter":"138346", "sun_offset":"778" },
{ "name":"Saturn" , "diameter":"114632", "sun_offset":"1433" },
{ "name":"Uranus" , "diameter":"50532", "sun_offset":"2872" },
{ "name":"Neptun" , "diameter":"49105", "sun_offset":"4495" }
];

//web service will be reachable at localhost:3000 and 127.0.0.1:3000             
app.listen(3000);
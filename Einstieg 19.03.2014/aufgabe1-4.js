/*
 * Webbasierte Anwendungen 2
 * Fachhochschule Köln SoSe 2014 | Workshop 1 | Aufgabe 1-4
 * Gruppe 22: Daniel Röger, Patrick Rüschenberg, Arne Beckmann 
 *  
 */

// known issues: page needs to be reloaded to display user-generated entries after submitting the form

// Load required modules
// http is required for binding the server to a port
// url is required for catching the URL's path
// querystring is required for POST data evaluation
var http = require("http");
var url = require("url");
var querystring = require("querystring");

// setting up three arrays, one for each column of the table
var planets = new Array("Merkur", "Venus", "Erde", "Mars", "Jupiter", "Saturn", "Uranus", "Neptun");
var diameter = new Array("4879", "12103", "12734", "6772", "138346", "114632", "50532", "49105");
var sun_offset = new Array("58", "108", "150", "228", "778", "1433", "2872", "4495");

var server = http.createServer(function(request, response){
    
    // creates variable with pared path information
    var path = url.parse(request.url).pathname;
    
    // validates if the user tried to reach the correct path using url
    if(path != "/Planeten"){
             // replies with HTTP error code 404 (page not found) if path is != "/Planeten", outputs short human-readable error message
             response.writeHead(404, {"Content-Type": "html"});
             response.write("<b>" + path + "</b> ist keine gueltige Seite");
             
             // script ends if path is not correct
             response.end();
    }
    
    // creates empty variable and fills it with user-generated POST data
    var body = "";
    request.on('data', function(data){
       body = body + data.toString(); 
    });
    
    // adds user-generated POST data to the arrays
    request.on('end', function(){
        var daten = querystring.parse(body);
        
        // if-statement might be *dirty*, no better solution discovered yet
        if(typeof daten.planet == "string"){
            planets[planets.length] = daten.planet;
            diameter[diameter.length] = daten.diameter;
            sun_offset[sun_offset.length] = daten.sun_offset;
        }
    });
    
    // HTML output
    response.writeHead(200, {"Content-Type": "html"});
    response.write("<table cellpadding='5' border='1'><tr><th>Name</th><th>Durchmesser in km</th><th>Abstand zur Sonne<br>(in Millionen km)</th></tr>");

    // for-loop outputs markuped array values
    for (var i = 0; i < planets.length; i++)
        response.write("<tr><td>" + planets[i] + "</td><td>" + diameter[i] + "</td><td>" + sun_offset[i] + "</td></tr>");

    // HTML form, where users can add planets to the arrays
    response.write("<form action='/Planeten' method='POST' /><tr><td><input name='planet' /></td><td><input name='diameter' /></td><td><input name='sun_offset' /></td><td><input type='submit' value='+' /></td></tr></form>");
    response.write("</table>");

    response.end();
});

// binds server to default http port 80
// server will be reachable at http://127.0.0.1/ respectively http://localhost/               
server.listen(80);

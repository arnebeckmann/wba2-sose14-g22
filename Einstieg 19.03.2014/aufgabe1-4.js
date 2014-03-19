var http = require("http");
var url = require("url");
var querystring = require("querystring");

var planets = new Array("Merkur", "Venus", "Erde", "Mars", "Jupiter", "Saturn", "Uranus", "Neptun");
var durchmesser = new Array("4879", "12103", "12734", "6772", "138346", "114632", "50532", "49105");
var distances_Mkm = new Array("58", "108", "150", "228", "778", "1433", "2872", "4495");

var server = http.createServer(function(request, response){
    
    var pfad = url.parse(request.url).pathname;
    
    if(pfad != "/Planeten"){
             response.writeHead(404, {"Content-Type": "html"});
             response.write("<b>" + pfad + "</b> ist keine gueltige Seite");
             response.end();
    }
    
    var body = "";
    request.on('data', function(data){
       body = body + data.toString(); 
    });
    
    request.on('end', function(){
        var daten = querystring.parse(body);
        if(typeof daten.planet == "string"){
            planets[planets.length] = daten.planet;
            durchmesser[durchmesser.length] = daten.durchmesser;
            distances_Mkm[distances_Mkm.length] = daten.abstand;
        }

    });
    
    response.writeHead(200, {"Content-Type": "html"});
    response.write("<table cellpadding='5' border='1'><tr><th>Name</th><th>Durchmesser in km</th><th>Abstand zur Sonne<br>(in Millionen km)</th></tr>");

    for (var i = 0; i < planets.length; i++)
        response.write("<tr><td>" + planets[i] + "</td><td>" + durchmesser[i] + "</td><td>" + distances_Mkm[i] + "</td></tr>");

    response.write("<form action='/Planeten' method='POST' /><tr><td><input name='planet' /></td><td><input name='durchmesser' /></td><td><input name='abstand' /></td><td><input type='submit' value='+' /></td></tr></form>");
    response.write("</table>");

    response.end();
});
                
server.listen(1337);

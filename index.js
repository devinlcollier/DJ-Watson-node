var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var fs = require('fs');
var stream = require("stream");
var http = require("http");
var url = require("url");
var firebase = require("firebase");

firebase.initializeApp({
    apiKey: "AIzaSyBkgb-eRAPS7voRmh9PBUOMKhECeAkdtPQ",
    authDomain: "firstproject-9e6f4.firebaseapp.com",
    databaseURL: "https://firstproject-9e6f4.firebaseio.com",
    projectId: "firstproject-9e6f4",
    storageBucket: "firstproject-9e6f4.appspot.com",
    messagingSenderId: "289921388882"
});

var database = firebase.database();

var text_to_speech = new TextToSpeechV1({
    username: "1105f215-a86f-48aa-8338-c5f1e31a7bde",
    password: "m51sXnXBJxXC"
});

const server = http.createServer(function(req, res) {
    console.log("incoming request");
    console.log(req.url);
    console.log(req);
    if (req.url.includes("/speak?s=")) {
        var param = req.url.substring(req.url.indexOf("/speak?s=") + 9);
        if (param !== "" && param !== null) {
            param = param.replace("_", " ");
            console.log("param " + param);

            var params = {
                text: param,
                voice: "en-US_AllisonVoice",
                accept: "audio/mp3"
            };

            var d = new Date();
            var n = d.getTime();

            const readable = text_to_speech.synthesize(params).on('error', function(error) {
                console.log('Error:', error);
            });

            readable.pipe(fs.createWriteStream(n + ".mp3"));
            var mp3 = "";

            readable.on("data", function(data) {
                mp3 = mp3.concat(data.toString());
            });

            readable.on("end", function(data) {
                console.log(mp3.length);
                database.ref("watson-sings/" + n).set({
                    mp3: mp3
                });

                res.statusCode = 200;
                res.setHeader("Content-type", "text/plain");
                res.end("Success! " + param);
                console.log("end " + param + "\n");
            });
            /*
            res.statusCode = 200;
            res.setHeader("Content-type", "text/plain");
            res.end("Success! " + param);
            console.log("end " + param + "\n");
            */
        }
    } else {
        res.statusCode = 200;
        res.setHeader("Content-type", "text/plain");
        res.end("Hello World!");
        console.log("end\n");
    }
});

const port = 80;

server.listen(port, "127.0.0.1", function() {
    console.log("server started on port " + port);
});
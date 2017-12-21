var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var fs = require('fs');
var http = require("http");
var url = require("url");
//var firebase = require("firebase");
var qs = require("querystring");

/*
Last minute change
firebase is really bad for storing files so I removed firebase code and replaced them with simple file serving code

firebase.initializeApp({
    apiKey: "AIzaSyBkgb-eRAPS7voRmh9PBUOMKhECeAkdtPQ",
    authDomain: "firstproject-9e6f4.firebaseapp.com",
    databaseURL: "https://firstproject-9e6f4.firebaseio.com",
    projectId: "firstproject-9e6f4",
    storageBucket: "firstproject-9e6f4.appspot.com",
    messagingSenderId: "289921388882"
});

var database = firebase.database();
*/
var text_to_speech = new TextToSpeechV1({
    username: "1105f215-a86f-48aa-8338-c5f1e31a7bde",
    password: "m51sXnXBJxXC"
});

/*
array of song names currently on the firebase database. 
At the moment this is non persistant so needs to be updated
*/
var songs = [];

const server = http.createServer(function(req, res) {
    console.log("incoming request");
    console.log(req.url);
    if (req.url.includes("/speak") && req.method === "POST") { //convert lyrics to speech, put mp3 into firebase
        var body = "";
        req.on("data", function(data) {
            body += data;
        });

        req.on("end", function() {
            var post = qs.parse(body);
            console.log(post.song);
            console.log(post.lyrics);
            if (post.song === "" || post.song === null || post.lyrics === "" || post.lyrics === null) {
                res.setHeader("Content-Type", "text/plain");
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                res.writeHead(404);
                res.end("INVALID POST");
            } else {
                if (songs.includes(post.song)) {
                    res.setHeader("Content-Type", "text/plain");
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                    res.writeHead(200);
                    var song_name = post.song.replace(" ", "_");
                    res.end("http://lvh.me/sing/" + song_name + ".mp3");
                } else {
                    songs.push(post.song);
                    var params = {
                        text: post.lyrics,
                        voice: "en-US_AllisonVoice",
                        accept: "audio/mp3"
                    };

                    const readable = text_to_speech.synthesize(params).on('error', function(error) {
                        console.log('Error:', error);
                    });

                    readable.pipe(fs.createWriteStream(post.song.replace(" ", "_") + ".mp3"));

                    var ret_url = "http://lvh.me/sing/" + post.song.replace(" ", "_") + ".mp3";

                    res.setHeader("Content-Type", "text/plain");
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                    res.writeHead(200);
                    res.end(ret_url);
                    console.log("end " + ret_url + "\n");
                    var mp3 = "";

                    /*readable.on("data", function(data) {
                        mp3 = mp3.concat(data.toString("binary"));
                    });

                    readable.on("end", function(data) {
                        console.log(mp3.length);
                        var song_name = post.song.replace(" ", "_");
                        database.ref("watson-sings/" + song_name).set({
                            mp3: mp3
                        });

                        var ret_url = "http://lvh.me/sing/" + song_name + ".mp3";

                        res.setHeader("Content-Type", "text/plain");
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                        res.writeHead(200);
                        res.end(ret_url);
                        console.log("end " + ret_url + "\n");
                    });*/
                }
            }
        });
    } else if (req.url.includes("/sing") && req.url.includes(".mp3")) //return mp3 from firebase
    {
        var song_name = req.url.slice(req.url.indexOf("/sing/") + 6, req.url.indexOf(".mp3"));
        console.log(song_name);

        if (song_name !== null && song_name !== "") {
            fs.exists(song_name + ".mp3", function(exist) {
                if (!exist) {
                    res.setHeader("Content-Type", "text/plain");
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                    res.writeHead(404);
                    res.end("ERROR SONG DOES NOT EXIST");
                } else {
                    fs.readFile(song_name + ".mp3", function(err, data) {
                        if (err) {
                            res.setHeader("Content-Type", "text/plain");
                            res.setHeader('Access-Control-Allow-Origin', '*');
                            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                            res.writeHead(500);
                            res.end("ERROR GETTING FILE");
                        } else {
                            res.setHeader("Content-Type", "audio/mpeg");
                            res.setHeader('Access-Control-Allow-Origin', '*');
                            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                            res.writeHead(200);
                            res.end(data);
                        }
                    });
                }
            });

            /*database.ref("watson-sings/" + song_name).once("value")
                .then(function(dataSnapshot) {
                    var mp3 = dataSnapshot.val().mp3;
                    if (mp3 !== null && mp3 !== "") {
                        console.log(mp3.length);
                        res.setHeader("Content-Type", "audio/mpeg");
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                        res.writeHead(200);
                        res.end(mp3);
                    } else {
                        res.setHeader("Content-Type", "text/plain");
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                        res.writeHead(404);
                        res.end("ERROR SONG DOES NOT EXIST");
                    }

                });*/
        } else {
            res.setHeader("Content-Type", "text/plain");
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.writeHead(404);
            res.end("INVALID SONG NAME");
        }

    } else if (req.url.includes("/speak?s=")) { //obsolete
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

                res.setHeader("Content-Type", "text/plain");
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                res.writeHead(200);
                res.end("Success! " + param);
                console.log("end " + param + "\n");
            });
        }
    } else {
        res.setHeader("Content-Type", "text/plain");
        res.writeHead(404);
        res.end("Not Found! Turn Back!");
        console.log("end\n");
    }
});

const port = 80;

server.listen(port, function() {
    console.log("server started on port " + port);
});
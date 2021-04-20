const app = require('express')();
const http = require('http').createServer(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;
const mongo = require("mongodb").MongoClient;

var express = require("express");
var usernames = [];

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/*", function(req, res){
	res.write("HEY! Bannað..");
	res.end();
});

mongo.connect("mongodb://127.0.0.1/chatserver", {useUnifiedTopology: true}, function(err, db) {

	if(err) throw err;

	const chatDB = db.db("chatserver");

	io.on("connection", (socket) => {

		//Hérna er ég að senda data aftur á clientinn með callback
		socket.on("new user", function(data, callback){
			//Athugu hvort að indexinn sé viðstaddur í arrayinu usernames
			//Með því að nota indexOf, ef það er ekki til þá skilar hann -1
			//Notum þessa aðferð til þess að skoða hvort að usernafnið sé tekið
			if(usernames.indexOf(data) != -1) {
				//Ef hann er til þá skilar hann bara boolean false
				//aftur til callback
				callback(false);
			} else {
				socket.nickname = data;
				usernames.push(socket.nickname);
				updateNicknames();
				console.log(usernames + " Connected to the server");

				//Fer í databaseinn og finn öll stök í messagedb table, sendi það svo á clientinn
				chatDB.collection("messages").find({}).toArray((err, result) => {
					if(err) throw err;
					socket.emit("chat_init", result);
					//console.log(result);
				});

				//annars ef hann er ekki til, þá skilar hann socketinu
				//með data og setur callback bool true
				callback(true);
			}
		});

		socket.on("chat message", (msg) => {
			//set skilaboðin í table í databaseinu
			chatDB.collection("messages").insertOne({user: socket.nickname, message: msg});
			io.emit("chat message",socket.nickname + " skrifaði: " + msg);
		});


		function updateNicknames() {
			io.sockets.emit("usernames", usernames);
		}

	    socket.on("disconnect", function(data) {
		    //Hérna er pælingin að athuga fyrst hvort að notandi hafi
		    //Í raun valið sér eitthvað notenda nafn áður en við eyðum einhverju
		    if(!socket.nickname) return;
		    //Annars eru við að splice'a úr arrayinu userinn
		    usernames.splice(usernames.indexOf(socket.nickname), 1);
		    updateNicknames();
	    });

		socket.on("disconnect", () => {
			console.log("user disconnected");
		});

		socket.on("typing", () => {
			io.emit("typing", socket.nickname);
		});

	});
});

http.listen(port, () => {
  console.log('listening on 3000:');
});
/**
 * Created by jonas on 2015-12-12.
 */

/**
 * Created by jonas on 2015-09-22.
 */

var express = require('express');
var config = require('./config');
var http = require('http');
var path = require('path');

var app = module.exports = express();

app.set('port', config.express.port);

app.use(express.static(path.join(__dirname, '../client/dist')));

var theApp = http.createServer(app);
theApp.listen(app.get('port'));

// routes
app.get('/listServers', function(req, res) {
	var resp = { success: true, servers: [] };
	for (var key in servers) {
		resp.servers.push({ peerId: key, roomId: servers[key].roomId });
	}

	res.end(JSON.stringify(resp));
});

// socket.io
var io = require('socket.io')(theApp);


var servers = {};

io.on('connection', function(socket) {
	console.log('a user connected');

	var myPeerId, myRoomId;

	socket.on('iAmServer', function(data) {

		// server identifying itself
		myPeerId = data.peerId;
		myRoomId = data.roomId;
		servers[myPeerId] = { socket: socket, roomId: myRoomId };
		console.log('server added: ' + myRoomId);
	});

	socket.on('requestGame', function (data) {

		// client requesting game from server
		servers[data.serverPeerId].socket.emit('clientJoining', data.clientPeerId);
		socket.emit('joiningServer', data.serverPeerId);

		console.log('client joined: ' + data.clientPeerId);

	});

	socket.on('disconnect', function() {
		if (myPeerId) {
			delete servers[myPeerId];
		}
	});
});
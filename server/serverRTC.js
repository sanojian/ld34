/**
 * Created by jonas on 2015-12-12.
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
app.get('/getMyIp', function(req, res) {
	res.end(JSON.stringify({ success: true, ip: req.headers['x-forwarded-for'] ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress }));
});
app.get('/listServers', function(req, res) {
	var resp = { success: true, servers: [] };
	for (var key in servers) {
		resp.servers.push({
			peerId: key,
			roomId: servers[key].roomId,
			geo: servers[key].geo,
			players: servers[key].players
		});
	}

	res.end(JSON.stringify(resp));
});

// socket.io
var io = require('socket.io')(theApp);

var servers = {};

io.on('connection', function(socket) {
	console.log('a user connected');

	var myPeerId, myRoomId;
	//var myIp = socket.request.connection.remoteAddress;

	socket.on('iAmServer', function(data) {

		// server identifying itself
		myPeerId = data.peerId;
		myRoomId = data.roomId;

		var options = {
			host: 'ipinfo.io',
			path: '/' + data.ip
		};

		// get geolocation of server
		http.request(options, function(resp) {

			var str = '';

			//another chunk of data has been recieved, so append it to `str`
			resp.on('data', function (chunk) {
				str += chunk;
			});

			//the whole response has been recieved, so we just print it out here
			resp.on('end', function () {
				servers[myPeerId] = { socket: socket, roomId: myRoomId, geo: JSON.parse(str), players: 0 };
				console.log('server added: ' + myRoomId);
			});

		}).end();
	});

	socket.on('playerLeftServer', function (data) {
		servers[data.peerId].players--;
	});

	socket.on('requestGame', function (data) {

		// client requesting game from server
		servers[data.serverPeerId].socket.emit('clientJoining', data.clientPeerId);
		servers[data.serverPeerId].players++;
		socket.emit('joiningServer', data.serverPeerId);

		console.log('client joined: ' + data.clientPeerId);

	});

	socket.on('disconnect', function() {
		if (myPeerId) {
			delete servers[myPeerId];
		}
	});
});
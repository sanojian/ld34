/**
 * Created by jonas on 2015-12-12.
 */

ServerRTC.prototype.startP2P = function() {

	var self = this;

	this.roomId = 'SpaceAmoeba_' + Math.random();

	// Call XirSys ICE servers
	$.ajax({
		type: "POST",
		dataType: "json",
		url: "https://api.xirsys.com/getIceServers",
		data: {
			ident: p2pCreds.ident,
			secret: p2pCreds.secret,
			domain: p2pCreds.domain,
			application: "default",
			room: self.roomId,
			secure: 1
		},
		success: function (data, status) {
			// data.d is where the iceServers object lives
			var customConfig = data.d;
			//console.log(customConfig);
			self.initP2PComm(customConfig);
		},
		async: false
	});
};

ServerRTC.prototype.initP2PComm = function(customConfig) {

	var self = this;

	var peer = new Peer({
		key: p2pCreds.key,
		debug: false,
		config: {
			iceServers: customConfig.iceServers
		}
	});


	peer.on('connection', function(conn) {
		console.log('Connection made with peer');
		console.log(conn);

		var clientId = conn.peer;

		conn.on('open', function() {

			conn.send('hi from the server');
			self.clients[clientId] = { conn: conn, lastBroadCast: 0 };
			self.clientJoined(clientId);
		});

		//conn.on('data', function(data) {
		//	self.handleMessage(data, clientId);
		//});

		conn.on('close', function() {
			console.log('peer data connection closed');
			delete self.clients[clientId];
		});


	});

	peer.on('close', function(id) {
		console.log('peer connection closed');
	});

	peer.on('open', function(id) {
		console.log('My peer ID is: ' + id);
		self.peerId = id;

		// development
		self.gameSocket = io();
		// live
		//self.gameSocket = io.connect('http://swat-fishpoo.rhcloud.com:8000');


		self.gameSocket.emit('iAmServer', { peerId: self.peerId, roomId: self.roomId });

		self.gameSocket.on('clientJoining', function(clientPeerId) {
			console.log('client joined ' + clientPeerId);

			var c = peer.connect(clientPeerId);
			c.on('data', function(data) {
				self.handleMessage(data, clientPeerId);
			});
		});
	});
};

ServerRTC.prototype.clientJoined = function(clientId) {
	// do nothing
};

ServerRTC.prototype.handleMessage = function(message) {

	if (typeof message == 'string') {
		console.log(message);
		return;
	}

};
/**
 * Created by jonas on 2015-12-12.
 */

ServerRTC_Client.prototype.startP2P = function() {

	var self = this;

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
			room: gameRoomId,
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

ServerRTC_Client.prototype.initP2PComm = function(customConfig) {

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

		self.peerConnection = conn;
		conn.on('open', function() {

			conn.send('hi from ' + navigator.userAgent);
		});

		conn.on('close', function() {
			console.log('peer data connection closed');
		});


	});

	peer.on('close', function(id) {
		console.log('peer connection closed');
	});

	peer.on('open', function(id) {
		console.log('My peer ID is: ' + id);
		self.peerId = id;

		var gameSocket = io();

		gameSocket.emit('requestGame', { clientPeerId: self.peerId, serverPeerId: gamePeerId, playerName: self.playerName });

		gameSocket.on('joiningServer', function(serverPeerId) {
			console.log('joining server ' + serverPeerId);

			// dont need socket any more
			gameSocket.disconnect();
			var c = peer.connect(serverPeerId);
			c.on('data', function(data) {
				self.handleMessage(data);
			});

		});

		console.log('waiting for match...');
		gameSocket.emit('requestGame', self.peerId);
	});

};

ServerRTC_Client.prototype.handleMessage = function(message) {
	if (typeof message == 'string') {
		console.log(message);
		return;
	}

	if (message.event == 'message') {
		console.log('new message ' + message.data);
	}


};
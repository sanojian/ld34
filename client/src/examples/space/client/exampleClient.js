/**
 * Created by jonas on 2015-12-12.
 */

var ctx, canvas, client, world = { width: 640, height: 480, planets: [] };

var mouseX, mouseY, gamePeerId, gameRoomId, playerName;

function init() {

	$(document.body).on('click', '.serverItem', function(evt) {
		clearInterval(pollForGames);
		gamePeerId = $(evt.target).attr('data-peerid');
		gameRoomId = $(evt.target).attr('data-roomid');
		playerName = $('#amoebaName').val() || 'unknown amoeba';
		$('div#welcomeBox').remove();
		initGame();
	});

	var pollForGames = setInterval(function() {
		$.getJSON('/listServers', function(data) {
			$('#serverList').html('');
			for (var i=0; i<data.servers.length; i++) {
				$('#serverList').append('<br><a class="serverItem" data-peerid="' + data.servers[i].peerId + '" data-roomid="' + data.servers[i].roomId + '">' +
					data.servers[i].roomId + ' from ' + (data.servers[i].geo.city || '??') + ', ' + (data.servers[i].geo.country || '??') +
					' ' + data.servers[i].players + ' players</a>');
			}

		});
	}, 3000);
}

function initGame() {

	initSteering();

	client = new RpgClient(playerName);
	client.startP2P();

	canvas = document.getElementById('myCanvas');
	ctx = document.getElementById('myCanvas').getContext('2d');

	window.addEventListener('resize', resizeCanvas, false);

	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	resizeCanvas();

	$(document).mousemove(function(event){
		mouseX = event.pageX;
		mouseY = event.pageY;
	});

	$(document).on('touchstart', function(e) {
		mouseX = e.originalEvent.touches[0].pageX;
		mouseY = e.originalEvent.touches[0].pageY;
	});
	$(document).on('touchmove', function(e) {
		mouseX = e.originalEvent.touches[0].pageX;
		mouseY = e.originalEvent.touches[0].pageY;
	});
}


function RpgClient(playerName) {

	ServerRTC_Client.call(this, playerName);

	this.ships = {};
}

RpgClient.prototype = Object.create(ServerRTC_Client.prototype);
RpgClient.prototype.constructor = RpgClient;

RpgClient.prototype.updateShip = function(data) {
	var ship = this.ships[data.clientId] = this.ships[data.clientId] || new Ship();
	ship.position.x = data.position.x;
	ship.position.y = data.position.y;
	ship.velocity.x = data.velocity.x;
	ship.velocity.y = data.velocity.y;
	ship.angle = data.angle;
	ship.playerName = data.playerName || ship.playerName;
	ship.size = data.size;
	if (data.color) {
		ship.color = data.color;
	}
	if (data.clientId !== this.peerId) {
		// update non-client controls
		ship.throttle = data.throttle;
		ship.turn = data.turn;
	}
};

RpgClient.prototype.handleMessage = function(message) {

	if (typeof message == 'string') {
		console.log(message);
		return;
	}

	if (message.event === 'yourid') {
		this.updateShip(message.data);
		requestAnimationFrame(render);
	}
	else if (message.event === 'newclient') {
		this.updateShip(message.data);
		console.log('added new player ' + message.data.playerName);
	}
	else if (message.event === 'position') {
		this.updateShip(message.data);
	}
	else if (message.event === 'shipdeath') {
		client.ships[message.data.clientId].alive = false;
		client.ships[message.data.clientId].size = DEFS.SHIP_SIZE;
		setTimeout(function() {
			client.ships[message.data.clientId].alive = true;
		}, 3000);
		addExplosion(client.ships[message.data.clientId], message.data.position);
	}
	else if (message.event === 'newDot') {
		dots.push(message.data);
	}
	else if (message.event === 'initDots') {
		dots = message.data;
	}
	else if (message.event === 'eatDot') {
		client.ships[message.data.clientId].size++;
		setMood(client.ships[message.data.clientId], 'eating');
		for (var i=0; i<dots.length; i++) {
			if (dots[i].x === message.data.x && dots[i].y === message.data.y) {
				dots.splice(i, 1);
			}
		}
	}
	else if (message.event === 'shot') {
		addBullet(message.data.clientId, message.data.x, message.data.y, client.ships[message.data.clientId].color, message.data.angle, message.data.speed);
	}
	else if (message.event === 'world') {
		world = message.data;
		initPlanets();
		//canvas.width = world.width;
		//canvas.height = world.height;
	}
};

function handleCollision(ship) {
	// handled on server
}
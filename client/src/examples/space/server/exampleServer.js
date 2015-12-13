/**
 * Created by jonas on 2015-12-12.
 */

var server;
var world = { planets: []};
var bullets = [];
var dots = [];
function init() {
	console.log('ho there');

	initWorld();

	server = new RpgServer();

	server.startP2P();

	setInterval(gameLoop, Math.floor(1000/60));
}

function initWorld() {
	world.width = 1600;
	world.height = 1200;

	for (var i=0; i<8; i++) {
		var x = Math.floor(Math.random() * world.width);
		var y = Math.floor(Math.random() * world.height);
		var r = Math.floor(20 + Math.random() * 20);
		var red = Math.floor(55 + Math.random() * 160);
		var green = Math.floor(55 + Math.random() * 160);
		var blue = Math.floor(55 + Math.random() * 160);
		var color = 'rgb(' + red + ',' + green + ',' + blue + ')';
		world.planets.push({ x: x, y: y, r: r, color: color });
	}
}

function gameLoop() {

	updateAll(server.clients);

	// update any ships that have not been updated lately
	var curTime = new Date().getTime();
	for (var key in server.clients) {
		if (curTime - server.clients[key].lastBroadCast > 2000) {
			server.clients[key].lastBroadCast = curTime;
			server.broadCast(makePositionMessage(server.clients[key].ship, key));
		}
	}

	if (dots.length < 100 && Math.random() < 0.01) {
		// make new eatable dot
		var x = Math.floor(Math.random() * world.width);
		var y = Math.floor(Math.random() * world.height);
		server.broadCast({
			event: 'newDot',
			data: {
				x: x,
				y: y
			}
		});
		dots.push({ x: x, y: y });
	}
}

function RpgServer() {

	ServerRTC.call(this);
}

RpgServer.prototype = Object.create(ServerRTC.prototype);
RpgServer.prototype.constructor = RpgServer;

var posX = 100;

RpgServer.prototype.clientJoined = function(clientId) {
	var ship = new Ship();
	resetShip(ship);

	var red = Math.floor(55 + Math.random() * 160);
	var green = Math.floor(55 + Math.random() * 160);
	var blue = Math.floor(55 + Math.random() * 160);
	var color = 'rgb(' + red + ',' + green + ',' + blue + ')';

	ship.color = color;
	this.clients[clientId].ship = ship;


	var data = {
		clientId: clientId,
		color: ship.color,
		position: ship.position,
		angle: ship.angle,
		turn: ship.turn,
		velocity: ship.velocity
	};
	// inform client of self
	this.clients[clientId].conn.send({ event: 'yourid', data: data });

	// inform client of world
	this.clients[clientId].conn.send({ event: 'world', data: world });

	for (var key in this.clients) {
		if (key !== clientId) {
			var oldShip = this.clients[key].ship;
			// inform new client of old clients
			var oldData = {
				clientId: key,
				color: oldShip.color,
				position: oldShip.position,
				angle: oldShip.angle,
				throttle: oldShip.throttle,
				turn: oldShip.turn,
				velocity: oldShip.velocity
			};
			this.clients[clientId].conn.send({ event: 'newclient', data: oldData });
			// inform old client of new client
			this.clients[key].conn.send({ event: 'newclient', data: data });
		}
	}

	// inform client of existing dots
	this.clients[clientId].conn.send({ event: 'initDots', data: dots });

	posX += 60;
};



RpgServer.prototype.broadCast = function(message) {
	for (var key in this.clients) {
		this.clients[key].conn.send(message);
	}
};

RpgServer.prototype.handleMessage = function(message, clientId) {

	if (typeof message == 'string') {
		console.log(message);
		return;
	}

	var ship, newMessage;
	if (message.event == 'controls') {
		ship = this.clients[clientId].ship;
		ship.throttle = message.data.throttle;
		ship.angle = message.data.angle;
		this.clients[clientId].lastBroadCast = new Date().getTime();

		newMessage = makePositionMessage(this.clients[clientId].ship, clientId);
		// update all other clients
		this.broadCast(newMessage);
	}
	if (message.event == 'eatShip') {
		var killerShip = this.clients[clientId].ship;
		var eatenShip = this.clients[message.data].ship;
		killerShip.size +=  eatenShip.size/4;
		handleCollision(eatenShip, message.data);
		newMessage = makePositionMessage(killerShip, clientId);
		// update all other clients
		this.broadCast(newMessage);
	}
	else if (message.event == 'eatDot') {
		ship = this.clients[clientId].ship;
		ship.size++;
		newMessage = {
			event: 'eatDot',
			data: {
				clientId: clientId,
				x: message.data.x,
				y: message.data.y
			}
		};
		for (var i=0; i<dots.length; i++) {
			if (dots[i].x === message.data.x && dots[i].y === message.data.y) {
				dots.splice(i, 1);
				break;
			}
		}
		// update all other clients
		this.broadCast(newMessage);
	}
	else if (message.event == 'shoot') {
		ship = this.clients[clientId].ship;

		bullets.push({
			x: ship.position.x,
			y: ship.position.y,
			angle: ship.angle,
			speed: 10,
			age: 0,
			color: ship.color,
			clientId: clientId
		});

		var shootMessage = {
			event: 'shot',
			data: {
				clientId: clientId,
				x: ship.position.x,
				y: ship.position.y,
				angle: ship.angle,
				speed: 10
			}
		};
		this.broadCast(shootMessage);
	}
};

function makePositionMessage(ship, clientId) {
	var newMessage = {
		event: 'position',
		data: {
			clientId: clientId,
			position: ship.position,
			velocity: ship.velocity,
			throttle: ship.throttle,
			size: ship.size,
			angle: ship.angle,
			turn: ship.turn
		}
	};

	return newMessage;
}

function handleCollision(ship, clientId) {
	server.broadCast({ event: 'shipdeath', data: { position: ship.position, clientId: clientId }});
	ship.velocity.x = 0;
	ship.velocity.y = 0;
	ship.alive = false;
	var newMessage = makePositionMessage(ship, clientId);
	server.broadCast(newMessage);

	setTimeout(function() {
		resetShip(ship);
	}, 3000);
}

function resetShip(ship) {
	ship.position.x = Math.floor(Math.random()*world.width);
	ship.position.y = Math.floor(Math.random()*world.height);
	ship.size = DEFS.SHIP_SIZE;
	ship.alive = true;

}
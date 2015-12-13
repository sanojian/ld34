/**
 * Created by jonas on 2015-12-12.
 */

var tempPoint = new Vec(0, 0);
function drawClient(ship) {

	function getRotated(x, y, angle) {
		tempPoint.x = x;
		tempPoint.y = y;
		tempPoint.rotate(angle);
	}

	var myShip = client.ships[client.peerId];

	var sx = ship.position.x - myShip.position.x + canvas.width/2;
	var sy = ship.position.y - myShip.position.y + canvas.height/2;

	ctx.fillStyle = ship.color;
	ctx.beginPath();
	//ctx.strokeStyle = '#999';
	//ctx.lineWidth = 1;
	ctx.arc(sx, sy, ship.size, 0, 2 * Math.PI, false);
	ctx.fill();
	//ctx.stroke();
	ctx.closePath();

	// show throttle
	//ctx.beginPath();
	//ctx.arc(sx + Math.cos(ship.angle)*(ship.size/2 + ship.throttle*ship.size/2), sy + Math.sin(ship.angle)*(ship.size/2 + ship.throttle*ship.size/2), ship.size/2, 0, 2 * Math.PI, false);
	//ctx.fill();
	//ctx.closePath();
	//ctx.beginPath();
	//ctx.arc(sx + Math.cos(ship.angle)*(ship.size/2 + ship.throttle*ship.size/2), sy + Math.sin(ship.angle)*(ship.size/2 + ship.throttle*ship.size/2), ship.size/2, 0, 2 * Math.PI, false);
	//ctx.fill();
	//ctx.closePath();

	// eyeball
	ctx.beginPath();
	ctx.fillStyle = '#eee';
	ctx.arc(sx + Math.cos(ship.angle)*ship.size/3, sy + Math.sin(ship.angle)*ship.size/3, ship.size/2, 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.fillStyle = '#222';
	ctx.arc(sx + Math.cos(ship.angle)*(ship.size/3+ship.size/6), sy + Math.sin(ship.angle)*(ship.size/3+ship.size/6), ship.size/4, 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.closePath();

	if (ship.throttle && ship.frame % 10 === 0) {
		addParticle(ship.position.x, ship.position.y, ship.color, 2, 0, 0);
	}

	ship.frame++;
}

function drawWorld() {

	// clear rect
	ctx.fillStyle = '#1B2632';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	var myShip = client.ships[client.peerId];

	for (var i=0; i<world.planets.length; i++) {
		// planet
		var px = world.planets[i].x - myShip.position.x + canvas.width/2;
		var py = world.planets[i].y - myShip.position.y + canvas.height/2;
		ctx.beginPath();
		ctx.fillStyle = world.planets[i].color;
		ctx.arc(px, py, world.planets[i].r, 0, 2 * Math.PI, false);
		ctx.fill();

	}

}

var frame = 0;
function render() {

	var myShip = client.ships[client.peerId];
	var curTime = new Date().getTime();

	var dx = mouseX - canvas.width/2;
	var dy = mouseY - canvas.height/2;

	var angle = Math.atan2(dy, dx);
	myShip.angle = angle;

	var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
	var mag = Math.min(1, dist / Math.min(canvas.width/2, canvas.height/2));

	if (mag < 0.1) {
		myShip.throttle = 0;
	}
	else if (mag > 0.9) {
		myShip.throttle = 1;
	}
	else {
		myShip.throttle = mag;
	}

	if (frame % 25 === 0) {
		client.peerConnection.send({ event: 'controls', data: { throttle: myShip.throttle, angle: myShip.angle }});
	}

	updateAll(client.ships);

	drawWorld();

	drawDots();

	showParticles();

	for (var key in client.ships) {
		if (client.ships[key].alive) {
			var ship = client.ships[key];
			drawClient(ship);
			if (key !== client.peerId && ship.size < myShip.size) {
				dx = ship.position.x - myShip.position.x;
				dy = ship.position.y - myShip.position.y;
				dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
				if (dist < myShip.size) {
					client.peerConnection.send({ event: 'eatShip', data: key });
					ship.alive = 0;
				}
			}
		}
	}

	drawBullets();

	requestAnimationFrame(render);
}

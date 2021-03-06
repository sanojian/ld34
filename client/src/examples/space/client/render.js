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
	ctx.arc(sx, sy, ship.size, 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.closePath();

	// arms
	for (var i=0; i<6; i++) {
		ctx.beginPath();
		var ax = sx + Math.cos(Math.PI/12 + i*Math.PI/3) * 3*ship.size/4;
		var ay = sy + Math.sin(Math.PI/12 + i*Math.PI/3) * 3*ship.size/4;
		ctx.arc(ax + Math.cos(ship.angle) * ship.throttle * ship.size/3, ay + Math.sin(ship.angle) * ship.throttle * ship.size/3, ship.size / 3, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.closePath();
	}

	// mouth
	var mx, my;
	if (ship.mood === 'eating') {
		if (ship.moodTimer > 14) {
			ctx.beginPath();
			ctx.fillStyle = '#222';
			mx = sx + Math.cos(ship.angle)*ship.size/-2;
			my = sy + Math.sin(ship.angle)*ship.size/-2;
			ctx.arc(mx, my, ship.size/4, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.closePath();
		}
		else {
			ctx.beginPath();
			ctx.strokeStyle = '#222';
			ctx.lineWidth = ship.size/10;
			mx = sx + Math.cos(ship.angle)*ship.size/-3;
			my = sy + Math.sin(ship.angle)*ship.size/-3;
			ctx.moveTo(mx, my);
			ctx.lineTo(mx + Math.cos(ship.angle)*ship.size/-3, my + Math.sin(ship.angle)*ship.size/-3);
			ctx.stroke();
			ctx.closePath();
		}
		ship.moodTimer--;
		if (ship.moodTimer <= 0) {
			ship.mood = null;
		}
	}
	else {
		// smile
		ctx.beginPath();
		ctx.fillStyle = '#222';
		mx = sx + Math.cos(ship.angle)*ship.size/-2;
		my = sy + Math.sin(ship.angle)*ship.size/-2;
		ctx.arc(mx, my, ship.size/4, ship.angle, ship.angle+Math.PI, false);
		ctx.fill();
		ctx.closePath();
		// tooth
		ctx.beginPath();
		ctx.strokeStyle = '#eee';
		ctx.lineWidth = ship.size/10;
		ctx.moveTo(mx, my);
		ctx.lineTo(mx, my + Math.sin(ship.angle + Math.PI/2)*ship.size/8);
		ctx.stroke();
		ctx.closePath();
	}

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
	//ctx.fillStyle = '#1B2632';
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	var myShip = client.ships[client.peerId];

	for (var i=0; i<world.planets.length; i++) {
		// planet
		var planet = world.planets[i];
		var px = planet.x - myShip.position.x + canvas.width/2;
		var py = planet.y - myShip.position.y + canvas.height/2;
		ctx.beginPath();
		ctx.fillStyle = planet.color;
		ctx.arc(px, py, planet.r, 0, 2 * Math.PI, false);
		ctx.fill();

		// spin effects
		/*ctx.globalCompositeOperation = 'source-atop';
		for (var j=0; j<planet.effect.lines.length; j++) {
			var line = planet.effect.lines[j];
			ctx.beginPath();
			ctx.strokeStyle = '#eee';
			ctx.lineWidth = line.width;
			ctx.moveTo(px - planet.r + line.x + planet.effect.dist, py + line.y);
			ctx.lineTo(px + line.x + line.length + planet.effect.dist, py + line.y);
			ctx.stroke();
		}
		planet.effect.dist += planet.effect.spin;
		if (Math.ceil(planet.effect.dist) % planet.r*2 === 0) {
			planet.effect.dist = 0;
		}

		/// reset composite mode to default
		ctx.globalCompositeOperation = 'source-over';*/

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

	var leaderboard = [];
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
					setMood(myShip, 'eating');
				}
			}

			if (frame % 61 === 0) {
				leaderboard.push({ playerName: ship.playerName, size: ship.size });
			}
		}
	}
	if (frame % 61 === 0) {
		leaderboard.sort(function(a, b) {
			return b.size - a.size;
		});
		var leaderHtml = '<u>LeaderBoard</u><br><b>';
		for (var i=0; i<leaderboard.length; i++) {
			leaderHtml += leaderboard[i].playerName + '<br>';
		}
		$('#leaderBoard').html(leaderHtml + '</b>');
	}

	drawBullets();

	requestAnimationFrame(render);
}

/**
 * Created by jonas on 2015-12-12.
 */

var particles = [];

function showParticles() {
	var myShip = client.ships[client.peerId];

	for (var i=0; i<particles.length; i++) {

		particles[i].x += particles[i].speed * Math.cos(particles[i].angle);
		particles[i].y += particles[i].speed * Math.sin(particles[i].angle);

		var px = particles[i].x - myShip.position.x + canvas.width/2;
		var py = particles[i].y - myShip.position.y + canvas.height/2;
		ctx.beginPath();
		ctx.lineWidth = particles[i].size;
		ctx.strokeStyle = particles[i].color;
		ctx.moveTo(px - particles[i].size/2, py - particles[i].size/2);
		ctx.lineTo(px + particles[i].size/2, py + particles[i].size/2);
		ctx.stroke();

		particles[i].age++;
		if (particles[i].age > 60) {
			particles.splice(i, 1);
			i--;
		}
	}
}

function addExplosion(ship, position) {
	var num = 4 + Math.ceil(Math.random() * 4);
	for (var i=0; i<num; i++) {
		addParticle(position.x, position.y, ship.color, 4, 1 + Math.random() * 2, Math.random() * Math.PI * 2);
	}

}

function addParticle(x, y, color, size, speed, angle) {

	var num = 4 + Math.ceil(Math.random() * 4);
	for (var i=0; i<num; i++) {
		particles.push({
			x: x,
			y: y,
			color: color,
			age: 0,
			speed: speed,
			size: size,
			angle: angle
		});
	}
}

function setMood(ship, mood) {
	ship.mood = mood;
	ship.moodTimer = 20;
}

function initPlanets() {
	for (var i=0; i<world.planets.length; i++) {
		var planet = world.planets[i];
		planet.effect = {
			spin: 0.1,
			dist: 0,
			lines: []
		};
		for (var j=0; j<3; j++) {
			planet.effect.lines.push({
				x: 0,
				y: -10 + j*10,
				width: 2 + Math.floor(Math.random()*4),
				length: planet.r/4 + Math.floor(Math.random()*planet.r*2)
			});
		}
	}
}
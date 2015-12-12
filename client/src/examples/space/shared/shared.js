/**
 * Created by jonas on 2015-12-12.
 */

function updateAll(clients) {

	// simple physics
	var key, ship, dist;
	for (key in clients) {

		// server has .ship, client does not
		ship = clients[key].ship || clients[key];

		if (ship.alive) {
			// throttle
			ship.velocity.x += (ship.throttle / 50) * Math.cos(ship.angle);
			ship.velocity.y += (ship.throttle / 50) * Math.sin(ship.angle);

			for (var j = 0; j < world.planets.length; j++) {
				var planet = world.planets[j];
				dist = Math.sqrt(Math.pow(ship.position.x - planet.x, 2) + Math.pow(ship.position.y - planet.y, 2));

				// gravity
				var angle = Math.atan2(ship.position.y - planet.y, ship.position.x - planet.x);
				// faking mass by using the radius of planet
				// force = m1*m2/r^2
				var force = 1 * planet.r / Math.pow(dist, 2);
				// apply gravity forces
				ship.velocity.x -= force * Math.cos(angle);
				ship.velocity.y -= force * Math.sin(angle);

				// planet collision
				if (dist <= planet.r + ship.size) {
					handleCollision(ship, key);
				}
				// platform collision
				/*var cx = planet.x + Math.cos(planet.platformAngle)*planet.r;
				 var cy = planet.y + Math.sin(planet.platformAngle)*planet.r;
				 var distToPlatform =  Math.sqrt(Math.pow(ship.position.x - cx, 2) + Math.pow(ship.position.y - cy, 2));
				 if (distToPlatform < 14) {
				 ship.position.x = planet.x + Math.cos(planet.platformAngle) * (planet.r + 14);
				 ship.position.y = planet.y + Math.sin(planet.platformAngle) * (planet.r + 14);
				 ship.velocity.x = 12*force * Math.cos(angle);
				 ship.velocity.y = 12*force * Math.sin(angle);
				 }*/
			}

			// turning
			ship.angle = (ship.angle + ship.turn / 20) % (2 * Math.PI);

			// change position based on velocity
			ship.position.x = ship.position.x + ship.velocity.x;
			ship.position.y = ship.position.y + ship.velocity.y;

			// check world bounds
			if (ship.position.x < 0 || ship.position.x > world.width) {
				ship.velocity.x = 0;
				ship.position.x = Math.min(world.width, Math.max(0, ship.position.x));
			}
			if (ship.position.y < 0 || ship.position.y > world.height) {
				ship.velocity.y = 0;
				ship.position.y = Math.min(world.height, Math.max(0, ship.position.y));
			}
		}
	}

	// move bullets
	for (var i=0; i<bullets.length; i++) {

		bullets[i].x += bullets[i].speed * Math.cos(bullets[i].angle);
		bullets[i].y += bullets[i].speed * Math.sin(bullets[i].angle);

		// test bullet collision
		for (key in clients) {
			// server has .ship, client does not
			ship = clients[key].ship || clients[key];

			if (bullets[i].clientId !== key) {
				dist = Math.sqrt(Math.pow(ship.position.x - bullets[i].x, 2) + Math.pow(ship.position.y - bullets[i].y, 2));

				if (dist < 20) {
					handleCollision(ship, key);
					ship.position.x = 100;
					ship.position.y = 100;
					ship.velocity.x = 0;
					ship.velocity.y = 0;
				}
			}
		}

		bullets[i].age++;
		if (bullets[i].age > 60) {
			bullets.splice(i, 1);
			i--;
		}
	}

}
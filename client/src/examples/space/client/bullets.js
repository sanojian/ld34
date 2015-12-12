/**
 * Created by jonas on 2015-12-12.
 */

var bullets = [];
function addBullet(clientId, x, y, color, angle, speed) {
	bullets.push({
		x: x,
		y: y,
		angle: angle,
		speed: speed,
		age: 0,
		color: color,
		clientId: clientId
	});
}

function drawBullets() {

	var myShip = client.ships[client.peerId];
	for (var i=0; i<bullets.length; i++) {
		var bx = bullets[i].x - myShip.position.x + canvas.width/2;
		var by = bullets[i].y - myShip.position.y + canvas.height/2;

		ctx.beginPath();
		ctx.lineWidth = 4;
		ctx.strokeStyle = bullets[i].color;
		ctx.moveTo(bx - 2, by - 2);
		ctx.lineTo(bx + 2, by + 2);
		ctx.stroke();
	}

}
/**
 * Created by jonas on 2015-12-12.
 */

var dots = [];

function drawDots() {

	var myShip = client.ships[client.peerId];

	for (var i=0; i<dots.length; i++) {

		var dx = dots[i].x - myShip.position.x;
		var dy = dots[i].y - myShip.position.y;
		var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

		if (dist < myShip.size) {
			// eat the dot
			client.peerConnection.send({ event: 'eatDot', data: { x: dots[i].x, y: dots[i].y }});
			setMood(myShip, 'eating');
			dots.splice(i, 1);
			i--;
			myShip.size++;
		}
		else {
			// draw the dot
			var bx = dots[i].x - myShip.position.x + canvas.width/2;
			var by = dots[i].y - myShip.position.y + canvas.height/2;

			ctx.beginPath();
			ctx.lineWidth = 4;
			ctx.strokeStyle = '#eee';
			ctx.moveTo(bx - 2, by - 2);
			ctx.lineTo(bx + 2, by + 2);
			ctx.stroke();
		}
	}

}
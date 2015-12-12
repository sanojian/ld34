/**
 * Created by jonas on 2015-12-12.
 */

function Ship() {

	this.position = { x: 0, y: 0 };
	this.velocity = { x: 0, y: 0 };
	this.size = DEFS.SHIP_SIZE;
	this.alive = true;
	this.angle = 0;
	this.throttle = 0;
	this.turn = 0;
	this.color = '#aaaaaa';

	// client only
	this.lastShot = 0;
	this.frame = 0;

}
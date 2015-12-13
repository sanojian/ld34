/**
 * Created by jonas on 2015-12-12.
 */

function ServerRTC(ip) {
	this.ip = ip;
	this.clients = {};
}

ServerRTC.prototype.loop = function() {

	var message = 'server message ' + Math.random();
	for (var key in this.clients) {
		this.clients[key].conn.send({ event: 'message', data: message });
	}

};

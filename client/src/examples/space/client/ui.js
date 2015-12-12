/**
 * Created by jonas on 2015-12-12.
 */

var KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN, KEY_SPACE;

function initSteering() {
	document.onkeydown = function(e) {
		switch (e.keyCode) {
			case 37:
				KEY_LEFT = true;
				break;
			case 38:
				KEY_UP = true;
				break;
			case 39:
				KEY_RIGHT = true;
				break;
			case 32:
				KEY_SPACE = true;
				break;
			case 40:
				KEY_DOWN = true;
				break;
		}
	};
	document.onkeyup = function(e) {
		switch (e.keyCode) {
			case 37:
				KEY_LEFT = false;
				break;
			case 38:
				KEY_UP = false;
				break;
			case 39:
				KEY_RIGHT = false;
				break;
			case 32:
				KEY_SPACE = false;
				break;
			case 40:
				KEY_DOWN = false;
				break;
		}
	};
}

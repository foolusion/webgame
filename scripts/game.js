var SCREEN_WIDTH = 20;
var SCREEN_HEIGHT = 15;
var TILE_WIDTH = 40;
var TILE_HEIGHT = 40;
var sprites = new Image();
sprites.src = "/images/sprites.png";
sprites.onload = function() {
	osctx.drawImage(sprites, 0, 0);
};
oscan = document.createElement('canvas');
oscan.width = TILE_WIDTH;
oscan.height = TILE_HEIGHT;
osctx = oscan.getContext('2d');

var inputMap = {};
inputMap[33] = {'move': 'up-right'};
inputMap[34] = {'move': 'down-right'};
inputMap[35] = {'move': 'down-left'};
inputMap[36] = {'move': 'up-left'};
inputMap[37] = {'move': 'left'};
inputMap[38] = {'move': 'up'};
inputMap[39] = {'move': 'right'};
inputMap[40] = {'move': 'down'};

document.body.onkeydown = function(e) {
//	console.log(e.which);
	if (inputMap[e.which]) {
		websocket.send(JSON.stringify(inputMap[e.which]));
	}
}

var Player = {'Xpos': 0, 'Ypos': 0}

function onMessage(e) {
	Player = JSON.parse(e.data);
}

function onClose(e) {
	console.log("Connection closed.");
}

var websocket = new WebSocket("ws://localhost:8080/socket");
websocket.onmessage = onMessage;
websocket.onclose = onClose;

var canvas = document.getElementById('screen');
var ctx = canvas.getContext('2d');
ctx.fillStyle = "rgb(0, 255, 0)";
ctx.fillRect(0, 0, 800, 600);

function render() {
	ctx.fillStyle = "rgb(0, 255, 0)";
	ctx.fillRect(0, 0, 800, 600);
	ctx.drawImage(oscan, Player.Xpos*TILE_WIDTH, Player.Ypos*TILE_HEIGHT)
}

window.requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
	window.webkit.RequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function( callback ) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

(function animloop() {
	requestAnimFrame(animloop);
	render();
})();

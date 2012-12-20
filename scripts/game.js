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

var x = 0;
var y = SCREEN_HEIGHT / 2 * TILE_HEIGHT;

function onMessage(e) {
	console.log(e.data);
}

function onClose(e) {
	console.log("Connection closed.");
}

var websocket = new WebSocket("ws://localhost:8080/socket");
websocket.onmessage = onMessage;
websocket.onclose = onClose;

var canvas = document.getElementById('screen');
var ctx = canvas.getContext('2d');
ctx.fillStyle = "rgba(0, 255, 0, .5)";
ctx.fillRect(0, 0, 800, 600);

function render() {
	x += 1;
	x = x % ((SCREEN_WIDTH - 1) * TILE_WIDTH)
	ctx.fillStyle = "rgba(0, 255, 0, .5)";
	ctx.fillRect(0, 0, 800, 600);
	ctx.drawImage(oscan, x, y)
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

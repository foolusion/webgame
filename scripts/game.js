function onMessage(e) {
	console.log(e.data)
}

function onClose(e) {
	console.log("Connection closed.")
}

var websocket = new WebSocket("ws://localhost:8080/socket");
websocket.onmessage = onMessage;
websocket.onclose = onClose;

var canvas = document.getElementById('screen');
var ctx = canvas.getContext('2d');
ctx.fillStyle = "rgba(0, 255, 0, .5)";
ctx.fillRect(0, 0, 800, 600);
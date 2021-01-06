'use strict';

var url = require('url');
var WebSocket = require('ws');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var WebSocket__default = /*#__PURE__*/_interopDefaultLegacy(WebSocket);

let port = process.argv[2] ? parseInt(process.argv[2]) : 8081;
const rooms = new Map();
const server = new WebSocket__default['default'].Server({
    port,
});
function game(a, b) {
    a.on('close', () => b.close());
    b.on('close', () => a.close());
    a.on('message', e => b.send(e));
    b.on('message', e => a.send(e));
    let white = Math.random() < 0.5 ? a : b;
    let black = a == white ? b : a;
    white.send('w');
    black.send('b');
}
server.on('connection', (socket, request) => {
    if (request.url == null)
        return socket.close();
    let url$1 = new url.URL(request.url, 'chess:/');
    let code = url$1.searchParams.get('code');
    if (code) {
        let room = rooms.get(code);
        if (room == null)
            return socket.close();
        rooms.delete(code);
        game(socket, room);
    }
    else {
        code = Math.floor(Math.random() * 0x1000000).toString(16);
        rooms.set(code, socket);
        socket.send(code);
    }
    socket.on('close', () => {
        rooms.delete(code);
    });
});

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
server.on('connection', (socket, request) => {
    if (request.url == null)
        return socket.close();
    let url$1 = new url.URL(request.url, 'chess:/');
    let code = url$1.searchParams.get('code');
    let room;
    if (code == null) {
        code = Math.floor(Math.random() * 0x1000000).toString(16);
        socket.send(code);
        rooms.set(code, room = { clients: [] });
    }
    else {
        room = rooms.get(code);
        if (room == null || room.clients.length == 2)
            return socket.close();
    }
    let client = { socket };
    room.clients.push(client);
    socket.on('close', () => {
        let index = room.clients.indexOf(client);
        room.clients.splice(index, 1);
        if (room.clients.length == 0) {
            rooms.delete(code);
        }
    });
    socket.on('message', data => {
        for (let other of room.clients) {
            if (other == client)
                continue;
            other.socket.send(data);
        }
    });
});

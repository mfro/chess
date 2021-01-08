import { URL } from 'url';

import WebSocket from 'ws';

let port = process.argv[2] ? parseInt(process.argv[2]) : 8081;

interface Client {
    socket: WebSocket;
}

interface Room {
    clients: Client[];
}

const rooms = new Map<string, Room>();

const server = new WebSocket.Server({
    port,
});

server.on('connection', (socket, request) => {
    if (request.url == null)
        return socket.close();

    let url = new URL(request.url, 'chess:/');
    let code = url.searchParams.get('code');

    let room: Room;
    if (code == null) {
        code = Math.floor(Math.random() * 0x1000000).toString(16);
        socket.send(code);

        rooms.set(code, room = { clients: [] });
    } else {
        room = rooms.get(code)!;
        if (room == null || room.clients.length == 2)
            return socket.close();
    }

    let client = { socket };
    room.clients.push(client);

    socket.on('close', () => {
        let index = room!.clients.indexOf(client);
        room!.clients.splice(index, 1);
        if (room.clients.length == 0) {
            rooms.delete(code!);
        }
    });

    socket.on('message', data => {
        for (let other of room!.clients) {
            if (other == client) continue;

            other.socket.send(data);
        }
    });
});

import { createApp, reactive, shallowReactive } from 'vue'

import { framework } from '@mfro/vue-ui';

import main from './main.vue';

import { Board, Color, Move, Position } from './chess';
import { notate } from './history';

declare function setImmediate(fn: () => void): void;

interface HistoryEntry {
    move: Move;
    result: Move.Result;
    notation: string;
}

interface RemoteGame {
    color: Color;
    board: Board;
    history: HistoryEntry[];

    code: string;
    state: number;

    reset: () => void;
    move: (move: Move) => void;
}

function remote_game() {
    let game: RemoteGame = shallowReactive({
        color: Color.white,
        board: Board.starting(),
        history: reactive([]),

        code: window.location.hash.substr(1),
        state: 0,

        reset() {
            reset();
            socket.send('');
        },
        move(move: Move) {
            let piece = game.board.pieces.get(move.from);
            if (piece == null || piece.color != game.color)
                return null;

            setImmediate(() => {
                if (apply(move)) {
                    socket.send(JSON.stringify({
                        from: `${move.from.file}${move.from.rank}`,
                        to: `${move.to.file}${move.to.rank}`,
                    }));
                }
            })
        },
    });

    function reset() {
        game.board = Board.starting();
        game.history.length = 0;
    }

    function apply(move: Move): boolean {
        let result = Move.resolve(game.board, move);
        if (result == null)
            return false;

        let notation = notate(game.board, move, result);

        game.board = result.board;
        game.history.push({ move, result, notation });

        return true;
    }

    let socket: WebSocket;
    let base = location.host == 'box:8080' ? 'ws://box:8081/' : 'wss://api.mfro.me/chess/play';

    if (game.code) {
        socket = new WebSocket(`${base}?code=${game.code}`);
        game.state = 1;
    } else {
        socket = new WebSocket(`${base}`);
        game.state = 0;
    }

    socket.addEventListener('message', e => {
        if (game.state == 0) {
            game.code = e.data;
            game.state = 1;
        } else if (game.state == 1) {
            game.color = e.data;
            game.state = 2;
        } else if (e.data == '') {
            reset();
        } else {
            let msg = JSON.parse(e.data);

            let from = Position[msg.from as keyof typeof Position] as Position;
            let to = Position[msg.to as keyof typeof Position] as Position;

            let move = { from, to };

            apply(move);
        }
    });

    return game;
}

let game: RemoteGame = remote_game();

let app = createApp(main);
app.use(framework);

app.provide('remote', game);

app.mount('#app');

import { createApp, reactive } from 'vue'

import { framework } from '@mfro/vue-ui';

import main from './main.vue';

import { Board, Color, Move, Position } from './chess';

interface Engine {
    move(move: Move): void;
}

interface RemoteState {
    status: number;
    code: string;
    local: Color;
    board: Board;
    restart: () => void;
}

function local_engine(board: Board) {
    return {
        move(move: Move) {
            if (Move.is_legal(board, move)) {
                Move.apply_move(board, move);
            }
        },
    };
}

function remote_engine(state: RemoteState): Engine {
    let socket: WebSocket;
    let base = location.host == 'box:8080' ? 'ws://box:8081/' : 'wss://api.mfro.me/chess/play';

    let code = window.location.hash.substr(1);
    if (code) {
        socket = new WebSocket(`${base}?code=${code}`);
        state.status = 1;
    } else {
        socket = new WebSocket(`${base}`);
        state.status = 0;
    }

    let skip = false;
    socket.addEventListener('message', e => {
        if (state.status == 0) {
            state.code = e.data;
            state.status = 1;
        } else if (state.status == 1) {
            state.local = e.data;
            state.status = 2;
            state.board = Board.starting();
        } else if (e.data == '') {
            state.board = Board.starting();
        } else {
            let msg = JSON.parse(e.data);

            let from = Position[msg.from as keyof typeof Position] as Position;
            let to = Position[msg.to as keyof typeof Position] as Position;

            let move = { from, to };

            skip = true;
            engine.move(move);
            skip = false;
        }
    });

    state.restart = () => {
        socket.send('');
        state.board = Board.starting();
    };

    let engine: Engine = {
        move(move: Move) {
            if (!Move.is_legal(state.board, move))
                return false;

            if (!skip) {
                socket.send(JSON.stringify({
                    from: `${move.from.file}${move.from.rank}`,
                    to: `${move.to.file}${move.to.rank}`,
                }));
            }

            Move.apply_move(state.board, move);
            return true;
        },
    };

    return engine;
}

let state: RemoteState = reactive({
    status: 0,
    code: '',
    local: Color.white,
    board: Board.starting(),
    restart: () => { },
});

let engine = remote_engine(state);

let app = createApp(main);

app.use(framework);

app.provide('room', state);
app.provide('engine', engine);
app.provide('restart', () => { });

app.mount('#app');

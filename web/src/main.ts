import { createApp, markRaw, reactive } from 'vue';

import { framework } from '@mfro/vue-ui';

import main from './main.vue';

import { Board, Color, Move } from './chess';
import { HistoryEntry, notate } from './history';
import { dispatch, GetState, AddMove, SetState } from './sockets';
import { assert } from './util';

interface RemoteGame {
  color: Color;
  board: Board;
  history: HistoryEntry[];

  code: string | null;
  state: number;

  reset: () => void;
  move: (move: Move) => void;
}

function remote_game() {
  let socket: WebSocket;
  const base = window.location.host == 'box:8080' ? 'ws://box:8081/' : 'wss://api.mfro.me/chess/play';

  const game: RemoteGame = reactive({
    color: Color.white,
    board: Board.starting(),
    history: reactive([]),

    code: null,
    state: 0,

    reset() {
      game.board = Board.starting();
      game.color = Color.other(game.color);
      game.history.length = 0;

      send_state();
    },

    move(move: Move) {
      const piece = game.board.pieces.get(move.from);
      if (piece?.color != game.color)
        return;

      if (apply(move)) {
        socket.send(AddMove.pack(Move.save(move)));
      }
    },
  });

  function apply(move: Move): boolean {
    const result = Move.resolve(game.board, move);
    if (result == null)
      return false;

    const notation = notate(game.board, move, result);

    game.board = result.board;
    game.history.push(markRaw({ move, result, notation }));

    return true;
  }

  function send_state() {
    const board = Board.save(Board.starting());
    const color = Color.other(game.color);
    const history = game.history.map(h => Move.save(h.move));

    socket.send(SetState.pack({ board, color, history }));
  }

  const d = dispatch();

  d.register(GetState, () => {
    game.state = 2;
    send_state();

    assert(game.code != null, 'code is not set');
    const url = new URL(window.location.href);
    url.searchParams.set('code', game.code);
    window.history.replaceState(null, document.title, url.pathname + url.search);
  });

  d.register(SetState, ({ board, history, color }) => {
    game.state = 2;

    game.board = Board.load(board);
    game.color = color;
    game.history.length = 0;

    for (const move of history) {
      assert(apply(Move.load(move)), 'invalid comms');
    }
  });

  d.register(AddMove, move => {
    assert(apply(Move.load(move)), 'invalid comms');
  });

  function connect() {
    const url = new URL(window.location.href);
    game.code = url.searchParams.get('code');

    if (game.code) {
      socket = new WebSocket(`${base}?code=${game.code}`);
      socket.addEventListener('open', () => {
        socket.send(GetState.pack());
      });

      game.state = 1;
    } else {
      socket = new WebSocket(`${base}`);
      game.state = 0;
    }

    socket.addEventListener('message', e => {
      if (game.state == 0) {
        game.code = e.data;
        game.state = 1;
      } else {
        d.dispatch(e.data);
      }
    });

    socket.addEventListener('close', e => {
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      window.history.replaceState(null, document.title, url.pathname + url.search);

      connect();
    });
  }

  connect();

  return game;
}

const game: RemoteGame = remote_game();

const app = createApp(main);
app.use(framework);

app.provide('remote', game);

app.mount('#app');

<template>
  <div
    class="board"
    :class="{ grabbing: moving, grab: value.pieces.has(hover) }"
    @dragstart.prevent
    @contextmenu.prevent
    @mouseup="onMouseUp"
    @mousemove="onMouseMove"
    @mousedown="onMouseDown"
    @mouseleave="onMouseLeave"
    @touchend.prevent="onTouchEnd"
    @touchmove.prevent="onTouchMove"
    @touchstart.prevent="onTouchStart"
  >
    <div class="body" ref="root">
      <template v-for="square in squares" :key="square.file + square.rank">
        <square
          :position="square"
          :active="
            square == moving ||
            square == hover ||
            square == lastMove?.move.from ||
            square == lastMove?.move.to
          "
        />
      </template>

      <position
        v-for="[pos, piece] in pieces"
        :key="piece"
        :value="pos"
        :live="animate && piece != localMove"
        style="pointer-events: none"
      >
        <piece :value="piece" v-if="pos != moving" />
      </position>

      <position
        v-for="pos in legalMoves.get(moving)?.keys() || []"
        :key="pos"
        :value="pos"
      >
        <div class="legal-move" :class="{ take: value.pieces.has(pos) }" />
      </position>

      <grab-overlay :root="root" :moving="moving" :board="value" />
    </div>
  </div>
</template>

<script>
import { computed, provide, shallowRef, toRef, watch, watchEffect } from 'vue';

import { Color, Position, Rules, Piece } from '@/chess';
import * as sound_assets from '@/assets/sound';

import piece from './piece';
import square from './square';
import position from './position';
import grabOverlay from './grab-overlay';

const sounds = {};

for (const [name, url] of Object.entries(sound_assets)) {
  const audio = new Audio(url);
  sounds[name] = audio;
}

function play_sound(name) {
  const audio = sounds[name];
  audio.currentTime = 0;
  audio.play();
}

export default {
  name: 'board',
  components: {
    piece,
    square,
    position,
    grabOverlay,
  },

  emits: ['move'],
  props: {
    color: String,
    value: Object,
    animate: Boolean,
    lastMove: Object,
  },

  setup(props, { emit }) {
    const root = shallowRef(null);

    provide('color', toRef(props, 'color'));

    const size = shallowRef(Math.floor(Math.min(window.innerWidth, window.innerHeight) / 10));
    provide('size', size);
    window.addEventListener('resize', () => {
      size.value = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 10);
    });

    const squares = computed(() => {
      const ranks = Position.by_rank.slice();
      if (props.color == Color.white) ranks.reverse();
      return [].concat(...ranks);
    });

    const hover = shallowRef(null);

    const moving = shallowRef(null);
    const localMove = shallowRef(null);

    let ordering;
    watchEffect(() => {
      if (!ordering || [...props.value.pieces.values()].find(v => !ordering.has(v))) {
        ordering = new Map([...props.value.pieces.values()].map((a, i) => [a, i]));
      }
    });

    watch(() => props.lastMove, (lastMove, _, onInvalidate) => {
      const i = setImmediate(() => {
        localMove.value = null;

        if (lastMove) {
          if (lastMove.result.castle)
            play_sound('castle');

          else if (lastMove.result.capture)
            play_sound('capture');

          else if (lastMove.result.promote)
            play_sound('promote');

          else if (Rules.check(lastMove.result.board))
            play_sound('move_check');

          else if (lastMove.result.board.next == props.color)
            play_sound('move_opponent');

          else
            play_sound('move_self');
        }
      });

      onInvalidate(() => clearImmediate(i));
    });

    const pieces = computed(() => {
      const list = [...props.value.pieces];
      list.sort((a, b) => ordering.get(a[1]) - ordering.get(b[1]));
      return list;
    });

    const legalMoves = computed(() => {
      return Rules.all_legal_moves(props.value);
    });

    const positionAt = (x, y) => {
      x = Math.floor((x - root.value.offsetLeft) / root.value.offsetWidth * 8);
      y = Math.floor((y - root.value.offsetTop) / root.value.offsetHeight * 8);

      if (props.color == Color.white)
        y = 7 - y;

      if (x < 0 || x > 7 || y < 0 || y > 7)
        return null;

      return Position.by_file[x][y];
    };

    const startDrag = (x, y) => {
      moveDrag(x, y);

      if (moving.value) {
        moving.value = null;
      } else {
        const position = positionAt(x, y);
        if (position && props.value.pieces.has(position))
          moving.value = position;
      }
    };

    const moveDrag = (x, y) => {
      hover.value = positionAt(x, y);
    };

    const endDrag = (x, y) => {
      moveDrag(x, y);

      const position = positionAt(x, y);

      if (!moving.value) return;
      if (position && moving.value != position) {
        const piece = props.value.pieces.get(moving.value);
        localMove.value = piece;

        const move = { from: moving.value, to: position };

        const result = legalMoves.value.get(moving.value)?.get(position);
        if (result && result.promoted) {
          move.promote = Piece.queen;
        }

        emit('move', move);
      }

      moving.value = null;
    };

    return {
      root,
      squares,
      hover, moving,
      legalMoves,
      pieces,
      localMove,

      onMouseLeave: e => hover.value = null,
      onMouseDown: e => startDrag(e.clientX, e.clientY),
      onMouseMove: e => moveDrag(e.clientX, e.clientY),
      onMouseUp: e => endDrag(e.clientX, e.clientY),

      onTouchStart: e => startDrag(e.changedTouches[0].clientX, e.changedTouches[0].clientY),
      onTouchMove: e => moveDrag(e.changedTouches[0].clientX, e.changedTouches[0].clientY),
      onTouchEnd: e => endDrag(e.changedTouches[0].clientX, e.changedTouches[0].clientY),
    };
  },
};
</script>

<style lang="scss" scoped>
.board {
  border: 10px solid white;

  &.grab {
    cursor: grab;
  }

  &.grabbing {
    cursor: grabbing;
  }

  .body {
    position: relative;
    display: grid;
    grid-template: repeat(8, auto) / repeat(8, auto);
  }
}

.legal-move {
  position: absolute;
  top: 35%;
  left: 35%;
  width: 30%;
  height: 30%;
  background-color: fade-out(black, 0.8);
  border-radius: 50%;

  &.take {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    border: solid fade-out(black, 0.8);
    border-width: min(0.8vw, 0.8vh);
    border-radius: 50%;
    background-color: transparent;
  }
}

.moving {
  position: absolute;
  transform: translate(-50%, -50%);
}
</style>

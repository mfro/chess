<template>
  <div
    ref="root"
    class="board"
    :class="{ grabbing: moving, grab: board.pieces.has(hover) }"
    @dragstart.prevent
    @contextmenu.prevent
    @mouseup="onMouseUp"
    @mousemove="onMouseMove"
    @mousedown="onMouseDown"
    @touchend.prevent="onTouchEnd"
    @touchmove.prevent="onTouchMove"
    @touchstart.prevent="onTouchStart"
  >
    <template v-for="square in squares" :key="square.file + square.rank">
      <square :active="moving && square == hover" :position="square" />
    </template>

    <position v-if="moving" :value="moving">
      <div class="active-square" />
    </position>

    <position v-if="hover && moving != hover" :value="hover">
      <div class="active-square" />
    </position>

    <template v-if="lastMove">
      <position
        :value="lastMove.from"
        v-if="lastMove.from != moving && lastMove.from != hover"
      >
        <div class="active-square" />
      </position>

      <position
        :value="lastMove.to"
        v-if="lastMove.to != moving && lastMove.to != hover"
      >
        <div class="active-square" />
      </position>
    </template>

    <position
      v-for="[pos, piece] in pieces"
      :key="piece"
      :value="pos"
      :live="animate"
    >
      <piece :value="piece" v-if="pos != moving" />
    </position>

    <position
      v-for="pos in legalMoves.get(moving) || []"
      :key="pos"
      :value="pos"
    >
      <div class="legal-move" :class="{ take: board.pieces.has(pos) }" />
    </position>

    <move-overlay :root="root" :moving="moving" :board="board" />
  </div>
</template>

<script>
import { computed, nextTick, provide, reactive, ref, toRaw, toRef, watch, watchEffect } from 'vue';

import { Color, Position, Rules } from '../chess';

import piece from './piece';
import square from './square';
import position from './position';
import moveOverlay from './move-overlay';

export default {
  name: 'board',
  components: {
    piece,
    square,
    position,
    moveOverlay,
  },

  emits: ['move'],
  props: {
    color: String,
    board: Object,
    lastMove: Object,
  },

  setup(props, { emit }) {
    let root = ref(null);

    provide('color', toRef(props, 'color'));

    let squares = computed(() => {
      let ranks = Position.by_rank.slice();
      if (props.color == Color.white) ranks.reverse();
      return [].concat(...ranks);
    });

    let hover = ref(null);

    let moving = ref(null);

    let animate = ref(true);

    let ordering = new Map([...props.board.pieces.values()].map((a, i) => [a, i]));
    let pieces = computed(() => {
      let list = [...props.board.pieces];
      list.sort((a, b) => ordering.get(a[1]) - ordering.get(b[1]));
      return list;
    });

    let legalMoves = computed(() => {
      return Rules.all_legal_moves(props.board);
    });

    let positionAt = (x, y) => {
      x = Math.floor((x - root.value.offsetLeft) / root.value.offsetWidth * 8);
      y = Math.floor((y - root.value.offsetTop) / root.value.offsetHeight * 8);

      if (props.color == Color.white)
        y = 7 - y;

      return Position.by_file[x][y];
    }

    let startDrag = (x, y) => {
      moveDrag(x, y);

      let position = positionAt(x, y);

      if (props.board.pieces.has(position))
        moving.value = position;
    };

    let moveDrag = (x, y) => {
      hover.value = moving.value && positionAt(x, y);
    };

    let endDrag = (x, y) => {
      moveDrag(x, y);

      let position = positionAt(x, y);

      if (!moving.value) return;
      if (moving.value != position) {
        animate.value = false;
        setImmediate(() => animate.value = true);

        emit('move', { from: moving.value, to: position });
      }

      moving.value = null;
    };

    return {
      root,
      squares,
      hover, moving,
      legalMoves,
      pieces, animate,

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
  position: relative;
  display: grid;
  grid-template: repeat(8, auto) / repeat(8, auto);

  &.grab {
    cursor: grab;
  }

  &.grabbing {
    cursor: grabbing;
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

.active-square {
  width: 100%;
  height: 100%;
  background-color: fade-out(#ffeb3b, 0.5);
}

.moving {
  position: absolute;
  transform: translate(-50%, -50%);
}
</style>

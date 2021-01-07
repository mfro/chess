<template>
  <v-app align-center>
    <v-flex align-center justify-center class="ma-4">
      <template v-if="room.status == 1">
        <v-button icon @click="copyLink()" @mouseleave="linkCopied = false">
          <v-icon v-if="!linkCopied">content_paste</v-icon>
          <v-icon v-else bold style="color: #4caf50">check</v-icon>
        </v-button>

        <v-text-field
          class="mt-0 ml-4"
          ref="linkInput"
          solo
          :modelValue="link"
        />
      </template>

      <template v-else-if="room.status == 2 && result">
        <v-text title class="mr-4">
          <span v-if="result == 'statemate'">Stalemate</span>
          <span v-else-if="result == 'w'">Black wins</span>
          <span v-else-if="result == 'b'">White wins</span>
        </v-text>

        <v-button color="primary" @click="room.restart()">
          <span>new game</span>
        </v-button>
      </template>
    </v-flex>

    <board
      :color="room.local"
      :board="room.board"
      :last-move="lastMove"
      @move="onMove"
    />
  </v-app>
</template>

<script >
import { computed, inject, markRaw, onBeforeUpdate, ref, watch } from 'vue';

import Board from './ui/board';
import { Rules } from './chess';

function piece(list, def) {
  let color = def[0];
  let kind = def[1];
  let x = 'abcdefgh'.indexOf(def[2]);
  let y = '12345678'.indexOf(def[3]);

  list[x][y] = { color, kind };
}

export default {
  name: 'chess',
  components: {
    Board,
  },

  emits: ['move'],

  setup(props) {
    let room = inject('room');
    let engine = inject('engine');

    let result = computed(() => {
      if (Rules.all_legal_moves(room.board).size > 0)
        return null;

      return Rules.check(room.board) ?? 'statemate';
    });

    let lastMove = ref(null);

    let oldMove = engine.move;
    engine.move = m => {
      if (oldMove(m)) {
        lastMove.value = m;
      }
    };

    let link = computed(() => `${location.origin}${location.pathname}#${room.code}`);
    let linkInput = ref(null);
    let linkCopied = ref(false);

    let copyLink = () => {
      linkInput.value.select();
      document.execCommand('copy');
      linkCopied.value = true;
    };

    watch(() => room.board, () => {
      lastMove.value = null;
    });

    return {
      room, result, lastMove,
      link, linkInput, copyLink, linkCopied,

      onMove: m => {
        if (room.status == 2 && room.local != room.board.next)
          return;

        engine.move(m)
      },
    };
  },
};
</script>

<style lang="scss">
html,
body {
  margin: 0;
}

#app {
  width: 100vw;
  height: 100vh;
  display: flex;
  // align-items: center;
  justify-content: center;
}
</style>

<style lang="scss" scoped>
</style>

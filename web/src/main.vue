<template>
  <div>
    <div class="room-info">
      <template v-if="room.status == 1">
        <button
          class="material-icons"
          @click="copyLink()"
          @mouseleave="linkCopied = false"
        >
          <span v-if="linkCopied">check</span>
          <template v-else>content_paste</template>
        </button>

        <input ref="linkInput" type="text" :value="link" />
      </template>

      <template v-else-if="room.status == 2 && complete">
        <button @click="room.restart()">new game</button>
      </template>
    </div>

    <board
      :color="room.local"
      :board="room.board"
      :key="room.board"
      :last-move="lastMove"
      @move="onMove"
    />
  </div>
</template>

<script >
import { computed, inject, markRaw, ref } from 'vue';

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

    let complete = computed(() => Rules.all_legal_moves(room.board).size == 0);

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

    return {
      room, complete, lastMove,
      link, linkInput, copyLink, linkCopied,

      onMove: m => engine.move(m),
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
.link {
  user-select: all;
}

.room-info {
  margin: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  input {
    margin: 0 8px 0;
  }

  span {
    color: #4caf50;
    font-weight: bold;
    font-size: 32px;
    margin: -4px;
    display: block;
  }
}
</style>

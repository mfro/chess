<template>
  <game
    :color="color"
    :board="board"
    :history="history"
    v-model:last-move="lastMove"
    @input="onMove"
  >
    <template v-slot:actions>
      <slot name="actions" />

      <v-flex class="pb-4">
        <!-- <v-button small @click="flip">
                    <span>flip board</span>
                </v-button> -->

        <v-button small :disabled="!lastMove" class="mr-4" @click="reset">
          <span>reset</span>
        </v-button>

        <v-button small :disabled="latest" @click="restore">
          <span>revert</span>
        </v-button>
      </v-flex>
    </template>
  </game>
</template>

<script>
import { computed, reactive, ref } from 'vue';

import { Color, Board, Move } from '@/chess';
import { notate } from '@/history';

import game from '@/ui/game';

export default {
  name: 'local-game',
  components: {
    game,
  },

  setup() {
    const color = ref(Color.white);
    const board = ref(Board.starting());
    const history = reactive([]);

    const lastMove = ref(null);

    const latest = computed(() => lastMove.value == history[history.length - 1]);

    return {
      latest, lastMove,

      color, board, history,

      onMove(move) {
        const result = Move.resolve(board.value, move);
        if (result == null) return;

        const notation = notate(board.value, move, result);

        board.value = result.board;
        history.push({ notation, result, move });
      },

      flip() {
        color.value = color.value == Color.black ? Color.white : Color.black;
      },

      reset() {
        board.value = Board.starting();
        history.length = 0;
        lastMove.value = null;
      },

      restore() {
        board.value = lastMove.value.result.board;
        history.length = history.indexOf(lastMove.value) + 1;
      },
    };
  },
};
</script>

<style lang="scss" scoped>
</style>

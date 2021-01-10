<template>
  <v-flex :column="profile" :align-center="profile" style="overflow: hidden">
    <board
      :color="color"
      :value="lastMove?.result.board ?? board"
      :animate="animate"
      :last-move="lastMove"
      @move="onMove"
    />

    <v-flex column class="pa-4" style="overflow: hidden">
      <slot name="actions" />

      <history
        :value="history"
        :active="lastMove"
        @update:active="$emit('update:last-move', $event)"
      />
    </v-flex>
  </v-flex>
</template>

<script>
import { shallowRef, watch } from 'vue';

import board from '@/ui/board';
import history from '@/ui/history';

export default {
  name: 'game',
  components: {
    board,
    history,
  },

  emits: ['input', 'update:last-move'],
  props: {
    color: String,
    board: Object,
    history: Object,
    lastMove: Object,
  },

  setup(props, { emit }) {
    const profile = shallowRef(window.innerWidth < window.innerHeight);

    const animate = shallowRef(false);

    watch(() => [props.board, props.lastMove], ([_0, lastMove], [_1, oldLastMove]) => {
      const index = props.history.indexOf(lastMove);
      const oldIndex = props.history.indexOf(oldLastMove);

      if (oldLastMove && oldIndex == -1) {
        emit('update:last-move', null);
      } else if (index == oldIndex && oldIndex + 2 == props.history.length) {
        emit('update:last-move', props.history[props.history.length - 1]);
      }
    });

    if (props.lastMove == null && props.history.length > 0) {
      emit('update:last-move', props.history[props.history.length - 1]);
    }

    watch(() => [props.color, props.lastMove], ([color, lastMove], [oldColor, oldLastMove]) => {
      const index = props.history.indexOf(lastMove);
      const oldIndex = props.history.indexOf(oldLastMove);

      animate.value = color == oldColor && Math.abs(index - oldIndex) == 1;
    });

    return {
      profile,
      animate,

      onMove(move) {
        if (props.lastMove != props.history[props.history.length - 1])
          return;

        emit('input', move);
      },
    };
  },
};
</script>

<style lang="scss" scoped>
</style>

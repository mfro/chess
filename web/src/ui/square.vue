<template>
  <div class="square" :style="style" :class="[color, { active }]" />
</template>

<script>
import { computed, inject } from 'vue';

import { Position } from '../chess';

export default {
  name: 'square',

  props: {
    position: Object,
    active: Boolean,
  },

  setup(props, { emit }) {
    let size = inject('size');

    let color = computed(() => {
      let i = Position.ranks.indexOf(props.position.rank)
        + Position.files.indexOf(props.position.file);

      return i % 2 == 0 ? 'black' : 'white';
    });

    return {
      color,
      style: computed(() => ({
        width: `${size.value}px`,
        height: `${size.value}px`,
      })),
    };
  },
};
</script>

<style scoped lang="scss">
.square {
  position: relative;
  pointer-events: none;

  &.white {
    background-color: #f0d9b5;

    &.active {
      background-color: mix(#f0d9b5, #ffeb3b, 50%);
    }
  }

  &.black {
    background-color: #b58863;

    &.active {
      background-color: mix(#b58863, #ffeb3b, 50%);
    }
  }
}
</style>

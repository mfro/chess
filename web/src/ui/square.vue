<template>
  <div class="square" :class="[color, { active }]" />
</template>

<script>
import { computed } from 'vue';

import { Position } from '../chess';

export default {
  name: 'square',

  props: {
    position: Object,
    active: Boolean,
  },

  setup(props, { emit }) {
    let color = computed(() => {
      let i = Position.ranks.indexOf(props.position.rank)
        + Position.files.indexOf(props.position.file);

      return i % 2 == 0 ? 'black' : 'white';
    });

    return { color };
  },
};
</script>

<style scoped lang="scss">
.square {
  width: min(10vw, 10vh);
  height: min(10vw, 10vh);
  position: relative;
  pointer-events: none;

  &.white {
    background-color: #f0d9b5;
  }

  &.black {
    background-color: #b58863;
  }
}
</style>

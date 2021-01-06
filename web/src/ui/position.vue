<template>
  <div class="position" :style="style" :class="{ live }">
    <slot />
  </div>
</template>

<script>
import { computed, inject, onRenderTriggered, onUpdated, watchEffect } from 'vue';
import { Color, Position } from '../chess';

export default {
  name: 'position',

  props: {
    live: Boolean,
    value: Object,
  },

  setup(props) {
    let color = inject('color');

    let style = computed(() => {
      let y = Position.ranks.indexOf(props.value.rank);
      let x = Position.files.indexOf(props.value.file);

      if (color.value == Color.white)
        y = 7 - y;

      return {
        transform: `translate(${x * 100}%, ${y * 100}%)`,
      }
    });

    return { style };
  },
};
</script>

<style scoped lang="scss">
.position {
  position: absolute;
  width: min(10vw, 10vh);
  height: min(10vw, 10vh);

  &.live {
    will-change: transform;
    transition: transform 100ms linear;
  }
}
</style>

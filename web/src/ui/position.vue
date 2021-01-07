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
    let size = inject('size');

    let color = inject('color');

    return {
      style: computed(() => {
        let y = Position.ranks.indexOf(props.value.rank);
        let x = Position.files.indexOf(props.value.file);

        if (color.value == Color.white)
          y = 7 - y;

        return {
          width: `${size.value}px`,
          height: `${size.value}px`,
          transform: `translate(${x * 100}%, ${y * 100}%)`,
        }
      })
    };
  },
};
</script>

<style scoped lang="scss">
.position {
  position: absolute;

  &.live {
    will-change: transform;
    transition: transform 100ms linear;
  }
}
</style>

<template>
  <div class="piece" :style="style" :class="value.color + value.kind" />
</template>

<script>
import { computed, inject } from 'vue';

export default {
  name: 'piece',

  props: {
    value: Object,
  },

  setup() {
    const size = inject('size');

    return {
      style: computed(() => ({
        width: `${size.value}px`,
        height: `${size.value}px`,
      })),
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/pieces.scss";

.piece {
  @include piece;

  background-size: 100%;
}
</style>

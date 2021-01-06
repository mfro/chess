<template>
  <div class="move-overlay" :style="style">
    <piece v-if="moving" :value="board.pieces.get(moving)" />
  </div>
</template>

<script>
import { computed, reactive, ref } from 'vue';

import piece from './piece';

export default {
  components: {
    piece,
  },

  props: {
    root: Object,
    board: Object,
    moving: Object,
  },

  setup(props) {
    let mouse = reactive([0, 0]);

    let style = computed(() => props.moving && ({
      top: `${mouse[1]}px`,
      left: `${mouse[0]}px`,
    }));

    document.body.addEventListener('mousemove', e => {
      let x = e.clientX;
      let y = e.clientY;

      mouse[0] = Math.max(Math.min(x - props.root.offsetLeft, props.root.offsetWidth), 0);
      mouse[1] = Math.max(Math.min(y - props.root.offsetTop, props.root.offsetHeight), 0);
    });

    return { style };
  },
};
</script>

<style lang="scss" scoped>
.move-overlay {
  position: absolute;
  transform: translate(-50%, -50%);
}
</style>

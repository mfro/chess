<template>
  <div class="grab-overlay" :style="style">
    <piece v-if="moving" :value="board.pieces.get(moving)" />
  </div>
</template>

<script>
import { computed, onBeforeUnmount, reactive } from 'vue';

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
    const mouse = reactive([0, 0]);

    const style = computed(() => props.moving && ({
      top: `${mouse[1]}px`,
      left: `${mouse[0]}px`,
    }));

    function updateMouse(x, y) {
      mouse[0] = Math.max(Math.min(x - props.root.offsetLeft, props.root.offsetWidth), 0);
      mouse[1] = Math.max(Math.min(y - props.root.offsetTop, props.root.offsetHeight), 0);
    }

    function onMouseEvent(e) {
      updateMouse(e.clientX, e.clientY);
    }

    function onTouchEvent(e) {
      updateMouse(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }

    document.body.addEventListener('mousemove', onMouseEvent);
    document.body.addEventListener('touchstart', onTouchEvent);
    document.body.addEventListener('touchmove', onTouchEvent);

    onBeforeUnmount(() => {
      document.body.removeEventListener('mousemove', onMouseEvent);
      document.body.removeEventListener('touchstart', onTouchEvent);
      document.body.removeEventListener('touchmove', onTouchEvent);
    });

    return { style };
  },
};
</script>

<style lang="scss" scoped>
.grab-overlay {
  position: absolute;
  transform: translate(-50%, -50%);
}
</style>

<template>
  <div class="piece" :class="value.color + value.kind" />
</template>

<script>
export default {
  name: 'piece',

  props: {
    value: Object,
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/pieces.scss";

.piece {
  @include piece;

  width: min(10vw, 10vh);
  height: min(10vw, 10vh);

  background-size: 100%;
}
</style>

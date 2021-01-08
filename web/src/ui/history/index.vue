<template>
  <v-flex column class="history">
    <v-flex align-baseline v-for="(row, i) in rows" :key="i" class="pa-1">
      <v-text>{{ i + 1 }}.</v-text>

      <v-button
        :text="row[0] != active"
        small
        class="move ml-4"
        @click="preview(row[0])"
      >
        <v-text bold body>{{ row[0].notation }}</v-text>
      </v-button>

      <v-button
        :text="row[1] != active"
        small
        class="move ml-4"
        @click="preview(row[1])"
        v-if="row[1]"
      >
        <v-text bold body>{{ row[1].notation }}</v-text>
      </v-button>
    </v-flex>
  </v-flex>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'history',

  emits: ['update:active'],
  props: {
    value: Array,
    active: Object,
  },

  setup(props, { emit }) {
    const rows = computed(() => {
      const rows = [];

      for (let i = 0; i < props.value.length; i += 2) {
        rows.push([props.value[i], props.value[i + 1]]);
      }

      return rows;
    });

    return {
      rows,

      preview(i) {
        emit('update:active', i);
      },
    };
  },
};
</script>

<style lang="scss" scoped>
.history {
  width: 40ch;
  overflow-y: auto;
}

.move {
  span {
    min-width: 8ch;
    text-align: start;
    text-transform: none;
  }
}
</style>

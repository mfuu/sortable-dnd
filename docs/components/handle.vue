<template>
  <div ref="listRef">
    <div v-for="item in 10" :key="item" class="item">
      {{ item }}
      <span class="handle">☰</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const dnd = ref();
const listRef = ref();

onMounted(() => {
  if (!import.meta.env.SSR) {
    import('../../src/index').then((module) => {
      const Sortable = module.default;
      dnd.value = new Sortable(listRef.value, {
        handle: '.handle',
        chosenClass: 'chosen',
        onChoose: (evt) => {
          console.log('choose', evt);
        },
        onDrop: (evt) => {
          console.log('drop', evt);
        },
      });
    });
  }
});

onUnmounted(() => {
  dnd.value.destroy();
});
</script>

<style scoped>
.item {
  border-radius: 5px;
  box-shadow: 0px 2px 5px -2px #57bbb4;
  padding: 8px;
  margin-bottom: 5px;
}

.handle {
  float: right;
  cursor: move;
}

.chosen {
  box-shadow: 0px 0px 5px 1px #1984ff;
}
</style>

<template>
  <div ref="listRef">
    <div v-for="item in 10" :key="item" class="item">
      <span>{{ item }}</span>
      <span class="handle">☰</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import Sortable from '../../src/index';

const dnd = ref();
const listRef = ref();

onMounted(() => {
  dnd.value = new Sortable(listRef.value, {
    multiple: true,
    handle: '.handle',
    chosenClass: 'chosen',
    selectedClass: 'selected',
  });
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

.selected {
  background-color: #57bbb4;
}

.handle {
  float: right;
  cursor: move;
}

.chosen {
  box-shadow: 0px 0px 5px 1px #1984ff;
}
</style>

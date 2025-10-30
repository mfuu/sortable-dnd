<template>
  <div ref="listRef" class="list-group col nested-sortable">
    <div class="item nested-1">
      Item 1.1
      <div class="list-group nested-sortable">
        <div class="item nested-2">Item 2.1</div>
        <div class="item nested-2">
          Item 2.2
          <div class="list-group nested-sortable">
            <div class="item nested-3">Item 3.1</div>
            <div class="item nested-3">Item 3.2</div>
            <div class="item nested-3">Item 3.3</div>
            <div class="item nested-3">Item 3.4</div>
          </div>
        </div>
        <div class="item nested-2">Item 2.3</div>
        <div class="item nested-2">Item 2.4</div>
      </div>
    </div>
    <div class="item nested-1" style="">Item 1.2</div>
    <div class="item nested-1" style="">Item 1.3</div>
    <div class="item nested-1">
      Item 1.4
      <div class="list-group nested-sortable">
        <div class="item nested-2">Item 2.1</div>
        <div class="item nested-2">Item 2.2</div>
        <div class="item nested-2">Item 2.3</div>
        <div class="item nested-2">Item 2.4</div>
      </div>
    </div>
    <div class="item nested-1">Item 1.5</div>
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
        draggable: '.item',
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
  position: relative;
  display: block;
  padding: 0.75rem 1.25rem;
  margin-bottom: -1px;
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 5px;
  box-shadow: 0px 2px 5px -2px #57bbb4;
}

.chosen {
  box-shadow: 0px 0px 5px 1px #1984ff;
}

.nested-1 {
  background-color: #e6e6e6;
}

.nested-2 {
  background-color: #cccccc;
}

.nested-3 {
  background-color: #b3b3b3;
}

.nested-1,
.nested-2,
.nested-3 {
  margin-top: 5px;
}
</style>

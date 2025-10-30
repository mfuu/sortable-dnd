<template>
  <div ref="checkListRef" class="flex-1">
    <div
      v-for="item in list"
      :key="item.id"
      :class="['item', item.selected ? 'selected' : '']"
      :data-id="item.id"
    >
      <input v-model="item.selected" type="checkbox" />
      <span>{{ item.name }}</span>
      <span class="handle">☰</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const checkDnd = ref(null);
const checkListRef = ref();

const isChoose = ref(false);

const list = ref(
  new Array(10)
    .fill(0)
    .map((v, i) => ({ id: i + 1, name: `item ${i + 1}`, selected: i < 2 ? true : false }))
);

onMounted(() => {
  if (!import.meta.env.SSR) {
    import('../../src/index').then((module) => {
      const Sortable = module.default;

      checkDnd.value = new Sortable(checkListRef.value, {
        handle: '.handle',
        multiple: true,
        chosenClass: 'chosen',
        animation: 500,
        swapOnDrop: false,
        dropOnAnimationEnd: true,
        onChoose: (evt) => {
          console.log('choose', evt);

          isChoose.value = true;
        },
        onUnchoose: (evt) => {
          console.log('unchoose', evt);

          isChoose.value = false;
        },
        onDrag: (evt) => {
          console.log('drag', evt);
        },
        onDrop: (evt) => {
          console.log('drop', evt);

          if (evt.relative === 0) {
            return;
          }

          const tempList = [...list.value];

          const nodeItem = tempList[evt.oldIndex];
          const targetId = tempList[evt.newIndex].id;

          let selectedItems = [];
          // multi-drag
          if (nodeItem.selected) {
            selectedItems = tempList.filter((item) => item.selected);

            if (selectedItems.find((item) => item.id === targetId)) {
              return;
            }
          } else {
            // single-drag
            selectedItems = [nodeItem];
          }

          selectedItems.forEach((item) => {
            tempList.splice(tempList.indexOf(item), 1);
          });

          let dropIndex = tempList.findIndex((item) => item.id === targetId);

          if (evt.oldIndex < evt.newIndex && evt.relative === 1) {
            dropIndex += evt.relative;
          }

          tempList.splice(dropIndex, 0, ...selectedItems);

          list.value = tempList;
        },
      });
    });
  }
});

onUnmounted(() => {
  checkDnd.value.destroy();
});
</script>

<style scoped>
.wrap {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.flex-1 {
  flex: 1;
}

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

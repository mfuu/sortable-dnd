<template>
  <div class="group-wrap">
    <div ref="groupRef0" class="group-item">
      <div v-for="item in 10" :key="item" class="item">
        {{ item }}
      </div>
    </div>
    <div ref="groupRef1" class="group-item">
      <div v-for="item in 10" :key="item" class="item pink">
        {{ item }}
      </div>
    </div>
    <div ref="groupRef2" class="group-item">
      <div v-for="item in 10" :key="item" class="item pink">
        {{ item + 10 }}
      </div>
    </div>
    <div ref="groupRef3" class="group-item">
      <div v-for="item in 10" :key="item" class="item green">
        {{ item }}
      </div>
    </div>
    <div ref="groupRef4" class="group-item">
      <div v-for="item in 10" :key="item" class="item green">
        {{ item + 10 }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const dnd0 = ref();
const dnd1 = ref();
const dnd2 = ref();
const dnd3 = ref();
const dnd4 = ref();
const groupRef0 = ref();
const groupRef1 = ref();
const groupRef2 = ref();
const groupRef3 = ref();
const groupRef4 = ref();

onMounted(() => {
  import('../../src/index').then((module) => {
    const Sortable = module.default;
    dnd0.value = new Sortable(groupRef0.value, {
      group: {
        name: 'group',
        pull: 'clone',
        revertDrag: true,
      },
      chosenClass: 'chosen',
    });

    dnd1.value = new Sortable(groupRef1.value, {
      group: {
        name: 'group1',
        put: ['group', 'group2'],
      },
      chosenClass: 'chosen',
    });

    dnd2.value = new Sortable(groupRef2.value, {
      group: {
        name: 'group2',
        put: ['group', 'group1'],
      },
      chosenClass: 'chosen',
    });

    dnd3.value = new Sortable(groupRef3.value, {
      group: {
        name: 'group3',
        put: ['group', 'group4'],
      },
      chosenClass: 'chosen',
    });

    dnd4.value = new Sortable(groupRef4.value, {
      group: {
        name: 'group4',
        put: ['group', 'group3'],
      },
      chosenClass: 'chosen',
    });
  })
});

onUnmounted(() => {
  dnd0.value.destroy();
  dnd1.value.destroy();
  dnd2.value.destroy();
  dnd3.value.destroy();
  dnd4.value.destroy();
});
</script>

<style scoped>
.group-wrap {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.group-item {
  flex: 1;
}

.item {
  border-radius: 5px;
  box-shadow: 0px 2px 5px -2px #57bbb4;
  padding: 8px;
  margin-bottom: 5px;
}

.item.pink {
  background-color: #fb566940;
}

.item.green {
  background-color: turquoise;
}

.chosen {
  box-shadow: 0px 0px 5px 1px #1984ff;
}
</style>

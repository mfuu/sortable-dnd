<template>
  <div class="group-wrap">
    <dnd-comp
      :group="{ name: 'group', pull: 'clone', revertDrag: true }"
      class="group-item"
    ></dnd-comp>

    <dnd-comp
      :group="{ name: 'group1', put: ['group', 'group2'] }"
      class="group-item"
      item-class="pink"
    ></dnd-comp>

    <dnd-comp
      :group="{
        name: 'group2',
        put: ['group', 'group1'],
      }"
      class="group-item"
      item-class="pink"
    ></dnd-comp>

    <dnd-comp
      :group="{
        name: 'group3',
        put: ['group', 'group4'],
      }"
      class="group-item"
      item-class="green"
    ></dnd-comp>

    <dnd-comp
      :group="{
        name: 'group4',
        put: ['group', 'group3'],
      }"
      class="group-item"
      item-class="green"
    ></dnd-comp>
  </div>
</template>

<script setup>
import { defineComponent, h, onMounted, onUnmounted, ref } from 'vue';

const dndComp = defineComponent({
  props: {
    group: {
      type: Object,
      default: () => ({}),
    },
    itemClass: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const listRef = ref();
    const dnd = ref();

    onMounted(() => {
      if (!import.meta.env.SSR) {
        import('../../src/index').then((module) => {
          const Sortable = module.default;

          dnd.value = new Sortable(listRef.value, {
            group: props.group,
            chosenClass: 'chosen',
            placeholderClass: 'placeholder',
            onChoose: (evt) => {
              console.log('choose', evt);
            },
            onDrop: (evt) => {
              console.log('drop', evt);
            },
            onAdd: (evt) => {
              console.log('add', evt);
            },
            onRemove: (evt) => {
              console.log('remove', evt);
            },
          });
        });
      }
    });

    onUnmounted(() => {
      dnd.value.destroy();
    });

    const renderItems = () =>
      new Array(10).fill(0).map((v, i) => h('div', { class: `item ${props.itemClass}` }, i + 1));

    return () => {
      return h('div', { ref: listRef }, renderItems());
    };
  },
});
</script>

<style>
.group-wrap {
  display: flex;
  justify-content: space-between;
  gap: 20px;

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
}
</style>

[![npm](https://img.shields.io/npm/v/sortable-dnd.svg)](https://www.npmjs.com/package/sortable-dnd)  [![npm](https://img.shields.io/npm/dm/sortable-dnd.svg)](https://npm-stat.com/charts.html?package=sortable-dnd)  [![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)



A JS Library for Drag and Drop, supports Sortable and Draggable

### [Live Demo](https://mfuu.github.io/sortable-dnd/)

## Usage

**HTML**
```html
<ul id="group">
  <li class="item">
    <i id="handle" class="handle">drag me</i>
    <p>1</p>
  </li>
  <li class="item">
    <i id="handle" class="handle">drag me</i>
    <p>2</p>
  </li>
  <li class="item">
    <i id="handle" class="handle">drag me</i>
    <p>3</p>
  </li>
</ul>
```

**JavaScript**
```js
import Sortable from 'sortable-dnd'

var sortable = new Sortable(
  document.getElementById('group'),
  {
    chosenClass: 'chosen',
    draggable: (e) => e.target.tagName === 'LI' ? true : false, // use function
    // draggable: 'li' // use tagName 
    // draggable: '.item' // use class
    // draggable: '#item' // use id
    // draggable: (e) => e.target // use function to set drag Element
    handle: (e) => e.target.tagName === 'I' ? true : false, // use function
    // handle: 'I', // use tagName
    // handle: '.handle', // use class
    // handle: '#handle', // use id
    onDrag: ({ from, event }) => {
      // code
    },
    onMove: ({ from, event }) => {
      // code
    },
    onDrop: ({ from, to, changed, event }) => {
      // code
    },
    onAdd: ({ from, to, event }) => {
      // code
    },
    onRemove: ({ from, to, event }) => {
      // code
    },
    onChange: ({ from, to, event }) => {
      // code
    },
    onSelect: (params) => {
      // code
    },
    onDeselect: (params) => {
      // code
    }
  }
)
```

## Virtual-list

**HTML**
```html
<div id="scroller" class="scroller">
  <ul id="container" class="container"></ul>
</div>
```

**JavaScript**
```js
const scroller = document.getElementById("scroller");
const container = document.getElementById("container");

let sortable = new Sortable(container, {
  // virtual options
  scroller: scroller,
  virtual: true,
  keeps: 15,
  dataKeys: getDataKeys(),
  // common options
  chosenClass: 'chosen',
  selectedClass: 'selected',
  onDrag: ({ from }) => {
    // get the drag item's key by `from.node.dataset.key`
    fromItemKey = from.node.dataset.key;
  },
  onDrop: ({ to, changed }) => {
    if (!changed) return;
    // executed only `changed === true`
    // You should change the value of the source list in this method, something like:
    `
    let fromIndex = list.findIndex((item) => item["id"] == fromItemKey);
    let fromItem = list[fromIndex];
    let toItemKey = to.node.dataset.key;
    let toIndex = list.findIndex((item) => item["id"] == toItemKey);
    list.splice(fromIndex, 1);
    list.splice(toIndex, 0, fromItem);
    `
    // update the `dataKeys` if the source list changed
    `
    sortable.option('dataKeys', getDataKeys());
    `
  },
  onCreate: (range) => {
    render(range);
  },
  onUpdate: (range) => {
    const children = Array.from(container.children);
    for (let i = 0; i < children.length; i++) {
      // the ghost element can not be removed
      if (children[i] !== Sortable.ghost) {
        container.removeChild(children[i]);
      }
    }
    render(range);
  },
});

function getDataKeys() {
  return list.map((item) => item["id"]);
}

function render(range) {
  // render items by yourself
  for (let i = range.start; i < range.end; i++) {
    if (list[i]["id"] == fromItemKey) {
      continue;
    }
    let li = document.createElement('li');
    li.classList.add('list-item');
    li.setAttribute('data-key', list[i]["id"]);
    li.innerHTML = `<p>${list[i].desc}</p>`;
    container.append(li);
  }
}
```

## Methods

| **Method**   | **Description** |
|--------------|--------------|
| `destroy()`  | Manually clear all the state of the component, using this method the component will not be draggable |
| `option(key, value?)` | Get or set the option value, depending on whether the `value` is passed in |


## Options

**Common used**

|     **Option**    |      **Type**     | **Default** | **Description** |
|-------------------|-------------------|-------------|--------------|
| `draggable`       | `String/Function` | `-`         | Specifies which items inside the element should be draggable |
| `handle`          | `String/Funnction`| `-`         | Drag handle selector within list items |
| `group`           | `String/Object`   | `-`         | string: 'name' or object: `{ name: 'group', put: true/false, pull: true/false }` |
| `multiple`        | `Boolean`         | `false`     | Enable multiple drag |
| `animation`       | `Number`          | `150`       | Animation speed moving items when sorting |
| `onDrag`          | `Function`        | `-`         | The callback function when the drag is started |
| `onMove`          | `Function`        | `-`         | The callback function when the dragged element is moving |
| `onDrop`          | `Function`        | `-`         | The callback function when the drag is completed |
| `onAdd`           | `Function`        | `-`         | The callback function when element is dropped into the list from another list |
| `onRemove`        | `Function`        | `-`         | The callback function when element is removed from the list into another list |
| `onChange`        | `Function`        | `-`         | The callback function when the dragged element changes position in the list |
| `onSelect`        | `Function`        | `-`         | The callback function when element is selected |
| `onDeselect`      | `Function`        | `-`         | The callback function when element is unselected |


**Virtual options**

|     **Option**    |      **Type**     | **Default** | **Description** |
|-------------------|-------------------|-------------|--------------|
| `virtual`         | `Boolean`         | `false`     | Support for virtual lists if set to `true` |
| `scroller`        | `HTMLElement`     | `-`         | Virtual list scrolling element |
| `dataKeys`        | `Array`           | `[]`        | The unique key values of all items in the list |
| `keeps`           | `Number`          | `30`        | The number of lines rendered by the virtual scroll |
| `size`            | `Number`          | `-`         | The estimated height of each piece of data |
| `headerSize`      | `Number`          | `0`         | Top height value to be ignored |
| `direction`       | `String`          | `vertical`  | `vertical/horizontal`, scroll direction |


**Others**

|     **Option**    |      **Type**     | **Default** | **Description** |
|-------------------|-------------------|-------------|--------------|
| `disabled`        | `Boolean`         | `false`     | Disables the sortable if set to true |
| `chosenClass`     | `String`          | `''`        | Class name for the dragging item |
| `selectedClass`   | `String`          | `''`        | The class of the element when it is selected, it is usually used when multiple drag |
| `ghostStyle`      | `Object`          | `{}`        | The style of the mask element when dragging |
| `ghostClass`      | `String`          | `''`        | The class of the mask element when dragging |
| `autoScroll`      | `Boolean`         | `true`      | Automatic scrolling when moving to the edge of the container |
| `scrollThreshold` | `Number`          | `55`        | Threshold to trigger autoscroll |
| `delay`           | `Number`          | `0`         | Time in milliseconds to define when the sorting should start |
| `delayOnTouchOnly`| `Boolean`         | `false`     | Only delay if user is using touch |
| `fallbackOnBody`  | `Boolean`         | `false`     | Appends the cloned DOM Element into the Document's Body |
| `stopPropagation` | `Boolean`         | `false`     | The `stopPropagation()` method of the Event interface prevents further propagation of the current event in the capturing and bubbling phases |
| `swapOnDrop`      | `Boolean`         | `true`      | When the value is false, the dragged element will return to the starting position of the drag |

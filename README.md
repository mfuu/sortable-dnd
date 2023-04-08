[![npm](https://img.shields.io/npm/v/sortable-dnd.svg)](https://www.npmjs.com/package/sortable-dnd)  [![npm](https://img.shields.io/npm/dt/sortable-dnd.svg)](https://npm-stat.com/charts.html?package=sortable-dnd)  [![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)



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

var DND = new Sortable(
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
    onSelect: ({ group, target, event }) => {
      // code
    },
    onDeselect: ({ group, target, event }) => {
      // code
    }
  }
)
```

## Methods

| **Method**   | **Description** |
|--------------|--------------|
| `destroy()`  | Manually clear all the state of the component, using this method the component will not be draggable |


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


**Others**

|     **Option**    |      **Type**     | **Default** | **Description** |
|-------------------|-------------------|-------------|--------------|
| `disabled`        | `Boolean`         | `false`     | Disables the sortable if set to true |
| `chosenClass`     | `String`          | `''`        | Class name for the dragging item |
| `selectedClass`   | `String`          | `''`        | The class of the element when it is selected, it is usually used when multiple drag |
| `ghostStyle`      | `Object`          | `{}`        | The style of the mask element when dragging |
| `ghostClass`      | `String`          | `''`        | The class of the mask element when dragging |
| `autoScroll`      | `Boolean`         | `true`      | Automatic scrolling when moving to the edge of the container |
| `scrollThreshold` | `Number`          | `25`        | Threshold to trigger autoscroll |
| `delay`           | `Number`          | `0`         | Time in milliseconds to define when the sorting should start |
| `delayOnTouchOnly`| `Boolean`         | `false`     | Only delay if user is using touch |
| `fallbackOnBody`  | `Boolean`         | `false`     | Appends the cloned DOM Element into the Document's Body |
| `stopPropagation` | `Boolean`         | `false`     | The `stopPropagation()` method of the Event interface prevents further propagation of the current event in the capturing and bubbling phases |

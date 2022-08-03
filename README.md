<p>
  <a href="https://npm-stat.com/charts.html?package=sortable-dnd">
    <img alt="Downloads" src="https://img.shields.io/npm/dm/sortable-dnd.svg">
  </a>
  <a href="https://www.npmjs.com/package/sortable-dnd">
    <img alt="Version" src="https://img.shields.io/npm/v/sortable-dnd.svg"/>
  </a>
</p>



A JS Library for Drag and Drop, supports Sortable and Draggable

## [Demo](https://mfuu.github.io/sortable-dnd/)

# Usage

**HTML**
```html
<ul id="group">
  <li>
    <i class="drag">drag me</i>
    <p>1</p>
  </li>
  <li>
    <i class="drag">drag me</i>
    <p>2</p>
  </li>
  <li>
    <i class="drag">drag me</i>
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
    draggable: (e) => e.target.tagName === 'I' ? true : false, // use function
    // draggable: 'i' // use tagName 
    // draggable: '.drag' // use class
    // draggable: '#drag' // use id
    // draggable: (e) => e.target.parentNode // use fundtion to set drag Element
    onDrag: ({ dragEl, event, originalEvent }) => {
      // code
    },
    onMove: ({ from, ghostEl, event, originalEvent }) => {
      // code
    },
    onDrop: ({ changed, event, originalEvent }) => {
      // code
    },
    onChange: ({ from, to, event, originalEvent }) => {
      // code
    }
  }
)
```

# Methods

| **Method** | **Description** |
|--------------|--------------|
| `destroy()` | Manually clear all the state of the component, using this method the component will not be draggable |


# Options

**Common used**

|     **Option**    |      **Type**     | **Default** | **Description** |
|-------------------|-------------------|-------------|--------------|
| `draggable`       | `String/Function` | `undefined` | Specifies which items inside the element should be draggable |
| `group`           | `String/Object`   | `-`         | string: 'name' or object: `{ name: 'group', put: true/false, pull: true/false }` |
| `onDrag`          | `Function`        | `undefined` | The callback function when the drag is started |
| `onMove`          | `Function`        | `undefined` | The callback function when the dragged element is moving |
| `onDrop`          | `Function`        | `undefined` | The callback function when the drag is completed |
| `onChange`        | `Function`        | `undefined` | The callback function when the dragged element changes position |
| `animation`       | `Number`          | `150`       | Animation speed moving items when sorting |
| `disabled`        | `Boolean`         | `false`     | Disables the sortable if set to true |


**Others**

|     **Option**    |      **Type**     | **Default** | **Description** |
|-------------------|-------------------|-------------|--------------|
| `autoScroll`      | `Boolean`         | `true`      | Automatic scrolling when moving to the edge of the container, **for browsers that do not support HTML5 drag events** |
| `scrollStep`      | `Number`          | `5`         | The distance to scroll each frame when autoscrolling |
| `scrollThreshold` | `Number`          | `15`        | Threshold to trigger autoscroll |
| `delay`           | `Number`          | `0`         | time in milliseconds to define when the sorting should start |
| `delayOnTouchOnly`| `Boolean`         | `false`     | only delay if user is using touch |
| `chosenClass`     | `String`          | `{}`        | The class of the selected element when dragging |
| `ghostStyle`      | `Object`          | `{}`        | The style of the mask element when dragging |
| `ghostClass`      | `String`          | `''`        | The class of the mask element when dragging |
| `forceFallback`   | `Boolean`         | `false`     | true: ignore the HTML5 DnD behaviour and force the fallback to kick in |
| `stopPropagation` | `Boolean`         | `false`     | The `stopPropagation()` method of the Event interface prevents further propagation of the current event in the capturing and bubbling phases |

# LICENSE

[MIT](https://github.com/mfuu/sortable-dnd/blob/main/LICENSE)
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
    // dragging: (e) => e.target.parentNode // set dragging HTMLElement
    onDrag: (dragEl, event, originalEvent) => {
      // code
    },
    onMove: (from, ghostEl, event, originalEvent) => {
      // code
    },
    onDrop: (changed, /* originalEvent */event) => {
      // code
    },
    onChange: (from, to, event, originalEvent) => {
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
| `animation`       | `Number`          | `150`       | Animation speed moving items when sorting |
| `draggable`       | `String/Function` | `undefined` | Specifies which items inside the element should be draggable, the function type must return a boolean |
| `onDrag`          | `Function`        | `undefined` | The callback function when the drag is started |
| `onMove`          | `Function`        | `undefined` | The callback function when the dragged element is moving |
| `onDrop`          | `Function`        | `undefined` | The callback function when the drag is completed |
| `onChange`        | `Function`        | `undefined` | The callback function when the dragged element changes position |
| `autoScroll`      | `Boolean`         | `true`      | Automatic scrolling when moving to the edge of the container, **for browsers that do not support HTML5 drag events** |
| `scrollStep`      | `Number`          | `5`         | The distance to scroll each frame when autoscrolling |
| `scrollThreshold` | `Number`          | `15`        | Threshold to trigger autoscroll |


**Others**

|     **Option**    |      **Type**     | **Default** | **Description** |
|-------------------|-------------------|-------------|--------------|
| `disabled`        | `Boolean`         | `false`     | Disables the sortable if set to true |
| `delay`           | `Number`          | `0`         | time in milliseconds to define when the sorting should start |
| `delayOnTouchOnly`| `Boolean`         | `false`     | only delay if user is using touch |
| `ghostAnimation`  | `Number`          | `0`         | Ghost element animation delay before destroyed |
| `ghostStyle`      | `Object`          | `{}`        | The style of the mask element when dragging |
| `ghostClass`      | `String`          | `''`        | The class of the mask element when dragging |
| `chosenClass`     | `String`          | `{}`        | The class of the selected element when dragging |
| `forceFallback`   | `Boolean`         | `false`     | true: ignore the HTML5 DnD behaviour and force the fallback to kick in |
| `stopPropagation` | `Boolean`         | `false`     | The `stopPropagation()` method of the Event interface prevents further propagation of the current event in the capturing and bubbling phases |


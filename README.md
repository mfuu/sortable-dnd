# sortable-dnd

[![npm](https://img.shields.io/npm/v/sortable-dnd.svg)](https://www.npmjs.com/package/sortable-dnd)  [![npm](https://img.shields.io/npm/dm/sortable-dnd.svg)](https://npm-stat.com/charts.html?package=sortable-dnd)  [![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)



A JS Library for Drag and Drop, supports Sortable and Draggable

### [Live Demo](https://mfuu.github.io/sortable-dnd/)

## Usage

**Install**
```node
npm install sortable-dnd --save
```

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
    draggable: (e) => e.target.tagName === 'LI' ? true : false, // use function
    // draggable: 'li' // use tagName 
    // draggable: '.item' // use class
    // draggable: '#item' // use id
    // draggable: (e) => e.target // use function to set drag Element
    handle: (e) => e.target.tagName === 'I' ? true : false, // use function
    // handle: 'I', // use tagName
    // handle: '.handle', // use class
    // handle: '#handle', // use id
    chosenClass: 'chosen',
  }
)
```


## Options

**Common used**

|     **Option**    |      **Type**     | **Default** | **Description** |
|-------------------|-------------------|-------------|--------------|
| `draggable`       | `String/Function` | `-`         | Specifies which items inside the element should be draggable |
| `handle`          | `String/Funnction`| `-`         | Drag handle selector within list items |
| `group`           | `String/Object`   | `-`         | string: 'name' or object: `{ name: 'group', put: true/false, pull: true/false }` |
| `multiple`        | `Boolean`         | `false`     | Enable multiple drag |
| `animation`       | `Number`          | `150`       | Animation speed moving items when sorting |
| `onDrag`          | `Function`        | `-`         | Triggered when drag is started |
| `onMove`          | `Function`        | `-`         | Triggered when the dragged element is moving |
| `onDrop`          | `Function`        | `-`         | Triggered when drag is completed |
| `onAdd`           | `Function`        | `-`         | Triggered when the element is dropped into the list from another |
| `onRemove`        | `Function`        | `-`         | Triggered when the element is removed from the list into another |
| `onChange`        | `Function`        | `-`         | Triggered when the dragged element changes position in the list |
| `onSelect`        | `Function`        | `-`         | Triggered when the element is selected |
| `onDeselect`      | `Function`        | `-`         | Triggered when the element is unselected |


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
| `onScroll`        | `Function`        | `-`         | Triggered when the virtual list is scrolled |
| `onCreate`        | `Function`        | `-`         | Triggered when the virual list created |
| `onUpdate`        | `Function`        | `-`         | Triggered when the rendering parameters of the virtual list changed |


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


## Methods

```js
var sortable = new Sortable(el);

sortable.destroy() // Manually clear all the state of the component, using this method the component will not be draggable

sortable.option(key, value?) // Get or set the option value, depending on whether the `value` is passed in

sortable.getSelectedElements() // Get the selected elements in the list, the return value is available in the case of `multiple`

sortable.virtual {
  updateRange() // Recalculate the range. The `onUpdate` will be triggered after the calculation is completed
  isFront() // Current scrolling direction is top/left
  isBehind() // Current scrolling direction is down/right
  getSize(dataKey: String | Number) // Git item size by data-key
  getOffset() // Get the current scroll height/width
  getClientSize() // Get client viewport size
  getScrollSize() // Get the current scrolling distance
  scrollToBottom() // Scroll to bottom of list
  scrollToOffset(offset: Number) // Scroll to the specified offset
  scrollToIndex(index: Number) // Scroll to the specified index position
}
```

**Static methods & properties**

```ts
import Sortable from 'sortable-dnd';

Sortable.create(el: HTMLElement, options: Options) // Create new instance

Sortable.get(el: HTMLElement) // Get the Sortable instance of an element

Sortable.dragged // The element being dragged

Sortable.ghost // The ghost element

Sortable.utils {
  on(el:HTMLElement, event:String, fn:Function) // attach an event handler function
  off(el:HTMLElement, event:String, fn:Function) // remove an event handler
  css(el:HTMLElement, prop:String, value:String) // set one CSS properties
  closest(element: HTMLElement, selector: string, context: HTMLElement, includeContext: Boolean) // For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
  toggleClass(element: HTMLElement, name: string, state: boolean) // Add or remove one classes from each element
}
```

# sortable-dnd

[![npm](https://img.shields.io/npm/v/sortable-dnd.svg)](https://www.npmjs.com/package/sortable-dnd)  [![npm](https://img.shields.io/npm/dm/sortable-dnd.svg)](https://npm-stat.com/charts.html?package=sortable-dnd)  [![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)


A JS Library for Drag and Drop, supports Sortable-Draggable and Virtual-List

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

let sortable = new Sortable(
  document.getElementById('group'),
  {
    // draggable: 'li', // use tagName 
    // draggable: '#item', // use id
    // draggable: (e) => e.target, // set the drag Element
    // draggable: (e) => e.target.tagName === 'LI' ? true : false, // use function
    draggable: '.item', // use class
    // handle: 'I', // use tagName
    // handle: '#handle', // use id
    // handle: (e) => e.target.tagName === 'I' ? true : false, // use function
    handle: '.handle', // use class
  }
)
```

## Use Virtual
```js
import { Sortable, Virtual } from 'sortable-dnd'

let list = [
  { id: 1, text: 'a' },
  { id: 2, text: 'b' },
  { id: 3, text: 'c' },
  ...
];

let sortable = new Sortable(element);

let virtual = new Virtual({
  scroller: document,
  dataKeys: list.map(item => item.id)
});

sortable.mount(virtual);
```

## Options

```js
new Sortable(element, {
  draggable: '', // Specifies which items inside the element should be draggable
  handle: '', // Drag handle selector within list items
  group: '', // string: 'name' or object: `{ name: 'group', put: true/false, pull: true/false }`
  multiple: false, // Enable multiple drag
  animation: 150, // Animation speed moving items when sorting
  chosenClass: '', // Class name for the dragging item
  selectedClass: '', // The class of the element when it is selected, it is usually used when multiple drag
  ghostStyle: {}, // The style of the mask element when dragging
  ghostClass: '', // The class of the mask element when dragging

  disabled: false, // Disables the sortable if set to true
  autoScroll: true, // Automatic scrolling when moving to the edge of the container
  scrollThreshold: 55, // Threshold to trigger autoscroll
  scrollSpeed: { x: 10, y: 10 }, // Vertical&Horizontal scrolling speed (px)
  delay: 0, // Time in milliseconds to define when the sorting should start
  delayOnTouchOnly: false, // Only delay if user is using touch
  fallbackOnBody: false, // Appends the ghost element into the document's body
  swapOnDrop: true, // When the value is false, the dragged element will return to the starting position of the drag

  // callback functions
  onDrag: ({ from, event }) => {
    // Triggered when drag is started
  },
  onMove: ({ from, event }) => {
    // Triggered when the dragged element is moving
  },
  onDrop: ({ from, to, changed, event }) => {
    // Triggered when drag is completed
  },
  onAdd: ({ from, to, event }) => {
    // Triggered when the element is dropped into the list from another
  },
  onRemove: ({ from, to, event }) => {
    // Triggered when the element is removed from the list into another
  },
  onChange: ({ from, to, event }) => {
    // Triggered when the dragged element changes position in the list
  },
  onSelect: (params) => {
    // Triggered when an element is selected by clicking the mouse
  },
  onDeselect: (params) => {
    // Triggered when an element is unselected by clicking the mouse
  },
})
```

**Virtual List Options**

```js
new Sortable.Virtual({
  scroller: null, // Virtual list scrolling element
  dataKeys: [], // The unique key values of all items in the list
  dataKey: 'data-key', // HTML data attributes
  keeps: 30, // The number of lines rendered by the virtual scroll
  size: null, // The estimated height of each piece of data
  headerSize: 0, // Top height value to be ignored
  direction: 'vertical', // `vertical/horizontal`, scroll direction

  onCreate: (range) => {
    // This event is triggered only once during `sortable.mount()`
  },
  onUpdate: (range) => {
    // Triggered when the rendering params changed
  },
  onScroll: ({ offset, top, bottom }) => {
    // Triggered when the virtual list scroller is scrolled
    if (top === true) {
      // scrolled to the top of list
    }
    if (bottom === true) {
      // scrolled to the bottom of list
    }
  },
})
```


## Methods

```js
let sortable = new Sortable(el);
```

```js
// Mounting a plug-in
sortable.mount(plugin);

// Unmount a plug-in
sortable.unmount(plugin);

// Manually clear all the state of the component, using this method the component will not be draggable
sortable.destroy();

// Get or set the option value, depending on whether the `value` is passed in
sortable.option(key, value?);

// Get the selected elements in the list, the return value is available in the case of `multiple`
sortable.getSelectedElements();
```

**Virtual List Methods**

```js
let virtual = new Sortable.Virtual();
```

```js
// Get or set the option value, depending on whether the `value` is passed in
virtual.option(key, value?);

// Recalculate the range. The `onUpdate` will be triggered after the calculation is completed
virtual.updateRange();

// Updates the size of a specified node
virtual.updateItemSize();

// Git item size by `dataKey`
virtual.getSize(dataKey: String | Number);

// Get the current scroll size (scrollLeft / scrollTop)
virtual.getOffset();

// Get the scroll element's size (clientWidth / clientHeight)
virtual.getClientSize();

// Get the current scrolling distance (scrollWidth / scrollHeight)
virtual.getScrollSize();

// Scroll to bottom of list
virtual.scrollToBottom();

// Scroll to the specified offset
virtual.scrollToOffset(offset: Number);

// Scroll to the specified index position
virtual.scrollToIndex(index: Number);
```

## Static Methods & Properties

```js
import Sortable from 'sortable-dnd';
```

```js
Sortable.create(el: HTMLElement, options: Options); // Create new instance

Sortable.get(el: HTMLElement); // Get the Sortable instance of an element

Sortable.dragged; // The element being dragged

Sortable.ghost; // The ghost element
```

**Utils**
 
```js
// attach an event handler function
Sortable.utils.on(el: HTMLElement, event: String, fn: Function);

// remove an event handler
Sortable.utils.off(el: HTMLElement, event: String, fn: Function);

// set one CSS properties
Sortable.utils.css(el: HTMLElement, prop: String, value: String);

// Returns the index of an element within its parent for a selected set of elements
Sortable.utils.index(el: HTMLElement, selector: String);

// For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
Sortable.utils.closest(el: HTMLElement, selector: String, context: HTMLElement, includeContext: Boolean);

// Get element's offet in given parentNode
Sortable.utils.getOffset(element: HTMLElement, parentEl: HTMLElement);

// Add or remove one classes from each element
Sortable.utils.toggleClass(el: HTMLElement, name: String, state: Boolean);
```

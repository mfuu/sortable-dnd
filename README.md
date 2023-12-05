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

## Options

```js
new Sortable(element, {
  draggable: '', // Specifies which items inside the element should be draggable
  handle: '', // Drag handle selector within list items
  group: '', // string: 'name' or object: `{ name: 'group', put: true/false, pull: true/false }`
  multiple: false, // Enable multiple drag
  selectHandle: '', // Handle selector within list items which used to select element in `multiple: true`
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

## Methods

```js
let sortable = new Sortable(el);

// Manually clear all the state of the component, using this method the component will not be draggable
sortable.destroy();

// Get or set the option value, depending on whether the `value` is passed in
sortable.option(key, value?);

// Get the selected elements in the list, the return value is available in the case of `multiple`
sortable.getSelectedElements();
```

## Static Methods & Properties

```ts
import Sortable from 'sortable-dnd';

Sortable.create(el: HTMLElement, options: Options); // Create new instance

Sortable.get(el: HTMLElement); // Get the Sortable instance of an element

Sortable.dragged; // The element being dragged

Sortable.ghost; // The ghost element

Sortable.active; // Active Sortable instance
```

**Utils**
 
```ts
const { on, off, css, index, closest, getOffset, toggleClass } = Sortable.utils;

// attach an event handler function
on(el: HTMLElement, event: String, fn: Function);

// remove an event handler
off(el: HTMLElement, event: String, fn: Function);

// set one CSS properties
css(el: HTMLElement, prop: String, value: String);

// Returns the index of an element within its parent for a selected set of elements
index(el: HTMLElement, selector: String);

// For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
closest(el: HTMLElement, selector: String, context: HTMLElement, includeContext: Boolean);

// Get element's offet in given parentNode
getOffset(element: HTMLElement, parentEl: HTMLElement);

// Add or remove one classes from each element
toggleClass(el: HTMLElement, name: String, state: Boolean);
```

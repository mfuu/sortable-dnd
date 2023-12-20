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
  group: '', // see @Group
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
  store: null, // store data

  customGhost: (nodes) => {
    // Customize the ghost element in drag
    // you must return an HTMLElement 
  },

  onChoose: (params) => {
    // Element is chosen
    // see @Params
  },
  onUnchoose: () => {
    // Element is unchosen
    // see @Params
  },
  onDrag: (params) => {
    // Triggered when drag is started
    // see @Params
  },
  onMove: (params) => {
    // Triggered when the dragged element is moving
    // see @Params
  },
  onDrop: (params) => {
    // Triggered when drag is completed
    // see @Params
  },
  onRevert: (params) => {
    // revert drag element after moving to a another list in `pull: clone` & `revertDrag: true`
    // see @Params
  },
  onAdd: (params) => {
    // Triggered when the element is dropped into the list from another
    // see @Params
  },
  onRemove: (params) => {
    // Triggered when the element is removed from the list into another
    // see @Params
  },
  onChange: (params) => {
    // Triggered when the dragged element changes position in the list
    // see @Params
  },
  onSelect: (params) => {
    // Triggered when an element is selected by clicking the mouse
    // see @Select
  },
  onDeselect: (params) => {
    // Triggered when an element is unselected by clicking the mouse
    // see @Select
  },
})
```

**Group**

```js
// string
group: 'name',

// object
group: {
  name: 'group', // group name
  put: true | false | ['foo', 'bar'], // whether elements can be added from other lists, or an array of group names from which elements can be taken.
  pull: true | false | 'clone', // whether elements can be moved out of this list.
  revertDrag: true | false, // revert drag element to initial position after moving to a another list.
}
```

**Params**

```js
let {
  from, // previous list
  to, // list, in which moved element.
  node, // dragged element
  nodes, // dragged elements
  clone, // cloned element, all dnd operations are based on cloned element and do not alter the source dom(node).
  clones, // cloned elements, there is a value only in the `pull: clone` after moving to a another list.
  target, // drop element
  oldIndex, // old index within parent
  newIndex, // new index within parent
  event, // TouchEvent | MouseEvent
  pullMode, // Pull mode if dragging into another sortable.
  relative, // Position of the drop element relative to the drag element after swap is complete.
  revert, // back to the original list in `pull: 'clone'`
} = params
```

**Select**

```js
let {
  event, // TouchEvent | MouseEvent
  index, // index within parent
  node, // dragged element
  from, // list container
} = params
```

## Methods

```js
let sortable = new Sortable(el);

// Manually clear all the state of the component, using this method the component will not be draggable
sortable.destroy();

// Get or set the option value, depending on whether the `value` is passed in
sortable.option(key, value?);

// Selects the provided multi-drag item
sortable.select(element);

// Deselects the provided multi-drag item
sortable.deselect(element);

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
const { on, off, css, index, closest, getRect, toggleClass } = Sortable.utils;

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

// Returns the "bounding client rect" of given element
getRect(element: HTMLElement, relativeToContainingBlock: boolean, container: HTMLElement);

// Add or remove one classes from each element
toggleClass(el: HTMLElement, name: String, state: Boolean);
```

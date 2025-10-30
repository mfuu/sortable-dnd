# sortable-dnd

[![npm](https://img.shields.io/npm/v/sortable-dnd.svg)](https://www.npmjs.com/package/sortable-dnd) [![npm](https://img.shields.io/npm/dm/sortable-dnd.svg)](https://npm-stat.com/charts.html?package=sortable-dnd) [![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)

A JS Library for Drag and Drop, supports Sortable and Draggable

### [Live Demo](https://mfuu.github.io/sortable-dnd/)

## Usage

**Install**

```node
npm install sortable-dnd
```

**HTML**

```html
<ul id="group">
  <li>1</li>
  <li>2</li>
  <li>3</li>
  <li>4</li>
  <li>5</li>
</ul>
```

**JavaScript**

```js
import Sortable from 'sortable-dnd';

let sortable = new Sortable(document.getElementById('group'));
```

## Options

```js
new Sortable(element, {
  store: null, // store data
  draggable: '>*', // Specifies which items inside the element should be draggable
  handle: '', // Drag handle selector within list items
  group: '', // see @Group
  lockAxis: '', // Axis on which dragging will be locked

  easing: '', // Easing for animation
  direction: '', // Direction of Sortable, will be detected automatically if not given
  animation: 150, // ms, animation speed moving items when sorting, `0` — without animation
  chosenClass: '', // Class name for the chosen item
  placeholderClass: '', // Class name for the drop placeholder
  ghostStyle: {}, // Style object for the ghost element
  ghostClass: '', // Class name for the ghost element

  sortable: true, // Whether the current list can be sorted by dragging
  disabled: false, // Disables the sortable if set to true
  autoScroll: true, // Automatic scrolling when moving to the edge of the container
  scrollThreshold: 55, // Threshold to trigger autoscroll
  scrollSpeed: { x: 10, y: 10 }, // Vertical&Horizontal scrolling speed (px)
  delay: 0, // Time in milliseconds to define when the sorting should start
  delayOnTouchOnly: false, // Only delay if user is using touch
  touchStartThreshold: 1, // How many *pixels* the point should move before cancelling a delayed drag event
  emptyInsertThreshold: -1, // Distance mouse must be from empty sortable to insert drag element into it
  appendToBody: false, // Appends the ghost element into the document's body
  swapOnDrop: true, // Whether to place the dragEl in the drop position after the drag is complete
  removeCloneOnDrop: true, // Whether to remove the cloneEl after the drag is complete
  dropOnAnimationEnd: false, // Trigger the `onDrop` event when the animation is complete

  customGhost: (node) => {
    // Customize the ghost element in drag
    // you must return an HTMLElement

    // example:
    const div = document.createElement('div');
    return div;
  },

  // Element is chosen
  onChoose: (event) => {
    // see @SortableEvent
  },

  // Element is unchosen
  onUnchoose: (event) => {
    // see @SortableEvent
  },

  // Element dragging started
  onDrag: (event) => {
    // see @SortableEvent
  },

  // Move an item in the list or between lists
  onMove: (event) => {
    // see @SortableEvent
  },

  // Element dragging is completed
  onDrop: (event) => {
    // see @SortableEvent
  },

  // Element is dropped into the current list from another (in the process of dragging)
  onAdd: (event) => {
    // see @SortableEvent
  },

  // Element is removed from the current list into another (in the process of dragging)
  onRemove: (event) => {
    // see @SortableEvent
  },

  // Dragging element changes position in the current list (in the process of dragging)
  onChange: (event) => {
    // see @SortableEvent
  },
});
```

**Group**

```js
// string
group: 'name',

// object
group: {
  name: 'group', // group name

  // whether elements can be added from other lists,
  // or an array of group names from which elements can be taken.
  put: true | false | ['group1', 'group2'],

  // whether elements can be moved out of this list.
  pull: true | false | 'clone',

  // revert drag element to initial position after moving to a another list.
  revertDrag: true | false,
}
```

**SortableEvent**

```js
event.from; // previous list
event.to; // list of currently placed drag element
event.node; // dragged element
event.clone; // cloned element, all dnd operations are based on cloned element and do not alter the source dom(dragEl).
event.target; // drop element
event.oldIndex; // old index within parent. `-1`: element added from another list to the current list
event.newIndex; // new index within parent. `-1`: element has been removed from the current list
event.event; // TouchEvent | MouseEvent
event.pullMode; // Pull mode if dragging into another sortable.
event.relative; // Position of the drop element relative to the drag element after swap is complete.
event.revertDrag; // revert draged element to initial position after moving to a another list on `{ pull: 'clone', revertDrag: true }`.
event.backToOrigin; // dragged element go back to the original list on `pull: 'clone'`.
```

## Methods

```js
let sortable = new Sortable(el);

// Manually clear all the state of the component, using this method the component will not be draggable
sortable.destroy();

// Get or set the option value, depending on whether the `value` is passed in
sortable.option(key, value?);
```

## Static Methods & Properties

```ts
import Sortable from 'sortable-dnd';

Sortable.create(el: HTMLElement, options: SortableOptions); // Create new instance

Sortable.get(el: HTMLElement); // Get the Sortable instance of an element

Sortable.dragged; // The element being dragged

Sortable.clone; // The clone element

Sortable.ghost; // The ghost element

Sortable.active; // Active Sortable instance
```

**Utils**

```ts
import Sortable from 'sortable-dnd';
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

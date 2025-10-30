# Options

## `draggable`

| **Type** | **Default** |
| -------- | ----------- |
| `String` | `'>*'`      |

Specifies which items inside the element should be draggable.

```js
new Sortable(document.getElementById('group'), {
  // draggable: 'li', // use tagName
  // draggable: '#item', // use id
  // draggable: '>div', // use css selector
  // draggable: '.item', // use class
  draggable: '>*',
});
```

## `handle`

| **Type**             | **Default** |
| -------------------- | ----------- |
| `String \| Function` | `''`        |

Drag handle selector within list items.

```js
new Sortable(document.getElementById('group'), {
  // handle: 'I', // use tagName
  // handle: '#handle', // use id
  // handle: (e) => e.target.tagName === 'I' ? true : false, // use function
  // handle: '.handle', // use class
  handle: '',
});
```

## `group`

| **Type**           | **Default** |
| ------------------ | ----------- |
| `String \| Object` | `''`        |

To drag elements from one list into another, both lists must have the same group value.

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

  // whether to revert the drag element to its initial position after clone to a another list.
  revertDrag: true | false,
}
```

## `lockAxis`

| **Type**     | **Default** |
| ------------ | ----------- |
| `'x' \| 'y'` | `''`        |

Axis on which dragging will be locked.

## `sortable`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `true`      |

Whether the current list can be sorted by dragging.

## `disabled`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `false`     |

Disables the sortable if set to true.

## `store`

| **Type** | **Default** |
| -------- | ----------- |
| `any`    | `null`      |

store any data you want.

```js
sortable.option('store', value); // store value
sortable.option('store'); // get the stored value
```

## `autoScroll`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `true`      |

Automatic scrolling when moving to the edge of the container.

## `scrollThreshold`

| **Type** | **Default** |
| -------- | ----------- |
| `Number` | `55`        |

Threshold to trigger autoScroll.

## `scrollSpeed`

| **Type** | **Default**        |
| -------- | ------------------ |
| `Object` | `{ x: 10, y: 10 }` |

Vertical & Horizontal scrolling speed (px)

## `direction`

| **Type** | **Default** |
| -------- | ----------- |
| `String` | `''`        |

Direction of Sortable, will be detected automatically if not given.

## `easing`

| **Type** | **Default** |
| -------- | ----------- |
| `String` | `''`        |

Easing for animation. See https://easings.net/ for examples.

For other possible values, see https://www.w3schools.com/cssref/css3_pr_animation-timing-function.asp

## `animation`

| **Type** | **Default** |
| -------- | ----------- |
| `Number` | `150`       |

ms, animation speed moving items when sorting, `0` — without animation.

## `delay`

| **Type** | **Default** |
| -------- | ----------- |
| `Number` | `0`         |

Time in milliseconds to define when the drag should start.

## `delayOnTouchOnly`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `false`     |

Only delay if user is using touch.

## `touchStartThreshold`

| **Type** | **Default** |
| -------- | ----------- |
| `Number` | `1`         |

How many *pixels* the point should move before cancelling a delayed drag event.

## `emptyInsertThreshold`

| **Type** | **Default** |
| -------- | ----------- |
| `Number` | `-1`        |

Distance mouse must be from empty sortable to insert drag element into it.

## `appendToBody`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `false`     |

Appends the ghost element into the document's body.

## `swapOnDrop`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `true`      |

Whether to place the dragEl in the drop position after the drag is complete.

- `true`  : The dragEl will be placed in the drop position after the drag is complete.
- `false` : The dragEl will not move to the drop position (used for virtual-list).

## `removeCloneOnDrop`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `true`      |

Whether to remove the cloneEl after the drag is complete.

## `dropOnAnimationEnd`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `false`     |

Trigger the `onDrop` event when the animation is complete.

## `customGhost`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Customize the ghost element in drag.

```js
new Sortable(element, {
  customGhost: (nodes) => {
    // you must return an HTMLElement

    // example:
    const div = document.createElement('div');
    return div;
  },
});
```

## `chosenClass`

| **Type** | **Default** |
| -------- | ----------- |
| `String` | `''`        |

Class name for the chosen item.

## `placeholderClass`

| **Type** | **Default** |
| -------- | ----------- |
| `String` | `''`        |

Class name for the drop placeholder.

## `ghostClass`

| **Type** | **Default** |
| -------- | ----------- |
| `String` | `''`        |

Class name for the ghost element.

## `ghostStyle`

| **Type** | **Default** |
| -------- | ----------- |
| `Object` | `{}`        |

Style object for the ghost element.

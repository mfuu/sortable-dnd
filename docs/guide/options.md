# Configuration Options

Customize the drag-and-drop behavior, styling, scrolling, and callbacks of Sortable-dnd using configuration options.

## `draggable`

| **Type** | **Default** |
| -------- | ----------- |
| `string` | `'>*'`      |

A CSS selector string specifying which child items inside the container should be draggable.

```js
new Sortable(document.getElementById('group'), {
  // draggable: 'li',     // Match tag name
  // draggable: '#item',   // Match specific element by ID
  // draggable: '>div',    // Match immediate div child elements
  // draggable: '.item',   // Match class name
  draggable: '>*',         // Default: match all immediate children
});
```

## `handle`

| **Type**             | **Default** |
| -------------------- | ----------- |
| `string \| Function` | `''`        |

A CSS selector string or custom callback function defining the drag handle within list items. Dragging can only be initiated from handles matching this option.

```js
new Sortable(document.getElementById('group'), {
  // handle: 'i',          // Only allow dragging via <i> elements
  // handle: '#handle',     // Only allow dragging via elements with ID 'handle'
  // handle: '.handle',     // Only allow dragging via class '.handle'
  // handle: (e) => e.target.tagName === 'I', // Custom function evaluation
  handle: '',              // Default: the entire item acts as a handle
});
```

## `group`

| **Type**           | **Default** |
| ------------------ | ----------- |
| `string \| Object` | `''`        |

Allows dragging elements between different lists. To drag and sort elements between multiple lists, both containers must share the same group config name.

```js
// Simple string notation
group: 'shared-list-name',

// Advanced object configuration
group: {
  name: 'shared-list-name', // Shared group name

  // Whether elements can be added to this list from other lists:
  // - true: allow elements from any group.
  // - false: block items from being dropped here.
  // - Array of strings: allow drops only from listed group names.
  put: true | false | ['group1', 'group2'],

  // Whether elements can be moved out of this list:
  // - true: allow items to be dragged out.
  // - false: block items from being dragged out.
  // - 'clone': copy items during drag rather than moving them out.
  pull: true | false | 'clone',

  // Whether to return the dragged element to its starting position after moving to another list when pull is 'clone'.
  revertDrag: true | false,
}
```

## `lockAxis`

| **Type**     | **Default** |
| ------------ | ----------- |
| `'x' \| 'y'` | `''`        |

Locks the drag movement along a specific coordinate axis.

- `'x'`: Restrict dragging to the horizontal axis.
- `'y'`: Restrict dragging to the vertical axis.

## `sortable`

| **Type**  | **Default** |
| --------- | ----------- |
| `boolean` | `true`      |

Whether elements inside the current container can be sorted by dragging them around. Set to `false` to disable inner-list reordering (useful for purely transferring items between lists).

## `disabled`

| **Type**  | **Default** |
| --------- | ----------- |
| `boolean` | `false`     |

Disables the Sortable instance completely when set to `true`.

## `store`

| **Type** | **Default** |
| -------- | ----------- |
| `any`    | `null`      |

A custom state/data storage utility. Useful for state synchronization or external storage.

```js
// Save data to store
sortable.option('store', someData);

// Retrieve data from store
const storedData = sortable.option('store');
```

## `autoScroll`

| **Type**  | **Default** |
| --------- | ----------- |
| `boolean` | `true`      |

Enables automatic container/page scrolling when the dragged item is held near the boundaries.

## `scrollThreshold`

| **Type** | **Default** |
| -------- | ----------- |
| `number` | `55`        |

The distance (in pixels) from the container's edges that the pointer must reach to trigger automatic scrolling.

## `scrollSpeed`

| **Type**      | **Default**        |
| ------------- | ------------------ |
| `ScrollSpeed` | `{ x: 10, y: 10 }` |

The speed of automatic scrolling along the X and Y axes (in pixels per frame).

## `direction`

| **Type** | **Default** |
| -------- | ----------- |
| `string` | `''`        |

Specifies the layout direction of the list (e.g. `'vertical'` or `'horizontal'`). Automatically detected from styles if not specified.

## `easing`

| **Type** | **Default** |
| -------- | ----------- |
| `string` | `''`        |

A CSS transition timing function string applied to sorting animations.
See https://easings.net/ for examples.

```js
easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // Custom bezier easing
```

## `animation`

| **Type** | **Default** |
| -------- | ----------- |
| `number` | `150`       |

The duration of item reordering animations in milliseconds. Set to `0` to disable animations.

## `delay`

| **Type** | **Default** |
| -------- | ----------- |
| `number` | `0`         |

The delay (in milliseconds) before dragging starts. This helps distinguish click actions from drag actions.

## `delayOnTouchOnly`

| **Type**  | **Default** |
| --------- | ----------- |
| `boolean` | `false`     |

If set to `true`, the `delay` option will only be applied when dragging on touch/mobile devices.

## `touchStartThreshold`

| **Type** | **Default** |
| -------- | ----------- |
| `number` | `1`         |

The minimum movement in pixels required during a delay period before the drag is cancelled (prevents accidental drags during click or tap).

## `emptyInsertThreshold`

| **Type** | **Default** |
| -------- | ----------- |
| `number` | `-1`        |

The distance in pixels the cursor must be from an empty list to trigger item insertion. Set to `-1` to disable.

## `swapOnDrop`

| **Type**                | **Default** |
| ----------------------- | ----------- |
| `boolean \| SwappingFn` | `true`      |

Whether to physically finalize the position of the dragged element in the DOM at the drop coordinate.

- `true`: finalizes position.
- `false`: do not alter DOM hierarchy on drop (useful when integrating with modern virtual-list or reactivity-driven frameworks like Vue, React, or Angular).

## `removeCloneOnDrop`

| **Type**                | **Default** |
| ----------------------- | ----------- |
| `boolean \| SwappingFn` | `true`      |

Whether to automatically remove the cloned placeholder element after the drag is complete.

## `dropOnAnimationEnd`

| **Type**  | **Default** |
| --------- | ----------- |
| `boolean` | `false`     |

If set to `true`, the `onDrop` event callback will only be triggered after the sorting transition animation completes fully.

## `customGhost`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

A custom callback function returning an HTML element to be used as the floating ghost mirror during drag.

```js
new Sortable(element, {
  customGhost: (cloneEl) => {
    // Customize ghost element styling/content and return it
    const ghost = document.createElement('div');
    ghost.textContent = 'Dragging...';
    ghost.className = 'my-custom-ghost';
    return ghost;
  },
});
```

## `chosenClass`

| **Type** | **Default** |
| -------- | ----------- |
| `string` | `''`        |

The CSS class name applied to the active dragged element when chosen.

## `placeholderClass`

| **Type** | **Default** |
| -------- | ----------- |
| `string` | `''`        |

The CSS class name applied to the drop placeholder (clone) element remaining in the list during drag.

## `ghostClass`

| **Type** | **Default** |
| -------- | ----------- |
| `string` | `''`        |

The CSS class name applied to the floating ghost element following the pointer.

## `ghostStyle`

| **Type** | **Default** |
| -------- | ----------- |
| `Object` | `{}`        |

A key-value style configuration object applied inline to the floating ghost mirror element.

## `ghostContainer`

| **Type**      | **Default** |
| ------------- | ----------- |
| `HTMLElement` | `null`      |

The HTML container element where the floating ghost mirror will be appended. If not specified, it defaults to the active Sortable list container.

## `appendToBody`

| **Type**  | **Default** |
| --------- | ----------- |
| `boolean` | `false`     |

Appends the floating ghost mirror element directly to the document `<body>`. If set to `true`, the `ghostContainer` option will be overridden.

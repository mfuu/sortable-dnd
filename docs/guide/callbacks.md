# Callbacks & Events

Listen to drag-and-drop lifecycles and customize behaviors using options-driven callback handlers.

## `onChoose`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Triggered immediately when an element is chosen (i.e. mouse down or touchstart) but before drag movement actually starts.

```js
new Sortable(element, {
  onChoose: (event) => {
    // event is a SortableEvent
    console.log('Item chosen:', event.node);
  },
});
```

## `onUnchoose`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Triggered when an element is unchosen without completing sorting.

```ts
new Sortable(element, {
  onUnchoose: (event: SortableEvent) => {
    console.log('Item unchosen');
  },
});
```

## `onDrag`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Triggered once when the actual drag-and-drop movement starts (after satisfying `delay` and threshold requirements).

```ts
new Sortable(element, {
  onDrag: (event: SortableEvent) => {
    console.log('Drag started');
  },
});
```

## `onMove`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Triggered continuously on every move or hover step as elements are sorted within a container or dragged between containers.

```ts
new Sortable(element, {
  onMove: (event: SortableEvent) => {
    console.log('Dragging over:', event.target);
  },
});
```

## `onDrop`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Triggered when the dragging completes and the element is dropped.

```ts
new Sortable(element, {
  onDrop: (event: SortableEvent) => {
    console.log('Item dropped');
  },
});
```

## `onAdd`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Triggered when an element is dragged into the current list from another list.

```ts
new Sortable(element, {
  onAdd: (event: SortableEvent) => {
    console.log('Item added to this list from list:', event.from);
  },
});
```

## `onRemove`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Triggered when an element is dragged out of the current list into another list.

```ts
new Sortable(element, {
  onRemove: (event: SortableEvent) => {
    console.log('Item removed from this list');
  },
});
```

## `onChange`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Triggered when the dragging element changes its index/position inside the current list during sorting.

```ts
new Sortable(element, {
  onChange: (event: SortableEvent) => {
    console.log('Index changed from:', event.oldIndex, 'to:', event.newIndex);
  },
});
```

## `SortableEvent` Properties

Every callback receives a `SortableEvent` object containing useful properties of the drag state:

### `event.from`

The source `HTMLElement` container where the drag gesture originally started.

### `event.to`

The target `HTMLElement` container where the dragged element is currently placed.

### `event.node`

The original `HTMLElement` that is being dragged.

### `event.clone`

The cloned placeholder `HTMLElement`. All drag-and-drop positioning and list sorting operations are based on this clone to avoid altering the source element (`node`) directly during active dragging.

### `event.target`

The `HTMLElement` currently being hovered or swapped with.

### `event.oldIndex`

The index of the dragged element within its parent container (`from`) at the start of the drag. Returns `-1` if the element was added to the current list from another list.

### `event.newIndex`

The target index of the dragged element within its target container (`to`). Returns `-1` if the element was removed from the current list.

### `event.event`

The underlying native `TouchEvent` or `MouseEvent`.

### `event.pullMode`

The pull mode of the source list (e.g., `true`, `false`, or `'clone'`).

### `event.relative`

The spatial relationship of the dragged element relative to the target element after the swap completes:

- `0`: The dragged element occupies the same position as the target.
- `1`: The dragged element is inserted *after* the target.
- `-1`: The dragged element is inserted *before* the target.

### `event.revertDrag`

Whether to return the dragged element to its starting position after moving to another list under `{ pull: 'clone', revertDrag: true }`.

### `event.backToOrigin`

Whether the dragged element went back to its original list under `pull: 'clone'`.

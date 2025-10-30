# Callback

## `onChoose`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Element is chosen.

```js
new Sortable(element, {
  onChoose: (event) => {
    // see @SortableEvent
  },
});
```

## `onUnchoose`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Element is unchosen.

```ts
new Sortable(element, {
  onUnchoose: (event: SortableEvent) => {
    // see @SortableEvent
  },
});
```

## `onDrag`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Element dragging started.

```ts
new Sortable(element, {
  onDrag: (event: SortableEvent) => {
    // see @SortableEvent
  },
});
```

## `onMove`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Move an item in the list or between lists.

```ts
new Sortable(element, {
  onMove: (event: SortableEvent) => {
    // see @SortableEvent
  },
});
```

## `onDrop`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Element dragging is completed.

```ts
new Sortable(element, {
  onDrop: (event: SortableEvent) => {
    // see @SortableEvent
  },
});
```

## `onAdd`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Element is dropped into the current list from another (in the process of dragging).

```ts
new Sortable(element, {
  onAdd: (event: SortableEvent) => {
    // see @SortableEvent
  },
});
```

## `onRemove`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Element is removed from the current list into another (in the process of dragging).

```ts
new Sortable(element, {
  onRemove: (event: SortableEvent) => {
    // see @SortableEvent
  },
});
```

## `onChange`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Dragging element changes position in the current list (in the process of dragging).

```ts
new Sortable(element, {
  onChange: (event: SortableEvent) => {
    // see @SortableEvent
  },
});
```

## `SortableEvent`

### `event.from`

previous list

### `event.to`

list of currently placed drag element

### `event.node`

the dragged element

### `event.clone`

the clone element, all dnd operations are based on cloned element and do not alter the source dom(dragEl).

### `event.target`

drop element

### `event.oldIndex`

old index within parent.

```
-1: element added from another list to the current list
```

### `event.newIndex`

new index within parent.

```
-1: element has been removed from the current list
```

### `event.event`

TouchEvent | MouseEvent

### `event.pullMode`

Pull mode if dragging into another sortable.

### `event.relative`

Position of the drop element relative to the drag element after swap is complete.

```js
0: drag element is same as drop element

1: drag element is after drop element

-1: drag element is before drop element
```

### `event.revertDrag`

revert draged element to initial position after moving to a another list on `{ pull: 'clone', revertDrag: true }`.

### `event.backToOrigin`

dragged element go back to the original list on `pull: 'clone'`.

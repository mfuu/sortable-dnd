# Callback

## `onChoose`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Callback when element is chosen

```js
new Sortable(element, {
  onChoose: (event) => {
    // Element is chosen
  },
});
```

## `onUnchoose`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Callback when element is unchosen

## `onDrag`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Element dragging started

## `onMove`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Move an item in the list or between lists

## `onDrop`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Element dragging is completed. Only record changes in the current list

## `onAdd`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Element is dropped into the current list from another (in the process of dragging)

## `onRemove`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Element is removed from the current list into another (in the process of dragging)

## `onChange`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Dragging element changes position in the current list (in the process of dragging)

## `onSelect`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Element is selected. Takes effect in `multiple: true`

## `onDeselect`

| **Type**   | **Default** |
| ---------- | ----------- |
| `Function` | `undefined` |

Element is unselected. Takes effect in `multiple: true`

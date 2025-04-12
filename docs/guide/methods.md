# Methods

**example**
```js
let sortable = new Sortable(el);

sortable.destroy();
```

## `destroy`

Manually clear all the state of the component, using this method the component will not be draggable

## `option(key, value?)`

Get or set the option value, depending on whether the `value` is passed in

## `select(element)`

Selects the provided multi-drag item

## `deselect(element)`

Deselects the provided multi-drag item

## `getSelectedElements()`

Get the selected elements in the list, the return value is available in the case of `multiple`

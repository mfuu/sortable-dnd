# Utils

**example**
```js
import Sortable from 'sortable-dnd';

Sortable.utils.getRect(element);
```

## `on`

attach an event handler function.

```ts
on(el: HTMLElement, event: String, fn: Function);
```

## `off`

remove an event handler function.

```ts
off(el: HTMLElement, event: String, fn: Function);
```

## `css`

set one CSS properties.

```ts
css(el: HTMLElement, prop: String, value: String);
```

## `index`

Returns the index of an element within its parent for a selected set of elements.

```ts
index(el: HTMLElement, selector: String);
```

## `matches`

Check if the element matches the selector.

```ts
matches(el: HTMLElement, selector: String);
```

## `getRect`

Returns the "bounding client rect" of given element.

```ts
getRect(element: HTMLElement, relativeToContainingBlock?: boolean, container?: HTMLElement);
```

## `closest`

For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.

```ts
closest(el: HTMLElement, selector: String, context?: HTMLElement, includeContext?: Boolean);
```

## `toggleClass`

Add or remove one classes from each element.

```ts
toggleClass(el: HTMLElement, name: String, state: Boolean);
```

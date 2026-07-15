# Utility Methods

Sortable-dnd exposes a collection of static DOM and layout utility helpers under `Sortable.utils` to assist with custom drag-and-drop implementations.

**Example**

```js
import Sortable from 'sortable-dnd';

const rect = Sortable.utils.getRect(element);
console.log('Element bounding dimensions:', rect);
```

## `on`

Attaches an event listener to an element with cross-browser and passive-mode support.

```ts
on(el: HTMLElement, event: string, fn: EventListenerOrEventListenerObject): void;
```

## `off`

Removes a registered event listener from an element.

```ts
off(el: HTMLElement, event: string, fn: EventListenerOrEventListenerObject): void;
```

## `css`

Gets computed CSS properties or sets inline CSS styles on an element.

```ts
// Get a computed property value
const displayMode = css(el, 'display');

// Set inline style properties
css(el, 'transform', 'translate3d(0, 0, 0)');
```

## `index`

Returns the index of a DOM element among its siblings, ignoring template tags, hidden elements, and active dragging/ghost elements.

```ts
index(el: HTMLElement, selector?: string): number;
```

## `matches`

Checks if a DOM element matches a specified CSS selector string.

```ts
matches(el: HTMLElement, selector: string): boolean;
```

## `getRect`

Calculates and returns the bounding client coordinates (`top`, `left`, `right`, `bottom`, `width`, `height`) of an element. Optionally adjusts offsets relative to a parent container block.

```ts
getRect(element: HTMLElement, relativeToContainingBlock?: boolean, container?: HTMLElement): DOMRect;
```

## `getChild`

Returns the draggable element at a given index of draggable elements within a Sortable instance.

```ts
getChild(el: HTMLElement, childNum: number, selector?: string, includeDragEl?: boolean): HTMLElement | null;
```

## `closest`

Traverses up the DOM tree starting from `el` to find the closest ancestor element matching the provided selector.

```ts
closest(el: HTMLElement, selector: string, context?: HTMLElement, includeContext?: boolean): HTMLElement | null;
```

## `toggleClass`

Adds or removes a CSS class on an element depending on the provided boolean state.

```ts
toggleClass(el: HTMLElement, name: string, state: boolean): void;
```

## `detectDirection`

Automatically detects or determines directionality of children in a container (vertical or horizontal).

```ts
detectDirection(el: HTMLElement, selector: string): Direction;
```

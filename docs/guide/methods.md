# Instance Methods

Interact with a Sortable instance dynamically using public methods.

**Example**

```js
import Sortable from 'sortable-dnd';

const container = document.getElementById('group');
const sortable = new Sortable(container);

// Later in your application...
sortable.destroy();
```

## `destroy()`

Completely destroys the Sortable instance. This removes all internal state, cancels active listeners, resets DOM bindings, and disables any further dragging functionality.

```js
sortable.destroy();
```

## `option(key, value?)`

Gets or sets options dynamically on the active Sortable instance.

- If only the `key` is provided, it retrieves the current value of that option.
- If both the `key` and `value` are provided, it dynamically updates that option on the instance (and propagates changes to active plugin systems like AutoScroll and Animation).

```js
// Get an option value
const currentDelay = sortable.option('delay');

// Set an option value dynamically
sortable.option('delay', 200);
```

# Installation & Usage

## Installation

Install the package via your preferred package manager:

::: code-group

```sh [npm]
$ npm install sortable-dnd
```

```sh [yarn]
$ yarn add sortable-dnd
```

```sh [pnpm]
$ pnpm add sortable-dnd
```

:::

## Basic Usage

Set up your HTML structure and initialize Sortable-dnd:

**HTML**

```html
<ul id="group">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
  <li>Item 4</li>
  <li>Item 5</li>
</ul>
```

**JavaScript / TypeScript**

```js
import Sortable from 'sortable-dnd';

const container = document.getElementById('group');
const sortable = new Sortable(container, {
  animation: 150,
  onDrop: (event) => {
    console.log('Item dropped:', event);
  }
});
```

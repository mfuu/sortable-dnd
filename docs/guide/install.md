# Start

## Install

::: code-group

```sh [npm]
$ npm i sortable-dnd
```

```sh [yarn]
$ yarn add sortable-dnd
```

:::

## Usage

**HTML**

```html
<ul id="group">
  <li>1</li>
  <li>2</li>
  <li>3</li>
  <li>4</li>
  <li>5</li>
</ul>
```

**JavaScript**

```js
import Sortable from 'sortable-dnd';

let sortable = new Sortable(document.getElementById('group'));
```

<p>
  <a href="https://npm-stat.com/charts.html?package=sortable-dnd">
    <img alt="Downloads" src="https://img.shields.io/npm/dm/sortable-dnd.svg">
  </a>
  <a href="https://www.npmjs.com/package/sortable-dnd">
    <img alt="Version" src="https://img.shields.io/npm/v/sortable-dnd.svg"/>
  </a>
</p>



A JS Library for Drag and Drop, supports Sortable and Draggable

# Usage

**HTML**
```html
<ul id="group">
  <li>
    <i class="drag">drag me</i>
    <p>1</p>
  </li>
  <li>
    <i class="drag">drag me</i>
    <p>2</p>
  </li>
  <li>
    <i class="drag">drag me</i>
    <p>3</p>
  </li>
</ul>
```

**JavaScript**
```js
import Sortable from 'sortable-dnd'

var DND = new Sortable(
  document.getElementById('group'),
  {
    chosenClass: 'chosen',
    draggable: (e) => e.target.tagName === 'I' ? true : false, // use function
    // draggable: 'i' // use tagName 
    // draggable: '.drag' // use class
    // draggable: '#drag' // use id
    dragging: (e) => {
      return e.target
    },
    dragEnd: (old, new) => {
      ...
    }
  }
)
```

The component you created will clear all state after destroyed


# Options

| **option** | **type** | **default** | **Description** |
|-------------|--------------|--------------|--------------|
| `draggable` | `String/Function` | - | Specifies which items inside the element should be draggable, the function type must return a boolean |
| `dragging` | `Function` | (e) => e.target | Specifies the drag and drop element, which must return an HTMLElement |
| `dragEnd` | `Function` | (pre, cur, changed) => {} | The callback function when the drag is completed |
| `ghostStyle` | `Object` | {} | The style of the mask element when dragging |
| `ghostClass` | `String` | '' | The class of the mask element when dragging |
| `chosenClass` | `String` | {} | The class of the selected element when dragging |
| `animation` | `Number` | 150 | animation delay |

# Methods

| **method** | **Description** |
|--------------|--------------|
| `destroy()` | Manually clear all the state of the component, using this method the component will not be draggable |
import Sortable from '../index.js';
import { css, dispatchEvent, expando, index, matches, sort, toggleClass } from '../utils';

let dragElements, cloneElements, useSelectHandle;

function Multiple(options) {
  this.options = options || {};
  this.selects = [];
}

Multiple.prototype = {
  eventProperties() {
    return {
      nodes: dragElements || [],
      clones: cloneElements || [],
    };
  },

  isActive() {
    return !!dragElements;
  },

  nulling() {
    dragElements = cloneElements = useSelectHandle = null;
  },

  select(element) {
    toggleClass(element, this.options.selectedClass, true);

    this.selects.push(element);
    this.selects.sort((a, b) => sort(a, b));
  },

  deselect(element) {
    const index = this.selects.indexOf(element);
    if (index > -1) {
      toggleClass(element, this.options.selectedClass, false);
      this.selects.splice(index, 1);
    }
  },

  useSelectHandle(event, target) {
    const { selectHandle } = this.options;

    useSelectHandle =
      (typeof selectHandle === 'function' && selectHandle(event)) ||
      (typeof selectHandle === 'string' && matches(target, selectHandle));

    return !!useSelectHandle;
  },

  onChoose() {
    if (
      !this.options.multiple ||
      this.selects.length === 0 ||
      this.selects.indexOf(Sortable.dragged) < 0
    ) {
      return;
    }

    this.selects.sort((a, b) => sort(a, b));
    dragElements = this.selects;

    this.toggleChosenClass(true);
  },

  onDrop(from, to, isClone) {
    if (!dragElements) return;

    let dragEl = Sortable.dragged,
      cloneEl = Sortable.clone,
      dragIndex = dragElements.indexOf(dragEl);

    if (from !== to && isClone) {
      css(cloneEl, 'display', 'none');
      this.toggleVisible(true);

      cloneElements = dragElements.map((el) => el.cloneNode(true));
      this.sortElements(cloneElements, dragIndex, cloneEl);
    } else {
      this.sortElements(dragElements, dragIndex, cloneEl);
    }

    // Recalculate selected elements
    if (from !== to) {
      to[expando].multiplayer.toggleSelected(cloneElements || dragElements, 'add');
      !isClone && from[expando].multiplayer.toggleSelected(dragElements, 'remove');
    }
  },

  onSelect(event, dragEl, startEl, sortable) {
    const { multiple, selectHandle } = this.options;
    if (!(multiple && ((selectHandle && useSelectHandle) || (!selectHandle && !startEl)))) {
      return;
    }

    const dragIndex = this.selects.indexOf(dragEl);

    toggleClass(dragEl, this.options.selectedClass, dragIndex < 0);

    const evt = { from: sortable.el, event, node: dragEl, index: index(dragEl) };
    if (dragIndex < 0) {
      this.selects.push(dragEl);
      dispatchEvent({ sortable, name: 'onSelect', evt });
    } else {
      this.selects.splice(dragIndex, 1);
      dispatchEvent({ sortable, name: 'onDeselect', evt });
    }
    this.selects.sort((a, b) => sort(a, b));
  },

  toggleChosenClass(state) {
    if (!dragElements) return;

    for (let i = 0, len = dragElements.length; i < len; i++) {
      toggleClass(dragElements[i], this.options.chosenClass, state);
    }
  },

  toggleVisible(visible) {
    if (!dragElements) return;

    for (let i = 0, len = dragElements.length; i < len; i++) {
      if (dragElements[i] == Sortable.dragged) continue;
      css(dragElements[i], 'display', visible ? '' : 'none');
    }
  },

  toggleSelected(elements, status) {
    if (status === 'add') {
      elements.forEach((el) => this.selects.push(el));
    } else {
      this.selects = this.selects.filter((el) => elements.indexOf(el) < 0);
    }
  },

  sortElements(elements, index, target) {
    for (let i = 0, len = elements.length; i < len; i++) {
      css(elements[i], 'display', '');

      if (i < index) {
        target.parentNode.insertBefore(elements[i], target);
      } else {
        let dropEl = i > 0 ? elements[i - 1] : target;
        target.parentNode.insertBefore(elements[i], dropEl.nextSibling);
      }
    }
  },
};

export default Multiple;

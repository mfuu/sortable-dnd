import Sortable from '../index.js';
import { css, dispatchEvent, expando, index, matches, sort, toggleClass } from '../utils';

let dragElements, cloneElements, useSelectHandle;

function Multiple(options) {
  this.options = options || {};
  this.selects = [];
}

Multiple.prototype = {
  active() {
    return !!dragElements;
  },

  nulling() {
    dragElements = cloneElements = useSelectHandle = null;
  },

  params() {
    return {
      nodes: dragElements || [],
      clones: cloneElements || [],
    };
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

    this.toggleClass(true);
  },

  onDrag() {
    if (!dragElements) return;

    this._hideElements(dragElements);
    this.toggleClass(false);
  },

  getGhostElement() {
    if (!dragElements) return null;

    const container = document.createElement('div');
    this.selects.forEach((node, index) => {
      let clone = node.cloneNode(true);
      let opacity = index === 0 ? 1 : 0.5;
      clone.style = `position: absolute;left: 0;top: 0;bottom: 0;right: 0;opacity: ${opacity};z-index: ${index};`;
      container.appendChild(clone);
    });
    return container;
  },

  onDrop(from, to, isClone) {
    if (!dragElements) return;

    let dragEl = Sortable.dragged,
      cloneEl = Sortable.clone,
      dragIndex = dragElements.indexOf(dragEl);

    if (from !== to && isClone) {
      css(cloneEl, 'display', 'none');
      cloneElements = dragElements.map((el) => el.cloneNode(true));

      this._showElements(cloneElements, dragIndex, cloneEl);
      this._showElements(dragElements, dragIndex, dragEl);
    } else {
      this._showElements(dragElements, dragIndex, cloneEl);
    }

    // Recalculate selected elements
    if (from !== to) {
      to[expando].multiplayer.toggleSelected(cloneElements || dragElements, true);
      !isClone && from[expando].multiplayer.toggleSelected(dragElements, false);
    }
  },

  onSelect(event, dragEl, fromEl, sortable) {
    const { multiple, selectHandle } = this.options;
    if (!(multiple && ((selectHandle && useSelectHandle) || (!selectHandle && !fromEl)))) {
      return;
    }

    const dragIndex = this.selects.indexOf(dragEl);

    toggleClass(dragEl, this.options.selectedClass, dragIndex < 0);

    const params = { from: sortable.el, event, node: dragEl, index: index(dragEl) };

    if (dragIndex < 0) {
      this.selects.push(dragEl);
      dispatchEvent({ sortable, name: 'onSelect', params: params });
    } else {
      this.selects.splice(dragIndex, 1);
      dispatchEvent({ sortable, name: 'onDeselect', params: params });
    }
    this.selects.sort((a, b) => sort(a, b));
  },

  toggleClass(state) {
    if (!dragElements) return;

    for (let i = 0, len = dragElements.length; i < len; i++) {
      toggleClass(dragElements[i], this.options.chosenClass, state);
    }
  },

  toggleVisible(visible) {
    if (!dragElements) return;

    if (visible) {
      const dragIndex = dragElements.indexOf(Sortable.dragged);
      this._showElements(dragElements, dragIndex, Sortable.dragged);
    } else {
      this._hideElements(dragElements);
    }
  },

  toggleSelected(elements, isAdd) {
    if (isAdd) {
      elements.forEach((el) => this.selects.push(el));
    } else {
      this.selects = this.selects.filter((el) => elements.indexOf(el) < 0);
    }
  },

  _showElements(elements, index, target) {
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

  _hideElements(elements) {
    for (let i = 0, len = elements.length; i < len; i++) {
      if (elements[i] == Sortable.dragged) continue;
      css(elements[i], 'display', 'none');
    }
  },
};

export default Multiple;

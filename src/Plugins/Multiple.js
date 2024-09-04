import Sortable from '../index.js';
import { css, sort, index, toggleClass, dispatchEvent, expando } from '../utils';

let dragElements, cloneElements;

function Multiple(options) {
  this.options = options || {};
  this.selects = [];
}

Multiple.prototype = {
  nulling() {
    dragElements = cloneElements = null;
  },

  active() {
    return !!dragElements;
  },

  elements() {
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

  toggleSelected(elements, isAdd) {
    if (isAdd) {
      elements.forEach((el) => this.selects.push(el));
    } else {
      this.selects = this.selects.filter((el) => elements.indexOf(el) < 0);
    }
  },

  toggleClass(state) {
    if (!dragElements) return;

    for (let i = 0; i < dragElements.length; i++) {
      toggleClass(dragElements[i], this.options.chosenClass, state);
    }
  },

  toggleVisible(visible) {
    if (!dragElements) return;

    if (visible) {
      const dragIndex = dragElements.indexOf(Sortable.dragged);
      this._viewElements(dragElements, dragIndex, Sortable.dragged);
    } else {
      this._hideElements(dragElements);
    }
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

  onDrag(sortable) {
    if (!dragElements) return;

    sortable.animator.collect(Sortable.dragged.parentNode);
    this._hideElements(dragElements);
    sortable.animator.animate();

    this.toggleClass(false);
  },

  onDrop(from, to, isClone) {
    if (!dragElements) return;

    let dragEl = Sortable.dragged,
      cloneEl = Sortable.clone,
      dragIndex = dragElements.indexOf(dragEl);

    to[expando].animator.collect(cloneEl.parentNode);

    if (from !== to && isClone) {
      css(cloneEl, 'display', 'none');
      cloneElements = dragElements.map((el) => el.cloneNode(true));

      this._viewElements(cloneElements, dragIndex, cloneEl);
      this._viewElements(dragElements, dragIndex, dragEl);
    } else {
      this._viewElements(dragElements, dragIndex, cloneEl);
    }

    to[expando].animator.animate();

    // Recalculate selected elements
    if (from !== to) {
      to[expando].multiplayer.toggleSelected(cloneElements || dragElements, true);
      !isClone && from[expando].multiplayer.toggleSelected(dragElements, false);
    }
  },

  onSelect(event, dragEl, sortable) {
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

  _viewElements(elements, index, target) {
    for (let i = 0; i < elements.length; i++) {
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
    for (let i = 0; i < elements.length; i++) {
      if (elements[i] == Sortable.dragged) continue;
      css(elements[i], 'display', 'none');
    }
  },
};

export default Multiple;

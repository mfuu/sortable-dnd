import Sortable from '../index.js';
import { css, sort, index, toggleClass, dispatchEvent, expando } from '../utils';

let dragElements, cloneElements;

function Multiple(options) {
  this.options = options || {};
  this.selectedElements = [];
}

Multiple.prototype = {
  destroy() {
    dragElements = cloneElements = null;
  },

  active() {
    return !!dragElements;
  },

  setParams(params) {
    params.nodes = dragElements || [];
    params.clones = cloneElements || [];
  },

  select(element) {
    toggleClass(element, this.options.selectedClass, true);

    this.selectedElements.push(element);
    this.selectedElements.sort((a, b) => sort(a, b));
  },

  deselect(element) {
    const index = this.selectedElements.indexOf(element);
    if (index > -1) {
      toggleClass(element, this.options.selectedClass, false);
      this.selectedElements.splice(index, 1);
    }
  },

  getGhostElement() {
    if (!dragElements) return null;

    const container = document.createElement('div');
    this.selectedElements.forEach((node, index) => {
      let clone = node.cloneNode(true);
      let opacity = index === 0 ? 1 : 0.5;
      clone.style = `position: absolute;left: 0;top: 0;bottom: 0;right: 0;opacity: ${opacity};z-index: ${index};`;
      container.appendChild(clone);
    });
    return container;
  },

  toggleSelected(elements, add) {
    if (add) {
      elements.forEach((el) => this.selectedElements.push(el));
    } else {
      this.selectedElements = this.selectedElements.filter((el) => elements.indexOf(el) < 0);
    }
  },

  toggleClass(bool) {
    if (!dragElements) return;

    for (let i = 0; i < dragElements.length; i++) {
      toggleClass(dragElements[i], this.options.chosenClass, bool);
    }
  },

  toggleVisible(bool) {
    if (!dragElements) return;

    if (bool) {
      const dragIndex = dragElements.indexOf(Sortable.dragged);
      this._viewElements(dragElements, dragIndex, Sortable.dragged);
    } else {
      this._hideElements(dragElements);
    }
  },

  onChoose() {
    if (
      !this.options.multiple ||
      !this.selectedElements.length ||
      this.selectedElements.indexOf(Sortable.dragged) < 0
    ) {
      return;
    }

    this.selectedElements.sort((a, b) => sort(a, b));
    dragElements = this.selectedElements;

    this.toggleClass(true);
  },

  onDrag(sortable) {
    if (!dragElements) return;

    sortable.animator.collect(Sortable.dragged.parentNode);
    this._hideElements(dragElements);
    sortable.animator.animate();

    this.toggleClass(false);
  },

  onDrop(from, to, pullMode) {
    if (!dragElements) return;

    let dragEl = Sortable.dragged,
      cloneEl = Sortable.clone,
      dragIndex = dragElements.indexOf(dragEl);

    to[expando].animator.collect(cloneEl.parentNode);

    if (from !== to && pullMode === 'clone') {
      css(cloneEl, 'display', 'none');
      cloneElements = dragElements.map((node) => node.cloneNode(true));

      this._viewElements(cloneElements, dragIndex, cloneEl);
      this._viewElements(dragElements, dragIndex, dragEl);
    } else {
      this._viewElements(dragElements, dragIndex, cloneEl);
    }

    to[expando].animator.animate();

    // Recalculate selected elements
    if (from !== to) {
      to[expando].multiplayer.toggleSelected(cloneElements || dragElements, true);
      if (pullMode !== 'clone') {
        from[expando].multiplayer.toggleSelected(dragElements, false);
      }
    }
  },

  onSelect(event, dragEl, sortable) {
    const dragIndex = this.selectedElements.indexOf(dragEl);

    toggleClass(dragEl, this.options.selectedClass, dragIndex < 0);

    const params = { from: sortable.el, event, node: dragEl, index: index(dragEl) };

    if (dragIndex < 0) {
      this.selectedElements.push(dragEl);
      dispatchEvent({ sortable, name: 'onSelect', params: params });
    } else {
      this.selectedElements.splice(dragIndex, 1);
      dispatchEvent({ sortable, name: 'onDeselect', params: params });
    }
    this.selectedElements.sort((a, b) => sort(a, b));
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

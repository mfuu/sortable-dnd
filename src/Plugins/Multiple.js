import Sortable from '../index.js';
import { css, sort, index, matches, getEvent, toggleClass, dispatchEvent } from '../utils';

let multiTo, multiFrom, dragElements;

function Multiple(options) {
  this.options = options || {};
  this.selectedElements = [];
}

Multiple.prototype = {
  destroy() {
    multiTo = multiFrom = dragElements = null;
  },

  active() {
    return !!multiFrom;
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

  addSelected(elements) {
    elements.forEach((el) => this.selectedElements.push(el));
  },

  removeSelected(elements) {
    this.selectedElements = this.selectedElements.filter((el) => elements.indexOf(el) < 0);
  },

  getSelectedElements() {
    return this.selectedElements;
  },

  getParams() {
    if (multiFrom && multiTo) {
      return { from: multiFrom, to: multiTo };
    }
    return { from: {}, to: {} };
  },

  getGhostElement() {
    if (!multiFrom) return null;

    const container = document.createElement('div');
    this.selectedElements.forEach((node, index) => {
      let clone = node.cloneNode(true);
      let opacity = index === 0 ? 1 : 0.5;
      clone.style = `position: absolute;left: 0;top: 0;bottom: 0;right: 0;opacity: ${opacity};z-index: ${index};`;
      container.appendChild(clone);
    });
    return container;
  },

  onDrag(sortable) {
    const dragEl = Sortable.dragged;

    if (
      !this.options.multiple ||
      !this.selectedElements.length ||
      this.selectedElements.indexOf(dragEl) < 0
    ) {
      return;
    }

    this.selectedElements.sort((a, b) => sort(a, b));

    multiFrom = { sortable, nodes: this.selectedElements };
    multiTo = { sortable, nodes: this.selectedElements };
    dragElements = this.selectedElements;

    sortable.animator.collect(dragEl, null, dragEl.parentNode);
    this._hideElements(dragElements);
    sortable.animator.animate();
  },

  toggleElementsVisible(bool) {
    if (!multiFrom) return;

    if (bool) {
      const dragIndex = dragElements.indexOf(Sortable.dragged);
      this._viewElements(dragElements, dragIndex, Sortable.dragged);
    } else {
      this._hideElements(dragElements);
    }
  },

  onChange(sortable) {
    if (!multiFrom) return;

    multiTo = { sortable, nodes: dragElements };
  },

  onDrop(dragEvent, listChanged, pullMode) {
    if (!multiFrom || !multiTo) return;

    multiFrom.sortable = dragEvent.sortable;

    const dragEl = Sortable.dragged;
    const cloneEl = Sortable.clone;
    const dragIndex = dragElements.indexOf(dragEl);

    multiTo.sortable.animator.collect(dragEl, null, dragEl.parentNode);

    let cloneElements = null;
    if (listChanged && pullMode === 'clone') {
      css(cloneEl, 'display', 'none');
      cloneElements = dragElements.map((node) => node.cloneNode(true));
      this._viewElements(cloneElements, dragIndex, cloneEl);
    }

    this._viewElements(dragElements, dragIndex, dragEl);

    multiTo.nodes = cloneElements || dragElements;
    multiTo.sortable.animator.animate();

    // Recalculate selected elements
    if (listChanged) {
      multiTo.sortable.multiplayer.addSelected(cloneElements || dragElements);
      if (pullMode !== 'clone') {
        multiFrom.sortable.multiplayer.removeSelected(dragElements);
      }
    }
  },

  onSelect(dragEvent, dropEvent, dragEl, sortable) {
    const { event, target } = getEvent(dropEvent);

    if (Sortable.dragged || !this._isClick(dragEvent, event)) return;

    const { selectHandle } = this.options;
    if (typeof selectHandle === 'function' && !selectHandle(event)) return;
    if (typeof selectHandle === 'string' && !matches(target, selectHandle)) return;

    const dragIndex = this.selectedElements.indexOf(dragEl);

    toggleClass(dragEl, this.options.selectedClass, dragIndex < 0);

    const params = { sortable, event, node: dragEl, index: index(dragEl) };

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

  _isClick(dragEvent, dropEvent) {
    const dx = dropEvent.clientX - dragEvent.clientX;
    const dy = dropEvent.clientY - dragEvent.clientY;
    const dd = Math.sqrt(dx * dx + dy * dy);
    return dd >= 0 && dd <= 1;
  },
};

export default Multiple;

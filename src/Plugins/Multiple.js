import Sortable from '../index.js';
import { css, sort, index, matches, getEvent, toggleClass, dispatchEvent } from '../utils';

let toSortable, fromSortable, dragElements, cloneElements;

function Multiple(options) {
  this.options = options || {};
  this.selectedElements = [];
}

Multiple.prototype = {
  destroy() {
    toSortable = fromSortable = dragElements = cloneElements = null;
  },

  active() {
    return !!fromSortable;
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
    if (!fromSortable) return {};

    let params = {};
    params.nodes = dragElements;
    if (cloneElements) {
      params.clones = cloneElements;
    }

    return params;
  },

  getGhostElement() {
    if (!fromSortable) return null;

    const container = document.createElement('div');
    this.selectedElements.forEach((node, index) => {
      let clone = node.cloneNode(true);
      let opacity = index === 0 ? 1 : 0.5;
      clone.style = `position: absolute;left: 0;top: 0;bottom: 0;right: 0;opacity: ${opacity};z-index: ${index};`;
      container.appendChild(clone);
    });
    return container;
  },

  toggleVisible(bool) {
    if (!fromSortable) return;

    if (bool) {
      const dragIndex = dragElements.indexOf(Sortable.dragged);
      this._viewElements(dragElements, dragIndex, Sortable.dragged);
    } else {
      this._hideElements(dragElements);
    }
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

    dragElements = this.selectedElements;
    fromSortable = sortable;
    toSortable = sortable;

    sortable.animator.collect(dragEl, null, dragEl.parentNode);
    this._hideElements(dragElements);
    sortable.animator.animate();
  },

  onChange(sortable) {
    if (!fromSortable) return;

    toSortable = sortable;
  },

  onDrop(sortable, listChanged, pullMode) {
    if (!fromSortable || !toSortable) return;

    fromSortable = sortable;

    const dragEl = Sortable.dragged;
    const cloneEl = Sortable.clone;
    const dragIndex = dragElements.indexOf(dragEl);

    toSortable.animator.collect(dragEl, null, dragEl.parentNode);

    if (listChanged && pullMode === 'clone') {
      css(cloneEl, 'display', 'none');
      cloneElements = dragElements.map((node) => node.cloneNode(true));
      this._viewElements(cloneElements, dragIndex, cloneEl);
    } else {
      cloneElements = null;
    }

    this._viewElements(dragElements, dragIndex, dragEl);

    toSortable.animator.animate();

    // Recalculate selected elements
    if (listChanged) {
      toSortable.multiplayer.addSelected(cloneElements || dragElements);
      if (pullMode !== 'clone') {
        fromSortable.multiplayer.removeSelected(dragElements);
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

  _isClick(dragEvent, dropEvent) {
    const dx = dropEvent.clientX - dragEvent.clientX;
    const dy = dropEvent.clientY - dragEvent.clientY;
    const dd = Math.sqrt(dx * dx + dy * dy);
    return dd >= 0 && dd <= 1;
  },
};

export default Multiple;

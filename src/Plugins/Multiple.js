import Sortable from '../index.js';
import { css, sort, index, getEvent, toggleClass, dispatchEvent } from '../utils';

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

    const dragEl = Sortable.dragged;

    sortable.animator.collect(dragEl.parentNode);
    this._hideElements(dragElements);
    sortable.animator.animate();

    this.toggleClass(false);
  },

  onDrop(fromSortable, toSortable, pullMode) {
    if (!dragElements) return;

    const dragEl = Sortable.dragged;
    const cloneEl = Sortable.clone;
    const dragIndex = dragElements.indexOf(dragEl);

    toSortable.animator.collect(dragEl.parentNode);

    if (fromSortable !== toSortable && pullMode === 'clone') {
      css(cloneEl, 'display', 'none');
      cloneElements = dragElements.map((node) => node.cloneNode(true));
      this._viewElements(cloneElements, dragIndex, cloneEl);
    } else {
      cloneElements = null;
    }

    this._viewElements(dragElements, dragIndex, dragEl);

    toSortable.animator.animate();

    // Recalculate selected elements
    if (fromSortable !== toSortable) {
      toSortable.multiplayer.toggleSelected(cloneElements || dragElements, true);
      if (pullMode !== 'clone') {
        fromSortable.multiplayer.toggleSelected(dragElements, false);
      }
    }
  },

  onSelect(dragEvent, dropEvent, dragEl, sortable) {
    const { event, target } = getEvent(dropEvent);

    if (Sortable.dragged || !this._isClick(dragEvent, event)) return;

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

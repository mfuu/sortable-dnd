import Sortable from '../index.js';
import {
  css,
  sort,
  matches,
  getRect,
  getEvent,
  getOffset,
  toggleClass,
  offsetChanged,
} from '../utils';

let multiTo, multiFrom, dragElements;

function Multiple(options) {
  this.options = options || {};
  this.selectedElements = [];
}

Multiple.prototype = {
  destroy() {
    multiTo = multiFrom = dragElements = null;
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

  getSelectedElements() {
    return this.selectedElements;
  },

  getEmits() {
    const emit = { from: {}, to: {} };
    if (multiFrom && multiTo) {
      emit.from = { ...multiFrom };
      emit.to = { ...multiTo };
    }
    return emit;
  },

  getHelper() {
    if (!multiFrom) return null;

    const container = document.createElement('div');
    this.selectedElements.forEach((node, index) => {
      let clone = node.cloneNode(true);
      let opacity = index === 0 ? 1 : 0.5;
      clone.style = `
        opacity: ${opacity};
        position: absolute;
        z-index: ${index};
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
      `;
      container.appendChild(clone);
    });
    return container;
  },

  getOnEndParams() {
    if (!multiFrom) return {};

    return {
      changed:
        multiFrom.sortable.el !== multiTo.sortable.el ||
        this._offsetChanged(multiFrom.nodes, multiTo.nodes),
    };
  },

  onDrag(rootEl, sortable) {
    if (!this._isMultiple()) return;

    // sort all selected elements by offset before drag
    this.selectedElements.sort((a, b) => sort(a, b));

    const nodes = this.selectedElements.map((node) => ({
      node,
      rect: getRect(node),
      offset: getOffset(node, rootEl),
    }));

    multiFrom = { sortable, nodes };
    multiTo = { sortable, nodes };

    dragElements = this.selectedElements;
  },

  onStarted(sortable) {
    if (!multiFrom) return;

    const dragEl = Sortable.dragged;
    sortable.animator.collect(dragEl, null, dragEl.parentNode);

    dragElements.forEach((node) => {
      if (node == dragEl) return;
      css(node, 'display', 'none');
    });

    sortable.animator.animate();
  },

  onAdd() {
    if (!dragElements) return;
    this.selectedElements.push(...dragElements);
  },

  onRemove() {
    if (!dragElements) return;
    this.selectedElements = this.selectedElements.filter((el) => dragElements.indexOf(el) < 0);
  },

  onChange(dragEl, sortable) {
    if (!multiFrom) return;

    const rect = getRect(dragEl);
    const offset = getOffset(dragEl, sortable.el);

    multiTo = {
      sortable,
      nodes: dragElements.map((node) => ({ node, rect, offset })),
    };
  },

  onDrop(rootEl, dragEvent) {
    if (!multiFrom || !multiTo) return;

    const dragEl = Sortable.dragged;
    multiTo.sortable.animator.collect(dragEl, null, dragEl.parentNode);

    const index = dragElements.indexOf(dragEl);

    dragElements.forEach((node, i) => {
      css(node, 'display', '');
      if (i < index) {
        dragEl.parentNode.insertBefore(node, dragEl);
      } else {
        let dropEl = i > 0 ? dragElements[i - 1] : dragEl;
        dragEl.parentNode.insertBefore(node, dropEl.nextSibling);
      }
    });

    multiFrom.sortable = dragEvent.sortable;
    multiTo.nodes = dragElements.map((node) => {
      return { node, rect: getRect(node), offset: getOffset(node, rootEl) };
    });

    multiTo.sortable.animator.animate();
  },

  onSelect(dragEvent, dropEvent, from) {
    if (!Sortable.dragged || !this._isMouseClick(dragEvent, dropEvent)) return;

    const dragEl = Sortable.dragged;

    const { selectHandle } = this.options;
    const { target } = getEvent(dropEvent);

    if (typeof selectHandle === 'function' && !selectHandle(dropEvent)) return;
    if (typeof selectHandle === 'string' && !matches(target, selectHandle)) return;

    const index = this.selectedElements.indexOf(dragEl);

    toggleClass(dragEl, this.options.selectedClass, index < 0);

    const params = { ...from, event: dropEvent };

    if (index < 0) {
      this.selectedElements.push(dragEl);
      from.sortable._dispatchEvent('onSelect', params);
    } else {
      this.selectedElements.splice(index, 1);
      from.sortable._dispatchEvent('onDeselect', params);
    }
    this.selectedElements.sort((a, b) => sort(a, b));
  },

  _isMultiple() {
    return (
      this.options.multiple &&
      this.selectedElements.length &&
      this.selectedElements.indexOf(Sortable.dragged) > -1
    );
  },

  _isMouseClick(dragEvent, dropEvent) {
    const difX = dropEvent.clientX - dragEvent.clientX;
    const difY = dropEvent.clientY - dragEvent.clientY;
    const difD = Math.sqrt(difX * difX + difY * difY);
    return difD >= 0 && difD <= 1;
  },

  _offsetChanged(froms, tos) {
    return !!froms.find((from) => {
      const to = tos.find((t) => t.node === from.node);
      return offsetChanged(from.offset, to.offset);
    });
  },
};

export default Multiple;

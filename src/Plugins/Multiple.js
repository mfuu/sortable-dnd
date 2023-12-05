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

const multiFromTo = { sortable: null, nodes: [] };

let multiFrom = { ...multiFromTo },
  multiTo = { ...multiFromTo },
  selectedElements = {};

const randomCode = function () {
  return Number(Math.random().toString().slice(-3) + Date.now()).toString(32);
};

function Multiple(options) {
  this.active = false;
  this.options = options || {};
  this.groupName = options.group.name || 'group_' + randomCode();
}

Multiple.prototype = {
  getSelectedElements() {
    return selectedElements[this.groupName] || [];
  },

  getEmits() {
    const emit = { from: {}, to: {} };
    if (this.active) {
      emit.from = { ...multiFrom };
      emit.to = { ...multiTo };
    }
    return emit;
  },

  getHelper() {
    if (!this.active) return null;

    const container = document.createElement('div');
    selectedElements[this.groupName].forEach((node, index) => {
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
    if (!this.active) return {};

    const sortableChanged = multiFrom.sortable.el !== multiTo.sortable.el;
    const changed = sortableChanged || this._offsetChanged(multiFrom.nodes, multiTo.nodes);
    return { changed };
  },

  onDrag(rootEl, sortable) {
    this.active = this._isActive();
    if (!this.active) return;

    multiFrom.sortable = sortable;
    multiFrom.nodes = selectedElements[this.groupName].map((node) => {
      return { node, rect: getRect(node), offset: getOffset(node, rootEl) };
    });
    multiTo.sortable = sortable;
  },

  onStarted(sortable) {
    if (!this.active) return;

    const dragEl = Sortable.dragged;
    sortable.animator.collect(dragEl, null, dragEl.parentNode);

    selectedElements[this.groupName].forEach((node) => {
      if (node == dragEl) return;
      css(node, 'display', 'none');
    });

    sortable.animator.animate();
  },

  onChange(dragEl, sortable) {
    if (!this.active) return;

    const rect = getRect(dragEl);
    const offset = getOffset(dragEl, sortable.el);

    multiTo.sortable = sortable;
    multiTo.nodes = selectedElements[this.groupName].map((node) => {
      return { node, rect, offset };
    });
  },

  onDrop(dragEvent, dropEvent, from) {
    if (!Sortable.dragged || !this._isMouseClick(dragEvent, dropEvent)) return;

    const dragEl = Sortable.dragged;

    const { selectHandle } = this.options;
    const { target } = getEvent(dropEvent);

    if (typeof selectHandle === 'function' && !selectHandle(dropEvent)) return;
    if (typeof selectHandle === 'string' && !matches(target, selectHandle)) return;

    if (!selectedElements[this.groupName]) {
      selectedElements[this.groupName] = [];
    }

    const index = selectedElements[this.groupName].indexOf(dragEl);

    toggleClass(dragEl, this.options.selectedClass, index < 0);

    const params = { ...from, event: dropEvent };

    if (index < 0) {
      selectedElements[this.groupName].push(dragEl);
      from.sortable._dispatchEvent('onSelect', params, false);
    } else {
      selectedElements[this.groupName].splice(index, 1);
      from.sortable._dispatchEvent('onDeselect', params, false);
    }

    selectedElements[this.groupName].sort((a, b) => sort(a, b));
  },

  onEnd(rootEl, dragEvent) {
    if (!this.active) return;

    const dragEl = Sortable.dragged;
    multiTo.sortable.animator.collect(dragEl, null, dragEl.parentNode);

    const index = selectedElements[this.groupName].indexOf(dragEl);

    selectedElements[this.groupName].forEach((node, i) => {
      css(node, 'display', '');
      if (i < index) {
        dragEl.parentNode.insertBefore(node, dragEl);
      } else {
        let dropEl = i > 0 ? selectedElements[this.groupName][i - 1] : dragEl;
        dragEl.parentNode.insertBefore(node, dropEl.nextSibling);
      }
    });

    multiFrom.sortable = dragEvent.sortable;
    multiTo.nodes = selectedElements[this.groupName].map((node) => {
      return { node, rect: getRect(node), offset: getOffset(node, rootEl) };
    });

    multiTo.sortable.animator.animate();
  },

  _isActive() {
    return (
      this.options.multiple &&
      selectedElements[this.groupName] &&
      selectedElements[this.groupName].length &&
      selectedElements[this.groupName].indexOf(Sortable.dragged) > -1
    );
  },

  _isMouseClick: function (dragEvent, dropEvent) {
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

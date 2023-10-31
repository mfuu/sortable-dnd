import Sortable from '../index.js';
import { sort, getRect, getOffset, toggleClass, offsetChanged, toggleVisible } from '../utils';

const multiFromTo = { sortable: null, nodes: [] };

let multiFrom = { ...multiFromTo },
  multiTo = { ...multiFromTo },
  selectedElements = {};

const randomCode = function () {
  return Number(Math.random().toString().slice(-3) + Date.now()).toString(32);
};

function Multiple(options) {
  this.options = options || {};
  this.groupName = options.group.name || 'group_' + randomCode();
}

Multiple.prototype = {
  /**
   * Indicates whether the multi-drag mode is used
   */
  allowDrag() {
    return (
      this.options.multiple &&
      selectedElements[this.groupName] &&
      selectedElements[this.groupName].length &&
      selectedElements[this.groupName].indexOf(Sortable.dragged) > -1
    );
  },

  getSelectedElements() {
    return selectedElements[this.groupName] || [];
  },

  getEmits() {
    return { from: { ...multiFrom }, to: { ...multiTo } };
  },

  getHelper() {
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

  /**
   * Collecting Multi-Drag Elements
   */
  select(event, rootEl, from) {
    const dragEl = Sortable.dragged;
    if (!dragEl) return;

    if (!selectedElements[this.groupName]) {
      selectedElements[this.groupName] = [];
    }

    const index = selectedElements[this.groupName].indexOf(dragEl);

    toggleClass(dragEl, this.options.selectedClass, index < 0);

    const params = { ...from, event };

    if (index < 0) {
      selectedElements[this.groupName].push(dragEl);
      from.sortable._dispatchEvent('onSelect', params);
    } else {
      selectedElements[this.groupName].splice(index, 1);
      from.sortable._dispatchEvent('onDeselect', params);
    }

    selectedElements[this.groupName].sort((a, b) => sort(a, b));
  },

  onDrag(rootEl, sortable) {
    multiFrom.sortable = sortable;
    multiFrom.nodes = selectedElements[this.groupName].map((node) => {
      return { node, rect: getRect(node), offset: getOffset(node, rootEl) };
    });
    multiTo.sortable = sortable;
  },

  onStarted(sortable) {
    const dragEl = Sortable.dragged;
    sortable.animator.collect(dragEl, null, dragEl.parentNode);

    selectedElements[this.groupName].forEach((node) => {
      if (node == dragEl) return;
      toggleVisible(node, false);
    });

    sortable.animator.animate();
  },

  onChange(dragEl, sortable) {
    const rect = getRect(dragEl);
    const offset = getOffset(dragEl, sortable.el);

    multiTo.sortable = sortable;
    multiTo.nodes = selectedElements[this.groupName].map((node) => {
      return { node, rect, offset };
    });
  },

  onDrop(event, rootEl, dragEvent) {
    const dragEl = Sortable.dragged;
    multiTo.sortable.animator.collect(dragEl, null, dragEl.parentNode);

    const index = selectedElements[this.groupName].indexOf(dragEl);

    selectedElements[this.groupName].forEach((node, i) => {
      toggleVisible(node, true);
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

    const sortableChanged = multiFrom.sortable.el !== multiTo.sortable.el;
    const changed = sortableChanged || this._offsetChanged(multiFrom.nodes, multiTo.nodes);
    const params = { changed, event };

    if (sortableChanged) {
      multiFrom.sortable._dispatchEvent('onDrop', params);
    }
    multiTo.sortable._dispatchEvent('onDrop', params);

    multiTo.sortable.animator.animate();
  },

  _offsetChanged(froms, tos) {
    return !!froms.find((from) => {
      const to = tos.find((t) => t.node === from.node);
      return offsetChanged(from.offset, to.offset);
    });
  },
};

export default Multiple;

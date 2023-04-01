import { getOffset, getRect, offsetChanged, toggleClass } from '../utils';

const multiFromTo = { sortable: null, group: null, nodes: [] };

let multiFrom = { ...multiFromTo },
  multiTo = { ...multiFromTo },
  selectedElements = {};

export const getMultiDiffer = function () {
  return { from: { ...multiFrom }, to: { ...multiTo } };
};

function Multiple(options) {
  this.options = options || {};
  this.groupName = options.group.name;
}

Multiple.prototype = {
  /**
   * Indicates whether the multi-drag mode is used
   * @returns {boolean}
   */
  allowDrag(dragEl) {
    return (
      this.options.multiple &&
      selectedElements[this.groupName] &&
      selectedElements[this.groupName].length &&
      selectedElements[this.groupName].indexOf(dragEl) > -1
    );
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
        width: 100%;
        height: 100%;
      `;
      container.appendChild(clone);
    });
    return container;
  },

  /**
   * Collecting Multi-Drag Elements
   */
  select(event, dragEl, sortable) {
    if (!dragEl) return;

    if (!selectedElements[this.groupName]) {
      selectedElements[this.groupName] = [];
    }

    const index = selectedElements[this.groupName].indexOf(dragEl);

    toggleClass(dragEl, this.options.selectedClass, index < 0);

    const params = {
      event,
      sortable,
      target: dragEl,
      group: dragEl.parentNode,
    };

    if (index < 0) {
      selectedElements[this.groupName].push(dragEl);
      sortable._dispatchEvent('onSelect', params);
    } else {
      selectedElements[this.groupName].splice(index, 1);
      sortable._dispatchEvent('onDeselect', params);
    }

    selectedElements[this.groupName].sort((a, b) => {
      return this._sortByOffset(getOffset(a), getOffset(b));
    });
  },

  onDrag(dragEl, sortable) {
    multiFrom.sortable = sortable;
    multiFrom.group = dragEl.parentNode;
    multiFrom.nodes = selectedElements[this.groupName].map((node) => {
      return { node, rect: getRect(node), offset: getOffset(node) };
    });
    multiTo.sortable = sortable;
    multiTo.group = dragEl.parentNode;
  },

  onTrulyStarted(dragEl, sortable) {
    sortable.animator.collect(dragEl);

    selectedElements[this.groupName].forEach((node) => {
      if (node == dragEl) return;
      node.parentNode.removeChild(node);
    });

    sortable.animator.animate(sortable.options.animation);
  },

  onChange(dragEl, sortable, rootEl) {
    const rect = getRect(dragEl);
    const offset = getOffset(dragEl);
    multiTo.sortable = sortable;
    multiTo.group = rootEl || dragEl.parentNode;
    multiTo.nodes = selectedElements[this.groupName].map((node) => {
      return { node, rect, offset };
    });
  },

  onDrop(event, dragEl, sortable, downEvent) {
    sortable.animator.collect(dragEl);

    const index = selectedElements[this.groupName].indexOf(dragEl);

    selectedElements[this.groupName].forEach((node, i) => {
      if (i < index) {
        dragEl.parentNode.insertBefore(node, dragEl);
      } else {
        let dropEl = i > 0 ? selectedElements[this.groupName][i - 1] : dragEl;
        dragEl.parentNode.insertBefore(node, dropEl.nextSibling);
      }
    });

    multiTo.nodes = selectedElements[this.groupName].map((node) => {
      return { node, rect: getRect(node), offset: getOffset(node) };
    });

    multiFrom.group = downEvent.group;
    multiFrom.sortable = downEvent.sortable;

    const changed = this._offsetChanged(multiFrom.nodes, multiTo.nodes);
    const params = { ...getMultiDiffer(), changed, event };
    if (multiFrom.group != downEvent.group) {
      downEvent.sortable._dispatchEvent('onDrop', params);
    }
    sortable._dispatchEvent('onDrop', params);

    sortable.animator.animate(sortable.options.animation);
  },

  _sortByOffset(o1, o2) {
    return o1.top == o2.top ? o1.left > o2.left : o1.top > o2.top;
  },

  _offsetChanged(ns1, ns2) {
    return !!ns1.find((node) => {
      let n = ns2.find((n) => n.node === node.node);
      return offsetChanged(n.offset, node.offset);
    });
  },
};

export default Multiple;

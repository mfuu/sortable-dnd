import {
  getRect,
  getOffset,
  randomCode,
  toggleClass,
  sortByOffset,
  offsetChanged,
} from '../utils';

const multiFromTo = { sortable: null, nodes: [] };

let multiFrom = { ...multiFromTo },
  multiTo = { ...multiFromTo },
  selectedElements = {};

export const getMultiDiffer = function () {
  return { from: { ...multiFrom }, to: { ...multiTo } };
};

function Multiple(options) {
  this.options = options || {};
  this.groupName = options.group.name || 'group_' + randomCode();
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
  select(event, dragEl, rootEl, from) {
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

    selectedElements[this.groupName].sort((a, b) => {
      return sortByOffset(getOffset(a, rootEl), getOffset(b, rootEl));
    });
  },

  onDrag(rootEl, sortable) {
    multiFrom.sortable = sortable;
    multiFrom.nodes = selectedElements[this.groupName].map((node) => {
      return { node, rect: getRect(node), offset: getOffset(node, rootEl) };
    });
    multiTo.sortable = sortable;
  },

  onTrulyStarted(dragEl, sortable) {
    sortable.animator.collect(dragEl, null, dragEl.parentNode);

    selectedElements[this.groupName].forEach((node) => {
      if (node == dragEl) return;
      node.parentNode.removeChild(node);
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

  onDrop(event, dragEl, rootEl, downEvent, _emits) {
    multiTo.sortable.animator.collect(dragEl, null, dragEl.parentNode);

    const index = selectedElements[this.groupName].indexOf(dragEl);

    selectedElements[this.groupName].forEach((node, i) => {
      if (i < index) {
        dragEl.parentNode.insertBefore(node, dragEl);
      } else {
        let dropEl = i > 0 ? selectedElements[this.groupName][i - 1] : dragEl;
        dragEl.parentNode.insertBefore(node, dropEl.nextSibling);
      }
    });

    multiFrom.sortable = downEvent.sortable;
    multiTo.nodes = selectedElements[this.groupName].map((node) => {
      return { node, rect: getRect(node), offset: getOffset(node, rootEl) };
    });

    const changed =
      multiTo.sortable.el != multiFrom.sortable.el ||
      this._offsetChanged(multiFrom.nodes, multiTo.nodes);
    const params = { ..._emits(), changed, event };
    if (multiTo.sortable.el != multiFrom.sortable.el) {
      multiFrom.sortable._dispatchEvent('onDrop', params);
    }
    multiTo.sortable._dispatchEvent('onDrop', params);

    multiTo.sortable.animator.animate();
  },

  _offsetChanged(ns1, ns2) {
    return !!ns1.find((o2) => {
      let o1 = ns2.find((n) => n.node === o2.node);
      return offsetChanged(o1.offset, o2.offset);
    });
  },
};

export default Multiple;

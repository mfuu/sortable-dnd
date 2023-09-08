import Sortable from '../index.js';
import { on, off, css, isHTMLElement } from '../utils';

const CACLTYPE = {
  DOWN: 'DOWN',
  INIT: 'INIT',
  FIXED: 'FIXED',
  DYNAMIC: 'DYNAMIC',
};

const DIRECTION = {
  FIXED: 'FIXED',
  FRONT: 'FRONT',
  BEHIND: 'BEHIND',
};

const LEADING_BUFFER = 2;

const OBSERVE_CONFIG = { subtree: true, childList: true, attributes: false };

function Virtual(sortable) {
  this.sortable = sortable;
  this.options = sortable.options;

  this.offset = 0;
  this.direction = '';

  this.sizes = new Map();
  this.mutationObserver = null;
  this.buffer = Math.round(this.options.keeps / 3);

  this.renderState = CACLTYPE.INIT;
  this.calcType = CACLTYPE.INIT;
  this.calcSize = { average: 0, total: 0, fixed: 0 };
  this.range = { start: 0, end: 0, render: 0, front: 0, behind: 0 };

  // Bind all private methods
  for (let fn in this) {
    if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
      this[fn] = this[fn].bind(this);
    }
  }

  if (this.options.virtual) {
    this._init();
  }
}

Virtual.prototype = {
  constructor: Virtual,

  isFront() {
    return this.direction === DIRECTION.FRONT;
  },

  isBehind() {
    return this.direction === DIRECTION.BEHIND;
  },

  getSize(dataKey) {
    return this.sizes.get(dataKey);
  },

  getOffset() {
    return this.options.scroller[this._isHorizontal() ? 'scrollLeft' : 'scrollTop'];
  },

  getClientSize() {
    return this.options.scroller[this._isHorizontal() ? 'clientWidth' : 'clientHeight'];
  },

  getScrollSize() {
    return this.options.scroller[this._isHorizontal() ? 'scrollWidth' : 'scrollHeight'];
  },

  scrollToOffset(offset) {
    const scrollKey = this._isHorizontal() ? 'scrollLeft' : 'scrollTop';
    this.options.scroller[scrollKey] = offset;
  },

  scrollToIndex(index) {
    if (index >= this.options.dataKeys.length - 1) {
      this.scrollToBottom();
    } else {
      const indexOffset = this._getOffsetByIndex(index);
      this.scrollToOffset(indexOffset);
    }
  },

  scrollToBottom() {
    const bottomOffset = this.getScrollSize();
    this.scrollToOffset(bottomOffset);

    // if the bottom is not reached, execute the scroll method again
    setTimeout(() => {
      const offset = this.getOffset();
      const clientSize = this.getClientSize();
      const scrollSize = this.getScrollSize();
      if (offset + clientSize + 1 < scrollSize) {
        this.scrollToBottom();
      }
    }, 5);
  },

  updateItemSize(key, size) {
    this._onItemResized(key, size);
  },

  updateRange() {
    let start = this.range.start;
    if (this.isFront()) {
      start -= LEADING_BUFFER;
    } else if (this.isBehind()) {
      start += LEADING_BUFFER;
    }

    start = Math.max(start, 0);

    this._onUpdate(start, this._getEndByStart(start));
  },

  _init() {
    if (isHTMLElement(this.options.scroller)) {
      on(this.options.scroller, 'scroll', this._onScroll);
    }
    this._observe();
    this.updateRange();
  },

  _destroy() {
    if (isHTMLElement(this.options.scroller)) {
      off(this.options.scroller, 'scroll', this._onScroll);
    }
    this.mutationObserver.disconnect();
    this.mutationObserver = null;
  },

  _observe() {
    const MutationObserver =
      window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    this.mutationObserver = new MutationObserver((mutationsList) => {
      const children = mutationsList[0].target.children;
      for (let i = 0, len = children.length; i < len; i++) {
        const node = children[i];
        if (!node.dataset.key || node === Sortable.ghost || css(node, 'display') === 'none') {
          continue;
        }
        const size = this.sortable.getNodeSize(node);
        this._onItemResized(node.dataset.key, size);
      }
      if (this.renderState === CACLTYPE.INIT) {
        this.renderState = CACLTYPE.DOWN;
        this.updateRange();
      }
    });

    this.mutationObserver.observe(this.sortable.el, OBSERVE_CONFIG);
  },

  _onOptionUpdated(key, value, lastOptions) {
    // delete the oberver if virtual set to false
    if (key === 'virtual') {
      value ? this._init() : this._destroy();
    }

    // update the scroll listener on node
    if (key === 'scroller') {
      off(lastOptions.scroller, 'scroll', this._onScroll);

      if (value && isHTMLElement(value)) {
        on(value, 'scroll', this._onScroll);
      }
    }

    // delete useless sizes
    if (key === 'dataKeys') {
      this.sizes.forEach((v, k) => {
        if (!value.includes(k)) {
          this.sizes.delete(k);
        }
      });
    }
  },

  _onItemResized(key, size) {
    this.sizes.set(key, size);

    if (this.calcType === CACLTYPE.INIT) {
      this.calcType = CACLTYPE.FIXED;
      this.calcSize.fixed = size;
    } else if (this._isFixed() && this.calcSize.fixed !== size) {
      this.calcType = CACLTYPE.DYNAMIC;
      this.calcSize.fixed = undefined;
    }
    // In the case of non-fixed heights, the average height and the total height are calculated
    if (this.calcType !== CACLTYPE.FIXED) {
      this.calcSize.total = [...this.sizes.values()].reduce((t, i) => t + i, 0);
      this.calcSize.average = Math.round(this.calcSize.total / this.sizes.size);
    }
  },

  _onScroll() {
    const offset = this.getOffset();
    const clientSize = this.getClientSize();
    const scrollSize = this.getScrollSize();

    // iOS scroll-spring-back behavior will make direction mistake
    if (offset < 0 || offset + clientSize > scrollSize + 1 || !scrollSize) {
      return;
    }

    if (this.offset === offset) {
      this.direction = DIRECTION.FIXED;
    } else {
      this.direction = offset < this.offset ? DIRECTION.FRONT : DIRECTION.BEHIND;
    }

    this.offset = offset;

    const params = { offset, top: false, bottom: false };

    if (this.isFront()) {
      params.top = !!this.options.dataKeys.length && offset <= 0;
      this._onScrollFront();
    } else if (this.isBehind()) {
      params.bottom = clientSize + offset + 1 >= scrollSize;
      this._onScrollBehind();
    }

    this.sortable._dispatchEvent('onScroll', params);
  },

  _onScrollFront() {
    const scrolls = this._getScrollItems();
    if (scrolls > this.range.start) {
      return;
    }
    const start = Math.max(scrolls - this.buffer, 0);
    this._checkIfUpdate(start, this._getEndByStart(start));
  },

  _onScrollBehind() {
    const scrolls = this._getScrollItems();
    if (scrolls < this.range.start + this.buffer) {
      return;
    }
    this._checkIfUpdate(scrolls, this._getEndByStart(scrolls));
  },

  _getScrollItems() {
    const offset = this.offset - this.options.headerSize;
    if (offset <= 0) {
      return 0;
    }

    if (this._isFixed()) {
      return Math.floor(offset / this.calcSize.fixed);
    }

    let low = 0;
    let high = this.options.dataKeys.length;
    let middle = 0;
    let middleOffset = 0;

    while (low <= high) {
      middle = low + Math.floor((high - low) / 2);
      middleOffset = this._getOffsetByIndex(middle);

      if (middleOffset === offset) {
        return middle;
      } else if (middleOffset < offset) {
        low = middle + 1;
      } else if (middleOffset > offset) {
        high = middle - 1;
      }
    }
    return low > 0 ? --low : 0;
  },

  _checkIfUpdate(start, end) {
    const keeps = this.options.keeps;
    const total = this.options.dataKeys.length;

    if (total <= keeps) {
      start = 0;
      end = this._getLastIndex();
    } else if (end - start < keeps - 1) {
      start = end - keeps + 1;
    }

    if (this.range.start !== start) {
      this._onUpdate(start, end);
    }
  },

  _onUpdate(start, end) {
    this.range.start = start;
    this.range.end = end;
    this.range.front = this._getPadFront();
    this.range.behind = this._getPadBehind();
    this.range.render = this._getOffsetByRange(start, end + 1);

    const eventName = this.renderState === CACLTYPE.INIT ? 'onCreate' : 'onUpdate';
    this.sortable._dispatchEvent(eventName, { ...this.range });
  },

  _getPadFront() {
    const start = this.range.start;
    if (this._isFixed()) {
      return this.calcSize.fixed * start;
    } else {
      return this._getOffsetByIndex(start);
    }
  },

  _getPadBehind() {
    const end = this.range.end;
    const last = this._getLastIndex();

    if (this._isFixed()) {
      return (last - end) * this.calcSize.fixed;
    }

    return (last - end) * this._getEstimateSize();
  },

  _getOffsetByIndex(index) {
    if (!index) {
      return 0;
    }

    const { headerSize } = this.options;
    const offset = this._getOffsetByRange(0, index);

    return headerSize + offset;
  },

  _getOffsetByRange(start, end) {
    const { dataKeys } = this.options;
    const estimateSize = this._getEstimateSize();

    let offset = 0;
    for (let i = start; i < end; i++) {
      const size = this.sizes.get(dataKeys[i]);
      offset = offset + (size || estimateSize);
    }

    return offset;
  },

  _getEndByStart(start) {
    return Math.min(start + this.options.keeps - 1, this._getLastIndex());
  },

  _getLastIndex() {
    const { keeps, dataKeys } = this.options;
    return dataKeys.length > 0 ? dataKeys.length - 1 : keeps - 1;
  },

  _getEstimateSize() {
    return this._isFixed() ? this.calcSize.fixed : this.calcSize.average || this.options.size;
  },

  _isFixed() {
    return this.calcType === CACLTYPE.FIXED;
  },

  _isHorizontal() {
    return this.sortable.getDirection() !== 'vertical';
  },
};

export default Virtual;

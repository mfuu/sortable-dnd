import Sortable from '../index.js';
import { on, off, css, isHTMLElement, getMutationObserver, isDocument } from '../utils';

const CACLTYPE = {
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

const autoObserve = function () {
  if (getMutationObserver()) return true;
  console.warn(
    `sortable-dnd: MutationObserver is not supported on this browser. You may have to call "updateItemSize" by yourself to update the node size.`
  );
  return false;
};

function Virtual(options) {
  this.options = options = Object.assign({}, options);

  const defaults = {
    size: null,
    keeps: 30,
    dataKey: 'data-key',
    dataKeys: [],
    scroller: null,
    ignoredSize: 0,
    direction: 'vertical',
  };

  // Set default options
  for (const name in defaults) {
    !(name in this.options) && (this.options[name] = defaults[name]);
  }

  this.range = { start: 0, end: 0, render: 0, front: 0, behind: 0 };
  this.sizes = new Map();
  this.offset = 0;
  this.buffer = Math.round(this.options.keeps / 3);
  this.calcSize = { average: 0, total: 0, fixed: 0 };
  this.calcType = CACLTYPE.INIT;
  this.rendered = false;
  this.scrollEl = null;
  this.scrollDirection = '';
  this.mutationObserver = null;

  // Bind all private methods
  for (let fn in this) {
    if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
      this[fn] = this[fn].bind(this);
    }
  }
}

Virtual.prototype = {
  constructor: Virtual,

  init() {
    if (isHTMLElement(this.options.scroller)) {
      this._updateScrollEl(this.options.scroller);
      on(this.options.scroller, 'scroll', this._onScroll);
    }

    autoObserve() && this._observe();
    this.updateRange();
  },

  destroy() {
    if (isHTMLElement(this.options.scroller)) {
      off(this.options.scroller, 'scroll', this._onScroll);
    }
    this.mutationObserver.disconnect();
    this.mutationObserver = null;
  },

  // ========================================= Public Methods =========================================
  getSize(dataKey) {
    return this.sizes.get(dataKey);
  },

  getOffset() {
    return this.scrollEl[this._isHorizontal() ? 'scrollLeft' : 'scrollTop'];
  },

  getClientSize() {
    return this.scrollEl[this._isHorizontal() ? 'clientWidth' : 'clientHeight'];
  },

  getScrollSize() {
    return this.scrollEl[this._isHorizontal() ? 'scrollWidth' : 'scrollHeight'];
  },

  scrollToOffset(offset) {
    this.scrollEl[this._isHorizontal() ? 'scrollLeft' : 'scrollTop'] = offset;
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

  option(key, value) {
    if (value === void 0) return this.options[key];

    // update the scroll listener on node
    if (key === 'scroller') {
      off(this.options.scroller, 'scroll', this._onScroll);

      if (value && isHTMLElement(value)) {
        on(value, 'scroll', this._onScroll);
      }
      this._updateScrollEl(value);
    }
    // delete useless sizes
    if (key === 'dataKeys') {
      this.sizes.forEach((v, k) => {
        !value.includes(k) && this.sizes.delete(k);
      });
    }

    this.options[key] = value;
  },

  updateItemSize(key, size) {
    this._onItemResized(key, size);
  },

  updateRange() {
    let start = this.range.start;
    if (this._isFront()) {
      start -= LEADING_BUFFER;
    } else if (this._isBehind()) {
      start += LEADING_BUFFER;
    }

    start = Math.max(start, 0);

    this._onUpdate(start, this._getEndByStart(start));
  },

  // ========================================= Properties =========================================
  _updateScrollEl(scroller) {
    this.scrollEl = isDocument(scroller) ? scroller.documentElement || scroller.body : scroller;
  },

  _observe() {
    const MutationObserver = getMutationObserver();
    this.mutationObserver = new MutationObserver((mutationsList) => {
      const children = mutationsList[0].target.children;
      for (let i = 0, len = children.length; i < len; i++) {
        const node = children[i];
        const key = node.getAttribute(this.options.dataKey);
        if (!key || node === Sortable.ghost || css(node, 'display') === 'none') {
          continue;
        }
        this._onItemResized(key, node[this._isHorizontal() ? 'offsetWidth' : 'offsetHeight']);
      }

      if (!this.rendered) {
        this.rendered = true;
        this.updateRange();
      }
    });

    this.mutationObserver.observe(this.Sortable.el, OBSERVE_CONFIG);
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
      this.scrollDirection = DIRECTION.FIXED;
    } else {
      this.scrollDirection = offset < this.offset ? DIRECTION.FRONT : DIRECTION.BEHIND;
    }

    this.offset = offset;

    const params = { offset, top: false, bottom: false };

    if (this._isFront()) {
      params.top = !!this.options.dataKeys.length && offset <= 0;
      this._onScrollFront();
    } else if (this._isBehind()) {
      params.bottom = clientSize + offset + 1 >= scrollSize;
      this._onScrollBehind();
    }

    this._dispatchEvent('onScroll', params);
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
    const offset = this.offset - this.options.ignoredSize;
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

    const eventName = this.rendered ? 'onUpdate' : 'onCreate';
    this._dispatchEvent(eventName, { ...this.range });
  },

  _getPadFront() {
    const start = this.range.start;

    return this._isFixed() ? this.calcSize.fixed * start : this._getOffsetByIndex(start);
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

    const offset = this._getOffsetByRange(0, index);

    return this.options.ignoredSize + offset;
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

  _isFront() {
    return this.scrollDirection === DIRECTION.FRONT;
  },

  _isBehind() {
    return this.scrollDirection === DIRECTION.BEHIND;
  },

  _isFixed() {
    return this.calcType === CACLTYPE.FIXED;
  },

  _isHorizontal() {
    return this.options.direction !== 'vertical';
  },

  _dispatchEvent: function (event, params) {
    const callback = this.options[event];
    if (typeof callback === 'function') {
      callback(params);
    }
  },
};

export default Virtual;

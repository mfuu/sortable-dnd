import { on, off, getDataKey, isHTMLElement } from '../utils';

const CACLTYPE = {
  DOWN: 'DOWN',
  INIT: 'INIT',
  FIXED: 'FIXED',
  DYNAMIC: 'DYNAMIC',
};

const DIRECTION = {
  FRONT: 'FRONT',
  BEHIND: 'BEHIND',
};

const LEADING_BUFFER = 2;

function Virtual(sortable) {
  if (!sortable.options.virtual) return;
  if (!isHTMLElement(sortable.options.scroller)) {
    throw `Sortable: \`scroller\` must be an HTMLElement, not ${{}.toString.call(
      sortable.options.scroller
    )}`;
  }

  this.sortable = sortable;
  this.options = sortable.options;

  this.offset = 0;
  this.direction = '';
  this.sizes = new Map(); // store item size

  this.renderState = CACLTYPE.INIT;

  this.calcType = CACLTYPE.INIT;
  this.calcSize = { average: 0, total: 0, fixed: 0 };

  this.range = { start: 0, end: 0, padFront: 0, padBehind: 0 };

  this.buffer = Math.round(this.options.keeps / 3);

  this.uniqueKeys = this._getUniqueKeys();
  this.isHorizontal = this.options.direction !== 'vertical';

  // Bind all private methods
  for (let fn in this) {
    if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
      this[fn] = this[fn].bind(this);
    }
  }

  on(this.options.scroller, 'scroll', this._handleScroll);

  this._observe();
  this.updateRange();
}

Virtual.prototype = {
  constructor: Virtual,

  destroy() {
    this.mutationObserver.disconnect();
    off(this.options.scroller, 'scroll', this._handleScroll);
  },

  isFront() {
    return this.direction === DIRECTION.FRONT;
  },

  isBehind() {
    return this.direction === DIRECTION.BEHIND;
  },

  isFixed() {
    return this.calcType === CACLTYPE.FIXED;
  },

  getOffset() {
    return this.options.scroller[this.isHorizontal ? 'scrollLeft' : 'scrollTop'];
  },

  getClientSize() {
    return this.options.scroller[this.isHorizontal ? 'clientWidth' : 'clientHeight'];
  },

  getScrollSize() {
    return this.options.scroller[this.isHorizontal ? 'scrollWidth' : 'scrollHeight'];
  },

  getItemSize(node) {
    return node[this.isHorizontal ? 'offsetWidth' : 'offsetHeight'];
  },

  getOffsetByIndex(index) {
    if (!index) {
      return 0;
    }

    let offset = this.options.headerSize;
    for (let i = 0; i < index; i++) {
      const size = this.sizes.get(this.uniqueKeys[i]);
      offset = offset + (typeof size === 'number' ? size : this._getItemSize());
    }

    return offset;
  },

  updateOptions(key, value) {
    if (this.options && key in this.options) {
      this.options[key] = value;

      if (key === 'dataSource') {
        this.uniqueKeys = this._getUniqueKeys();
        this.sizes.forEach((v, k) => {
          if (!this.uniqueKeys.includes(k)) {
            this.sizes.delete(k);
          }
        });
      }
    }
  },

  updateRange() {
    let start = this.range.start;
    if (this.isFront()) {
      start -= LEADING_BUFFER;
    } else if (this.isBehind()) {
      start += LEADING_BUFFER;
    }

    start = Math.max(start, 0);

    this._handleUpdate(start, this._getEndByStart(start));
  },

  _observe() {
    const config = { attributes: false, childList: true, subtree: true };

    this.mutationObserver = new MutationObserver((mutationsList) => {
      for (let i = 0; i < mutationsList.length; i++) {
        const node = mutationsList[i].addedNodes[0];
        if (!node) continue;
        const dataKey = node.dataset.key;
        const size = this.getItemSize(node);
        this._handleItemSizeChange(dataKey, size);
      }
      if (this.renderState === CACLTYPE.INIT) {
        this.updateRange();
        this.renderState = CACLTYPE.DOWN;
      }
    });

    this.mutationObserver.observe(this.sortable.el, config);
  },

  _handleItemSizeChange(key, size) {
    this.sizes.set(key, size);

    if (this.calcType === CACLTYPE.INIT) {
      this.calcType = CACLTYPE.FIXED;
      this.calcSize.fixed = size;
    } else if (this.isFixed() && this.calcSize.fixed !== size) {
      this.calcType = CACLTYPE.DYNAMIC;
      this.calcSize.fixed = undefined;
    }
    // In the case of non-fixed heights, the average height and the total height are calculated
    if (this.calcType !== CACLTYPE.FIXED) {
      this.calcSize.total = [...this.sizes.values()].reduce((t, i) => t + i, 0);
      this.calcSize.average = Math.round(this.calcSize.total / this.sizes.size);
    }
  },

  _handleScroll() {
    const offset = this.getOffset();
    const clientSize = this.getClientSize();
    const scrollSize = this.getScrollSize();

    // iOS scroll-spring-back behavior will make direction mistake
    if (offset < 0 || offset + clientSize > scrollSize + 1 || !scrollSize) {
      return;
    }

    this.direction = offset < this.offset || offset === 0 ? DIRECTION.FRONT : DIRECTION.BEHIND;
    this.offset = offset;

    const params = { offset, top: false, bottom: false };

    if (this.isFront()) {
      params.top = offset <= 0;
      this._handleScrollFront();
    } else if (this.isBehind()) {
      params.bottom = clientSize + offset >= scrollSize;
      this._handleScrollBehind();
    }

    this.sortable._dispatchEvent('onScroll', params);
  },

  _handleScrollFront() {
    const scrolls = this._getScrollItems();
    if (scrolls > this.range.start) {
      return;
    }
    const start = Math.max(scrolls - this.buffer, 0);
    this._checkIfUpdate(start, this._getEndByStart(start));
  },

  _handleScrollBehind() {
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

    if (this.isFixed()) {
      return Math.floor(offset / this.calcSize.fixed);
    }

    let low = 0;
    let high = this.uniqueKeys.length;
    let middle = 0;
    let middleOffset = 0;

    while (low <= high) {
      middle = low + Math.floor((high - low) / 2);
      middleOffset = this.getOffsetByIndex(middle);

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
    const total = this.uniqueKeys.length;

    if (total <= keeps) {
      start = 0;
      end = this._getLastIndex();
    } else if (end - start < keeps - 1) {
      start = end - keeps + 1;
    }

    if (this.range.start !== start) {
      this._handleUpdate(start, end);
    }
  },

  _handleUpdate(start, end) {
    this.range.start = start;
    this.range.end = end;
    this.range.padFront = this._getPadFront();
    this.range.padBehind = this._getPadBehind();

    this.sortable._dispatchEvent('onUpdate', { ...this.range });
  },

  _getPadFront() {
    const start = this.range.start;
    if (this.isFixed()) {
      return this.calcSize.fixed * start;
    } else {
      return this.getOffsetByIndex(start);
    }
  },

  _getPadBehind() {
    const end = this.range.end;
    const last = this._getLastIndex();

    if (this.isFixed()) {
      return (last - end) * this.calcSize.fixed;
    }

    return (last - end) * this._getItemSize();
  },

  _getEndByStart(start) {
    return Math.min(start + this.options.keeps - 1, this._getLastIndex());
  },

  _getLastIndex() {
    const { keeps } = this.options;
    return this.uniqueKeys.length > 0 ? this.uniqueKeys.length - 1 : keeps - 1;
  },

  _getItemSize() {
    return this.isFixed() ? this.calcSize.fixed : this.calcSize.average || this.options.size;
  },

  _getUniqueKeys() {
    let uniqueKeys = [];
    const { dataKey, dataSource } = this.options;
    for (let i = 0; i < dataSource.length; i++) {
      uniqueKeys.push(getDataKey(dataSource[i], dataKey));
    }
    return uniqueKeys;
  },
};

export default Virtual;

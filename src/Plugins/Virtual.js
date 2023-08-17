import { on, off, css, isHTMLElement } from '../utils';

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

  this.range = { start: 0, end: 0, front: 0, behind: 0 };

  this.buffer = Math.round(this.options.keeps / 3);
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

  getSize(dataKey) {
    return this.sizes.get(dataKey);
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

  scrollToOffset(offset) {
    const scrollKey = this.isHorizontal ? 'scrollLeft' : 'scrollTop';
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
    const scrollSize = this.getScrollSize();
    this.scrollToOffset(scrollSize);

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

  updateOption(key, value) {
    if (this.options && key in this.options) {
      this.options[key] = value;

      if (key === 'dataKeys') {
        this.sizes.forEach((v, k) => {
          if (!value.includes(k)) {
            this.sizes.delete(k);
          }
        });
      }
    }
  },

  _isFixed() {
    return this.calcType === CACLTYPE.FIXED;
  },

  _observe() {
    const config = { attributes: false, childList: true, subtree: true };

    this.mutationObserver = new MutationObserver((mutationsList) => {
      for (let i = 0; i < mutationsList.length; i++) {
        const node = mutationsList[i].addedNodes[0];
        if (!node) continue;
        const dataKey = node.dataset.key;
        const size = this._getItemSize(node);
        this._handleItemResized(dataKey, size);
      }
      if (this.renderState === CACLTYPE.INIT) {
        this.renderState = CACLTYPE.DOWN;
        this.updateRange();
      }
    });

    this.mutationObserver.observe(this.sortable.el, config);
  },

  _handleItemResized(key, size) {
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
      params.bottom = clientSize + offset + 1 >= scrollSize;
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
      this._handleUpdate(start, end);
    }
  },

  _handleUpdate(start, end) {
    this.range.start = start;
    this.range.end = end;
    this.range.front = this._getPadFront();
    this.range.behind = this._getPadBehind();

    const padding = this.isHorizontal
      ? `0px ${this.range.front} 0px ${this.range.behind}`
      : `${this.range.front}px 0px ${this.range.behind}px`;
    css(this.sortable.el, 'padding', padding);

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

    const { headerSize, dataKeys } = this.options;

    let offset = headerSize;
    for (let i = 0; i < index; i++) {
      const size = this.sizes.get(dataKeys[i]);
      offset = offset + (typeof size === 'number' ? size : this._getEstimateSize());
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

  _getItemSize(node) {
    return node[this.isHorizontal ? 'offsetWidth' : 'offsetHeight'];
  },

  _getEstimateSize() {
    return this._isFixed() ? this.calcSize.fixed : this.calcSize.average || this.options.size;
  },
};

export default Virtual;

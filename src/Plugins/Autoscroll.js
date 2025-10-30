import { expando, getScrollingElement, getRect } from '../utils.js';

function AutoScroll(options) {
  this.options = options;
  this.scrollEl = null;
  this.autoScrollInterval = null;
}

AutoScroll.prototype = {
  nulling() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  },

  onStarted() {
    this.nulling();
    this.autoScrollInterval = setInterval(this.autoScroll.bind(this));
  },

  onMove(target, moveEvent, el, defaultOptions) {
    const options = el ? el[expando].options : defaultOptions;
    if (el && !options.autoScroll) {
      this.scrollEl = null;
      return;
    }

    this.options = options;
    this.scrollEl = getScrollingElement(target, true);
    this.moveEvent = moveEvent;
  },

  autoScroll() {
    let options = this.options,
      event = this.moveEvent,
      scrollEl = this.scrollEl,
      scrollThreshold = options.scrollThreshold,
      scrollSpeed = options.scrollSpeed;

    if (!scrollEl || event.clientX === void 0 || event.clientY === void 0) return;

    const rect = getRect(scrollEl);
    if (!rect) return;

    const { clientX, clientY } = event;
    const { top, right, bottom, left, height, width } = rect;

    // execute only inside scrolling elements
    if (clientY < top || clientX > right || clientY > bottom || clientX < left) return;

    const { scrollTop, scrollLeft, scrollHeight, scrollWidth } = scrollEl;

    scrollEl.scrollLeft += this.getScrollOffset(
      clientX,
      left,
      right,
      scrollThreshold,
      scrollSpeed.x,
      scrollLeft,
      scrollWidth,
      width
    );
    scrollEl.scrollTop += this.getScrollOffset(
      clientY,
      top,
      bottom,
      scrollThreshold,
      scrollSpeed.y,
      scrollTop,
      scrollHeight,
      height
    );
  },

  getScrollOffset(mousePos, edgeStart, edgeEnd, threshold, speed, scrollPos, maxScroll, dimension) {
    if (scrollPos > 0 && mousePos >= edgeStart && mousePos <= edgeStart + threshold) {
      return Math.max(-1, (mousePos - edgeStart) / threshold - 1) * speed;
    } else if (
      scrollPos + dimension < maxScroll &&
      mousePos <= edgeEnd &&
      mousePos >= edgeEnd - threshold
    ) {
      return Math.min(1, (mousePos - edgeEnd) / threshold + 1) * speed;
    }

    return 0;
  },
};

export default AutoScroll;

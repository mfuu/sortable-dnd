import { getRect } from '../utils.js';

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
    this.autoScrollInterval = setInterval(() => {
      this.autoScroll();
    });
  },

  onMove(scrollEl, moveEvent, options) {
    this.options = options;
    this.scrollEl = scrollEl;
    this.moveEvent = moveEvent;
  },

  autoScroll() {
    let event = this.moveEvent;
    let scrollEl = this.scrollEl;

    if (!scrollEl || event.clientX === void 0 || event.clientY === void 0) return;

    const rect = getRect(scrollEl);
    if (!rect) return;

    const { clientX, clientY } = event;
    const { top, right, bottom, left, height, width } = rect;

    // execute only inside scrolling elements
    if (clientY < top || clientX > right || clientY > bottom || clientX < left) return;

    const { scrollThreshold, scrollSpeed } = this.options;
    const { scrollTop, scrollLeft, scrollHeight, scrollWidth } = scrollEl;

    // check direction
    let toTop = scrollTop > 0 && clientY >= top && clientY <= top + scrollThreshold,
      toLeft = scrollLeft > 0 && clientX >= left && clientX <= left + scrollThreshold,
      toRight =
        scrollLeft + width < scrollWidth && clientX <= right && clientX >= right - scrollThreshold,
      toBottom =
        scrollTop + height < scrollHeight &&
        clientY <= bottom &&
        clientY >= bottom - scrollThreshold;

    if (toLeft) {
      scrollEl.scrollLeft += Math.floor(
        Math.max(-1, (clientX - left) / scrollThreshold - 1) * scrollSpeed.x
      );
    }
    if (toRight) {
      scrollEl.scrollLeft += Math.ceil(
        Math.min(1, (clientX - right) / scrollThreshold + 1) * scrollSpeed.x
      );
    }
    if (toTop) {
      scrollEl.scrollTop += Math.floor(
        Math.max(-1, (clientY - top) / scrollThreshold - 1) * scrollSpeed.y
      );
    }
    if (toBottom) {
      scrollEl.scrollTop += Math.ceil(
        Math.min(1, (clientY - bottom) / scrollThreshold + 1) * scrollSpeed.y
      );
    }
  },
};

export default AutoScroll;

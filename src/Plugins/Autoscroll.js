import { getRect } from '../utils.js';

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = function (callback) {
    return setTimeout(callback, 17);
  };
}
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
}

function AutoScroll(options) {
  this.options = options;
  this.autoScrollAnimationFrame = null;
}

AutoScroll.prototype = {
  stop() {
    if (!this.autoScrollAnimationFrame) return;

    cancelAnimationFrame(this.autoScrollAnimationFrame);
    this.autoScrollAnimationFrame = null;
  },

  start(scrollEl, dragEvent, moveEvent) {
    cancelAnimationFrame(this.autoScrollAnimationFrame);
    this.autoScrollAnimationFrame = requestAnimationFrame(() => {
      if (dragEvent && moveEvent) {
        this.autoScroll(scrollEl, moveEvent);
      }
      this.start(scrollEl, dragEvent, moveEvent);
    });
  },

  autoScroll(scrollEl, evt) {
    if (!scrollEl || evt.clientX === void 0 || evt.clientY === void 0) return;

    const rect = getRect(scrollEl);
    if (!rect) return;

    const { clientX, clientY } = evt;
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

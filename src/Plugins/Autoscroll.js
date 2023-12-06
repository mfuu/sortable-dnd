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
  clear() {
    if (this.autoScrollAnimationFrame == null) {
      return;
    }
    cancelAnimationFrame(this.autoScrollAnimationFrame);
    this.autoScrollAnimationFrame = null;
  },

  update(scrollEl, dragEvent, moveEvent) {
    cancelAnimationFrame(this.autoScrollAnimationFrame);
    this.autoScrollAnimationFrame = requestAnimationFrame(() => {
      if (dragEvent && moveEvent) {
        this.autoScroll(scrollEl, moveEvent);
      }
      this.update(scrollEl, dragEvent, moveEvent);
    });
  },

  autoScroll(scrollEl, evt) {
    if (!scrollEl || evt.clientX === void 0 || evt.clientY === void 0) return;

    const rect = getRect(scrollEl);
    if (!rect) return;

    const { clientX, clientY } = evt;
    const { top, right, bottom, left, height, width } = rect;

    if (clientY < top || clientX > right || clientY > bottom || clientX < left) {
      return;
    }

    const { scrollThreshold, scrollSpeed } = this.options;
    const { scrollTop, scrollLeft, scrollHeight, scrollWidth } = scrollEl;

    // check direction
    const toTop = scrollTop > 0 && clientY >= top && clientY <= top + scrollThreshold;
    const toLeft = scrollLeft > 0 && clientX >= left && clientX <= left + scrollThreshold;
    const toRight =
      scrollLeft + width < scrollWidth && clientX <= right && clientX >= right - scrollThreshold;
    const toBottom =
      scrollTop + height < scrollHeight && clientY <= bottom && clientY >= bottom - scrollThreshold;

    let scrollx = 0,
      scrolly = 0;

    if (toLeft) {
      scrollx = Math.floor(Math.max(-1, (clientX - left) / scrollThreshold - 1) * scrollSpeed.x);
    }
    if (toRight) {
      scrollx = Math.ceil(Math.min(1, (clientX - right) / scrollThreshold + 1) * scrollSpeed.x);
    }
    if (toTop) {
      scrolly = Math.floor(Math.max(-1, (clientY - top) / scrollThreshold - 1) * scrollSpeed.y);
    }
    if (toBottom) {
      scrolly = Math.ceil(Math.min(1, (clientY - bottom) / scrollThreshold + 1) * scrollSpeed.y);
    }

    if (scrolly) {
      scrollEl.scrollTop += scrolly;
    }

    if (scrollx) {
      scrollEl.scrollLeft += scrollx;
    }
  },
};

export default AutoScroll;

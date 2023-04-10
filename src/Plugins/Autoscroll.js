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

function AutoScroll() {
  this.autoScrollAnimationFrame = null;
  this.speed = { x: 10, y: 10 };
}

AutoScroll.prototype = {
  clear() {
    if (this.autoScrollAnimationFrame == null) {
      return;
    }
    cancelAnimationFrame(this.autoScrollAnimationFrame);
    this.autoScrollAnimationFrame = null;
  },

  update(scrollEl, scrollThreshold, downEvent, moveEvent) {
    cancelAnimationFrame(this.autoScrollAnimationFrame);
    this.autoScrollAnimationFrame = requestAnimationFrame(() => {
      if (downEvent && moveEvent) {
        this.autoScroll(scrollEl, scrollThreshold, moveEvent);
      }
      this.update(scrollEl, scrollThreshold, downEvent, moveEvent);
    });
  },

  autoScroll(scrollEl, scrollThreshold, evt) {
    if (!scrollEl) return;
    const { clientX, clientY } = evt;
    if (clientX === void 0 || clientY === void 0) return;

    const rect = getRect(scrollEl);
    if (!rect) return;

    const { scrollTop, scrollLeft, scrollHeight, scrollWidth } = scrollEl;
    const { top, right, bottom, left, height, width } = rect;

    if (
      clientY < top ||
      clientX > right ||
      clientY > bottom ||
      clientX < left
    ) {
      return;
    }

    // check direction
    const toTop =
      scrollTop > 0 && clientY >= top && clientY <= top + scrollThreshold;
    const toLeft =
      scrollLeft > 0 && clientX >= left && clientX <= left + scrollThreshold;
    const toRight =
      scrollLeft + width < scrollWidth &&
      clientX <= right &&
      clientX >= right - scrollThreshold;
    const toBottom =
      scrollTop + height < scrollHeight &&
      clientY <= bottom &&
      clientY >= bottom - scrollThreshold;

    let scrollx = 0,
      scrolly = 0;

    if (toLeft) {
      scrollx = Math.floor(
        Math.max(-1, (clientX - left) / scrollThreshold - 1) * this.speed.x
      );
    } else if (toRight) {
      scrollx = Math.ceil(
        Math.min(1, (clientX - right) / scrollThreshold + 1) * this.speed.x
      );
    } else {
      scrollx = 0;
    }

    if (toTop) {
      scrolly = Math.floor(
        Math.max(-1, (clientY - top) / scrollThreshold - 1) * this.speed.y
      );
    } else if (toBottom) {
      scrolly = Math.ceil(
        Math.min(1, (clientY - bottom) / scrollThreshold + 1) * this.speed.y
      );
    } else {
      scrolly = 0;
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

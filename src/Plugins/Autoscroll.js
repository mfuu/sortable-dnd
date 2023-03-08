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

export default class AutoScroll {
  constructor() {
    this.autoScrollAnimationFrame = null;
    this.speed = { x: 10, y: 10 };
  }

  clear() {
    if (this.autoScrollAnimationFrame == null) {
      return;
    }
    cancelAnimationFrame(this.autoScrollAnimationFrame);
    this.autoScrollAnimationFrame = null;
  }

  update(parentNode, scrollThreshold, downEvent, moveEvent) {
    if (downEvent && moveEvent) {
      this.autoScroll(parentNode, scrollThreshold, moveEvent);
    }
    cancelAnimationFrame(this.autoScrollAnimationFrame);
    this.autoScrollAnimationFrame = requestAnimationFrame(() =>
      this.update(parentNode, scrollThreshold, downEvent, moveEvent),
    );
  }

  autoScroll(parentNode, scrollThreshold, evt) {
    if (!parentNode) return;
    const { clientX, clientY } = evt;
    if (clientX === void 0 || clientY === void 0) return;

    const rect = getRect(parentNode);
    if (!rect) return;

    const {
      scrollTop,
      scrollLeft,
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth,
    } = parentNode;
    const { top, right, bottom, left, height, width } = rect;

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
        Math.max(-1, (clientX - left) / scrollThreshold - 1) * this.speed.x,
      );
    } else if (toRight) {
      scrollx = Math.ceil(
        Math.min(1, (clientX - right) / scrollThreshold + 1) * this.speed.x,
      );
    } else {
      scrollx = 0;
    }

    if (toTop) {
      scrolly = Math.floor(
        Math.max(-1, (clientY - top) / scrollThreshold - 1) * this.speed.y,
      );
    } else if (toBottom) {
      scrolly = Math.ceil(
        Math.min(1, (clientY - bottom) / scrollThreshold + 1) * this.speed.y,
      );
    } else {
      scrolly = 0;
    }

    if (scrolly) {
      parentNode.scrollTop += scrolly;
    }

    if (scrollx) {
      parentNode.scrollLeft += scrollx;
    }
  }
}

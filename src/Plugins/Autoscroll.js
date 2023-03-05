import { getRect } from '../utils.js';

export default class AutoScroll {
  constructor() {
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
    this.timer = null;
  }

  clear() {
    if (this.timer == null) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = null;
  }

  update(Sortable, eventState) {
    if (!Sortable.scrollEl) return;
    // check if is moving now
    if (!(eventState.down && eventState.move)) return;
    const { clientX, clientY } = eventState.move;
    if (clientX === void 0 || clientY === void 0) return;

    const rect = getRect(Sortable.scrollEl);
    if (!rect) return;

    const {
      scrollTop,
      scrollLeft,
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth,
    } = Sortable.scrollEl;
    const { top, right, bottom, left, height, width } = rect;
    const { scrollThreshold } = Sortable.options;

    // check direction
    const totop =
      scrollTop > 0 && clientY >= top && clientY <= top + scrollThreshold;
    const toleft =
      scrollLeft > 0 && clientX >= left && clientX <= left + scrollThreshold;
    const toright =
      scrollLeft + width < scrollWidth &&
      clientX <= right &&
      clientX >= right - scrollThreshold;
    const tobottom =
      scrollTop + height < scrollHeight &&
      clientY <= bottom &&
      clientY >= bottom - scrollThreshold;

    let scrollx = 0,
      scrolly = 0;

    if (toleft) {
      scrollx = Math.floor(
        Math.max(-1, (clientX - left) / scrollThreshold - 1) * 10,
      );
    } else if (toright) {
      scrollx = Math.ceil(
        Math.min(1, (clientX - right) / scrollThreshold + 1) * 10,
      );
    } else {
      scrollx = 0;
    }

    if (totop) {
      scrolly = Math.floor(
        Math.max(-1, (clientY - top) / scrollThreshold - 1) * 10,
      );
    } else if (tobottom) {
      scrolly = Math.ceil(
        Math.min(1, (clientY - bottom) / scrollThreshold + 1) * 10,
      );
    } else {
      scrolly = 0;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (scrolly) {
        this.scrollY(Sortable.scrollEl, scrolly);
      }

      if (scrollx) {
        this.scrollX(Sortable.scrollEl, scrollx);
      }
    });
  }

  scrollX(el, amount) {
    if (el === window) {
      window.scrollTo(el.pageXOffset + amount, el.pageYOffset);
    } else {
      el.scrollLeft += amount;
    }
  }

  scrollY(el, amount) {
    if (el === window) {
      window.scrollTo(el.pageXOffset, el.pageYOffset + amount);
    } else {
      el.scrollTop += amount;
    }
  }
}

import {
  expando,
  getRect,
  getScrollingElement,
  requestAnimationFrame,
  cancelAnimationFrame,
} from '../utils.js';

function AutoScroll(options) {
  this.options = options;
  this.scrollEl = null;
  this.scrollElRect = null;
  this.moveEvent = null;
  this.scrolling = false;
  this.autoScrollFrameId = null;

  this.loopScroll = this.loopScroll.bind(this);
  this.autoScroll = this.autoScroll.bind(this);
}

AutoScroll.prototype = {
  nulling() {
    this.stopLoop();
    this.scrollEl = null;
    this.scrollElRect = null;
    this.moveEvent = null;
  },

  onStarted() {
    this.nulling();
  },

  onMove(target, moveEvent, el, defaultOptions) {
    const options = el ? el[expando].options : defaultOptions;
    if (el && !options.autoScroll) {
      this.nulling();
      return;
    }

    this.options = options;
    this.moveEvent = moveEvent;

    const nextScrollEl = getScrollingElement(target, true);
    if (nextScrollEl !== this.scrollEl) {
      this.scrollEl = nextScrollEl;
      if (this.scrollEl) {
        this.scrollElRect = getRect(this.scrollEl);
      } else {
        this.scrollElRect = null;
      }
    }

    if (this.scrollEl && this.checkInThreshold()) {
      this.startLoop();
    } else {
      this.stopLoop();
    }
  },

  startLoop() {
    if (!this.scrolling) {
      this.scrolling = true;
      this.autoScrollFrameId = requestAnimationFrame(this.loopScroll);
    }
  },

  stopLoop() {
    if (this.scrolling) {
      this.scrolling = false;
      if (this.autoScrollFrameId) {
        cancelAnimationFrame(this.autoScrollFrameId);
        this.autoScrollFrameId = null;
      }
    }
  },

  loopScroll() {
    if (!this.scrolling) return;

    this.autoScroll();

    if (this.scrollEl && this.checkInThreshold()) {
      this.autoScrollFrameId = requestAnimationFrame(this.loopScroll);
    } else {
      this.scrolling = false;
      this.autoScrollFrameId = null;
    }
  },

  autoScroll() {
    let options = this.options,
      event = this.moveEvent,
      rect = this.scrollElRect,
      scrollEl = this.scrollEl,
      scrollThreshold = options.scrollThreshold,
      scrollSpeed = options.scrollSpeed;

    if (!scrollEl || !rect || event.clientX === void 0 || event.clientY === void 0) return;

    const { clientX, clientY } = event;
    const { top, right, bottom, left, height, width } = rect;
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

  checkInThreshold() {
    const event = this.moveEvent;
    const rect = this.scrollElRect;

    if (!rect || event.clientX === void 0 || event.clientY === void 0) return false;

    const { clientX, clientY } = event;
    const { top, right, bottom, left, height, width } = rect;
    const threshold = this.options.scrollThreshold;

    // execute only inside scrolling elements
    if (clientY < top || clientX > right || clientY > bottom || clientX < left) return false;

    const { scrollTop, scrollLeft, scrollHeight, scrollWidth } = this.scrollEl;
    const dimensionWidth = rect.width;
    const dimensionHeight = rect.height;

    // check if we can scroll in y direction
    const canScrollY = scrollHeight > dimensionHeight;
    const inTopThreshold = scrollTop > 0 && clientY <= top + threshold;
    const inBottomThreshold =
      scrollTop + dimensionHeight < scrollHeight && clientY >= bottom - threshold;

    // check if we can scroll in x direction
    const canScrollX = scrollWidth > dimensionWidth;
    const inLeftThreshold = scrollLeft > 0 && clientX <= left + threshold;
    const inRightThreshold =
      scrollLeft + dimensionWidth < scrollWidth && clientX >= right - threshold;

    return (
      (canScrollY && (inTopThreshold || inBottomThreshold)) ||
      (canScrollX && (inLeftThreshold || inRightThreshold))
    );
  },
};

export default AutoScroll;

import { getRect, setTransitionDuration, setTransform } from '../utils.js';
import Sortable from '../index.js';

function Animation(options) {
  this.options = options;
  this.animations = [];
}

Animation.prototype = {
  collect(dragEl, dropEl, container, except) {
    if (!container) return;
    const children = Array.prototype.slice.call(container.children);
    let { start, end } = this._getRange(children, dragEl, dropEl, except);

    this.animations.length = 0;

    const offsetHeight = (dragEl || dropEl).offsetHeight;
    const max = Math.floor(container.scrollHeight / offsetHeight);
    const min = Math.min(children.length - 1, max);

    if (start < 0) {
      start = end;
      end = min;
    }
    if (end < 0) end = min;

    children.slice(start, end + 1).forEach((node) => {
      if (node === except || node === Sortable.helper) return;
      this.animations.push({ node, rect: getRect(node) });
    });
  },

  animate() {
    this.animations.forEach((state) => {
      const { node, rect } = state;
      this._excute(node, rect);
    });
  },

  _excute(el, { left, top }) {
    const rect = getRect(el);
    const ot = top - rect.top;
    const ol = left - rect.left;

    setTransitionDuration(el);
    setTransform(el, `translate3d(${ol}px, ${ot}px, 0)`);

    // repaint
    el.offsetWidth;

    const duration = this.options.animation;

    setTransitionDuration(el, duration);
    setTransform(el, 'translate3d(0px, 0px, 0px)');

    clearTimeout(el.animated);
    el.animated = setTimeout(() => {
      setTransitionDuration(el);
      setTransform(el, '');
      el.animated = null;
    }, duration);
  },

  _getRange(children, dragEl, dropEl) {
    let start = children.indexOf(dragEl);
    let end = children.indexOf(dropEl);
    if (start > end) [start, end] = [end, start];
    return { start, end };
  },
};

export default Animation;

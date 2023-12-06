import Sortable from '../index.js';
import { css, getRect, setTransform, setTransitionDuration } from '../utils.js';

function Animation(options) {
  this.options = options;
  this.animations = [];
}

Animation.prototype = {
  collect(dragEl, dropEl, parentEl, except) {
    if (!parentEl) return;
    const children = Array.prototype.slice.call(parentEl.children);
    const { start, end } = this._getRange(children, dragEl, dropEl);

    this.animations.length = 0;

    for (let i = start; i <= end; i++) {
      const node = children[i];
      if (!node || css(node, 'display') === 'none') continue;
      if (node === except || node === Sortable.ghost) continue;
      this.animations.push({ node: node, rect: getRect(node) });
    }
  },

  animate() {
    for (let i = 0, len = this.animations.length; i < len; i++) {
      const { node, rect } = this.animations[i];
      this._excute(node, rect);
    }
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

    if (start < 0) {
      start = end;
      end = children.length - 1;
    }
    if (end < 0) end = children.length - 1;

    return { start, end };
  },
};

export default Animation;

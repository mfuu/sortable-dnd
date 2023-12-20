import Sortable from '../index.js';
import { css, getRect, setTransform, setTransitionDuration } from '../utils.js';

function Animation(options) {
  this.options = options;
  this.animations = [];
}

Animation.prototype = {
  collect(parentEl) {
    if (!parentEl) return;
    const children = Array.prototype.slice.call(parentEl.children);

    const animations = [];
    for (let i = 0; i <= children.length; i++) {
      const node = children[i];
      if (!node || node === Sortable.ghost || css(node, 'display') === 'none') {
        continue;
      }
      animations.push({ node: node, rect: getRect(node) });
    }

    this.animations.push(animations);
  },

  animate() {
    const animations = this.animations.pop();
    for (let i = 0, len = animations.length; i < len; i++) {
      const { node, rect } = animations[i];
      this._excute(node, rect);
    }
  },

  _excute(el, { left, top }) {
    const rect = getRect(el);

    if (rect.top === top && rect.left === left) {
      return;
    }
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
};

export default Animation;

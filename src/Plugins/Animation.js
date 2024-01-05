import Sortable from '../index.js';
import { css, getRect, setTransform, setTransitionDuration } from '../utils.js';

function Animation(options) {
  this.options = options;
  this.animations = [];
}

Animation.prototype = {
  collect(parentEl) {
    if (!parentEl) return;

    let parentRect = getRect(parentEl),
      docWidth =
        window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
      docHeight =
        window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
      maxWidth = Math.min(parentRect.right, docWidth),
      maxHeight = Math.min(parentRect.bottom, docHeight),
      children = Array.prototype.slice.call(parentEl.children),
      animations = [];

    for (let i = 0; i <= children.length; i++) {
      const node = children[i];
      if (!node || node === Sortable.ghost || css(node, 'display') === 'none') {
        continue;
      }

      const rect = getRect(node);

      if (rect.bottom < 0 || rect.right < 0) {
        continue;
      }

      // Animate only elements within the visible area
      if (rect.top - rect.height > maxHeight || rect.left - rect.width > maxWidth) {
        break;
      }

      animations.push({ node: node, rect });
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

    setTransitionDuration(el, this.options.animation);
    setTransform(el, 'translate3d(0px, 0px, 0px)');

    clearTimeout(el.animated);
    el.animated = setTimeout(() => {
      setTransitionDuration(el);
      setTransform(el, '');
      el.animated = null;
    }, this.options.animation);
  },
};

export default Animation;

import Sortable from '../index.js';
import { css, getRect } from '../utils.js';

function Animation(options) {
  this.options = options;
  this.stack = [];
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

    for (let i = 0, len = children.length; i <= len; i++) {
      const el = children[i];
      if (!el || el === Sortable.ghost || css(el, 'display') === 'none') continue;

      const rect = getRect(el);
      if (rect.bottom < 0 || rect.right < 0) continue;

      // Animate only elements within the visible area
      if (rect.top - rect.height > maxHeight || rect.left - rect.width > maxWidth) break;

      animations.push({ el, rect });
    }

    this.stack.push(animations);
  },

  animate() {
    const animations = this.stack.pop();

    if (!animations || !this.options.animation) return;

    for (let i = 0, len = animations.length; i < len; i++) {
      const { el, rect } = animations[i];
      this._excute(el, rect);
    }
  },

  _excute(el, fromRect) {
    const toRect = getRect(el);
    if (toRect.top === fromRect.top && toRect.left === fromRect.left) return;

    const dx = fromRect.left - toRect.left;
    const dy = fromRect.top - toRect.top;

    css(el, 'transition', '');
    css(el, 'transform', `translate3d(${dx}px, ${dy}px, 0)`);

    // repaint
    el.offsetWidth;

    const { animation, easing } = this.options;
    css(el, 'transition', `transform ${animation}ms ${easing ? ' ' + easing : ''}`);
    css(el, 'transform', 'translate3d(0px, 0px, 0px)');

    typeof el.animated === 'number' && clearTimeout(el.animated);
    el.animated = setTimeout(() => {
      css(el, 'transition', '');
      css(el, 'transform', '');
      el.animated = null;
    }, animation);
  },
};

export default Animation;

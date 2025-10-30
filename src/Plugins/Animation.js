import Sortable from '../index.js';
import { css, getRect, isRectEqual, matrix, repaint } from '../utils.js';

function Animation(options) {
  this.options = options;
  this.animationStack = [];
  this.animationCallbackId = null;
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

    // Animate only elements within the visible area
    for (let i = 0, len = children.length; i < len; i++) {
      const el = children[i];
      if (el === Sortable.ghost || css(el, 'display') === 'none') continue;

      const rect = getRect(el);
      if (rect.bottom < 0 || rect.right < 0) continue;

      // buffer front
      if (animations.length === 0 && el.previousElementSibling) {
        let prevEl = el.previousElementSibling;
        do {
          if (prevEl && prevEl !== Sortable.ghost && css(prevEl, 'display') !== 'none') {
            break;
          }
        } while ((prevEl = prevEl.previousElementSibling));

        if (prevEl) {
          animations.push({ el: prevEl, rect: getRect(prevEl) });
        }
      }

      // buffer behind
      if (rect.top - rect.height > maxHeight || rect.left - rect.width > maxWidth) {
        animations.push({ el, rect });
        break;
      }

      animations.push({ el, rect });
    }

    this.animationStack.push(animations);
  },

  animate(callback) {
    let animations = this.animationStack.pop(),
      animation = this.options.animation;

    if (!animations || !animation) {
      clearTimeout(this.animationCallbackId);
      typeof callback === 'function' && callback();
      return;
    }

    let maxAnimationTime = 0;
    animations.forEach((item) => {
      let duration = 0,
        el = item.el,
        toRect = getRect(el),
        fromRect = item.rect,
        prevToRect = el.prevToRect,
        prevFromRect = el.prevFromRect;

      // if element is animating, try to calculate the remaining duration
      if (el.animating && prevFromRect && prevToRect && isRectEqual(fromRect, toRect)) {
        const elMatrix = matrix(el, true);
        if (elMatrix) {
          const remainingRect = { top: toRect.top - elMatrix.f, left: toRect.left - elMatrix.e };
          const remainingDistance = calculateDistance(remainingRect, toRect);

          const distance = calculateDistance(prevFromRect, prevToRect);

          duration = (remainingDistance / distance) * animation;
        }
      }

      if (!isRectEqual(fromRect, toRect)) {
        el.prevFromRect = fromRect;
        el.prevToRect = toRect;

        if (!duration) {
          duration = animation;
        }

        this.execute(el, fromRect, toRect, duration);
      }

      if (duration) {
        maxAnimationTime = Math.max(maxAnimationTime, duration);
      }
    });

    clearTimeout(this.animationCallbackId);
    if (maxAnimationTime) {
      this.animationCallbackId = setTimeout(() => {
        typeof callback === 'function' && callback();
      }, maxAnimationTime);
    } else {
      typeof callback === 'function' && callback();
    }
  },

  execute(el, fromRect, toRect, duration) {
    let easing = this.options.easing || '',
      dx = fromRect.left - toRect.left,
      dy = fromRect.top - toRect.top;

    css(el, 'transition', '');
    css(el, 'transform', `translate3d(${dx}px, ${dy}px, 0)`);

    this.repaintDummy = repaint(el);

    css(el, 'transition', `transform ${duration}ms ${easing}`);
    css(el, 'transform', 'translate3d(0px, 0px, 0px)');

    typeof el.animating === 'number' && clearTimeout(el.animating);
    el.animating = setTimeout(() => {
      css(el, 'transition', '');
      css(el, 'transform', '');

      el.prevFromRect = null;
      el.prevToRect = null;
      el.animating = null;
    }, duration);
  },
};

function calculateDistance(fromRect, toRect) {
  return Math.sqrt(
    Math.pow(fromRect.left - toRect.left, 2) + Math.pow(fromRect.top - toRect.top, 2)
  );
}

export default Animation;

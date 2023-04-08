import { getRect, setTransition, setTransform } from '../utils.js';

function Animation() {
  this.animations = [];
}

Animation.prototype = {
  collect(dragEl, dropEl, container) {
    if (!container) return;
    const children = [...Array.from(container.children)];
    let { start, end } = this._getRange(children, dragEl, dropEl);

    this.animations.length = 0;

    const max = Math.floor(container.scrollHeight / dragEl.offsetHeight);
    const min = Math.min(children.length - 1, max);

    if (start < 0) {
      start = end;
      end = min;
    }
    if (end < 0) end = min;

    children.slice(start, end + 1).forEach((node) => {
      this.animations.push({ node, rect: getRect(node) });
    });
  },

  animate(animation) {
    this.animations.forEach((state) => {
      const { node, rect } = state;
      this._excute(node, rect, animation);
    });
  },

  _excute(el, { left, top }, animation = 150) {
    const rect = getRect(el);
    const ot = top - rect.top;
    const ol = left - rect.left;

    setTransition(el, 'none');
    setTransform(el, `translate3d(${ol}px, ${ot}px, 0)`);

    // repaint
    el.offsetWidth;

    setTransition(el, `${animation}ms`);
    setTransform(el, 'translate3d(0px, 0px, 0px)');

    clearTimeout(el.animated);
    el.animated = setTimeout(() => {
      setTransition(el, '');
      setTransform(el, '');
      el.animated = null;
    }, animation);
  },

  _getRange(children, dragEl, dropEl) {
    let start = children.indexOf(dragEl);
    let end = children.indexOf(dropEl);
    if (start > end) [start, end] = [end, start];
    return { start, end };
  },
};

export default Animation;

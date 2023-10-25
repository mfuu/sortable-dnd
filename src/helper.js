import { css, toggleClass, setTransform, setTransition } from './utils';

function Helper() {
  this.helper = null;
  this.distance = { x: 0, y: 0 };
}

Helper.prototype = {
  get node() {
    return this.helper;
  },

  destroy() {
    if (this.helper && this.helper.parentNode) {
      this.helper.parentNode.removeChild(this.helper);
    }
    this.helper = null;
    this.distance = { x: 0, y: 0 };
  },

  move(x, y) {
    if (!this.helper) return;
    setTransform(this.helper, `translate3d(${x}px, ${y}px, 0)`);
  },

  init(rect, element, container, options) {
    if (this.helper) return;

    const { fallbackOnBody, ghostClass, ghostStyle } = options;
    const helperContainer = fallbackOnBody ? document.body : container;

    this.helper = element.cloneNode(true);
    toggleClass(this.helper, ghostClass, true);

    const helperStyle = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      maxHeight: rect.height,
      position: 'fixed',
      opacity: '0.8',
      overflow: 'hidden',
      'z-index': 100000,
      'pointer-events': 'none',
      ...ghostStyle,
    };

    for (const key in helperStyle) {
      css(this.helper, key, helperStyle[key]);
    }

    setTransition(this.helper, 'none');
    setTransform(this.helper, 'translate3d(0px, 0px, 0px)');

    helperContainer.appendChild(this.helper);

    let ox = (this.distance.x / parseInt(this.helper.style.width)) * 100;
    let oy = (this.distance.y / parseInt(this.helper.style.height)) * 100;
    css(this.helper, 'transform-origin', `${ox}% ${oy}%`);
    css(this.helper, 'transform', 'translateZ(0)');
    css(this.helper, 'will-change', 'transform');
  },
};

export default Helper;

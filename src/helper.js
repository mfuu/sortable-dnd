import {
  css,
  getRect,
  toggleClass,
  setTransform,
  setTransition,
} from './utils';

export default class Helper {
  constructor() {
    this.helper = null;
  }
  get node() {
    return this.helper;
  }

  destroy() {
    if (this.helper && this.helper.parentNode) {
      this.helper.parentNode.removeChild(this.helper);
    }
    this.helper = null;
  }

  move(x, y) {
    setTransform(this.helper, `translate3d(${x}px, ${y}px, 0)`);
  }

  init(baseEl, ghostEl, container, options, distance) {
    if (this.helper) return;

    const { fallbackOnBody, ghostClass, ghostStyle = {} } = options;
    const helperContainer = fallbackOnBody ? document.body : container;
    const rect = getRect(baseEl, { block: true }, helperContainer);

    this.helper = ghostEl.cloneNode(true);
    toggleClass(this.helper, ghostClass, true);

    const helperStyle = {
      'box-sizing': 'border-box',
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      position: 'fixed',
      opacity: '0.8',
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

    let ox = (distance.x / parseInt(this.helper.style.width)) * 100;
    let oy = (distance.y / parseInt(this.helper.style.height)) * 100;
    css(this.helper, 'transform-origin', `${ox}% ${oy}%`);
    css(this.helper, 'transform', 'translateZ(0)');
  }
}

import Sortable from './index.js';

const captureMode = {
  capture: false,
  passive: false,
};

const R_SPACE = /\s+/g;

function userAgent(pattern) {
  if (typeof window !== 'undefined' && window.navigator) {
    return !!(/*@__PURE__*/ navigator.userAgent.match(pattern));
  }
}

export const IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
export const Edge = userAgent(/Edge/i);
export const FireFox = userAgent(/firefox/i);
export const Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
export const IOS = userAgent(/iP(ad|od|hone)/i);
export const ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);

/**
 * detect passive event support
 */
export const supportPassive = (function () {
  let supportPassive = false;
  document.addEventListener('checkIfSupportPassive', null, {
    get passive() {
      supportPassive = true;
      return true;
    },
  });
  return supportPassive;
})();

/**
 * check if element is html element
 */
export function isHTMLElement(el) {
  if (!el) return false;
  let ctx = document.createElement('div');
  try {
    ctx.appendChild(el.cloneNode(true));
    return el.nodeType == 1 ? true : false;
  } catch (e) {
    return el == window || el == document;
  }
}

/**
 * add specified event listener
 */
export function on(el, event, fn) {
  if (window.addEventListener) {
    el.addEventListener(event, fn, supportPassive || !IE11OrLess ? captureMode : false);
  } else if (window.attachEvent) {
    el.attachEvent('on' + event, fn);
  } else {
    el['on' + event] = fn;
  }
}

/**
 * remove specified event listener
 */
export function off(el, event, fn) {
  if (window.removeEventListener) {
    el.removeEventListener(event, fn, supportPassive || !IE11OrLess ? captureMode : false);
  } else if (window.detachEvent) {
    el.detachEvent('on' + event, fn);
  } else {
    el['on' + event] = null;
  }
}

export function getScrollingElement(el, includeSelf) {
  // skip to window
  if (!el || !el.getBoundingClientRect) {
    return getWindowScrollingElement();
  }

  let elem = el;
  let gotSelf = false;
  do {
    // we don't need to get elem css if it isn't even overflowing in the first place (performance)
    if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
      let elemCSS = css(elem);
      if (
        (elem.clientWidth < elem.scrollWidth &&
          (elemCSS.overflowX == 'auto' || elemCSS.overflowX == 'scroll')) ||
        (elem.clientHeight < elem.scrollHeight &&
          (elemCSS.overflowY == 'auto' || elemCSS.overflowY == 'scroll'))
      ) {
        if (!elem.getBoundingClientRect || elem === document.body) {
          return getWindowScrollingElement();
        }

        if (gotSelf || includeSelf) return elem;
        gotSelf = true;
      }
    }
  } while ((elem = elem.parentNode));

  return getWindowScrollingElement();
}

export function getWindowScrollingElement() {
  return document.scrollingElement || document.documentElement;
}

/**
 * Returns the "bounding client rect" of given element
 * @param  {HTMLElement} el The element whose boundingClientRect is wanted
 * @param  {Boolean} relativeToContainingBlock Whether the rect should be relative to the containing block of (including) the container
 * @param  {HTMLElement} container The parent the element will be placed in
 * @return {Object} The boundingClientRect of el, with specified adjustments
 */
export function getRect(el, relativeToContainingBlock, container) {
  if (!el.getBoundingClientRect && el !== window) return;

  let elRect, top, left, bottom, right, height, width;

  if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
    elRect = el.getBoundingClientRect();
    top = elRect.top;
    left = elRect.left;
    bottom = elRect.bottom;
    right = elRect.right;
    height = elRect.height;
    width = elRect.width;
  } else {
    top = 0;
    left = 0;
    bottom = window.innerHeight;
    right = window.innerWidth;
    height = window.innerHeight;
    width = window.innerWidth;
  }

  if (relativeToContainingBlock && el !== window) {
    container = container || el.parentNode;

    do {
      if (container && container.getBoundingClientRect) {
        let containerRect = container.getBoundingClientRect();

        // Set relative to edges of padding box of container
        top -= containerRect.top + parseInt(css(container, 'border-top-width'));
        left -= containerRect.left + parseInt(css(container, 'border-left-width'));
        bottom = top + elRect.height;
        right = left + elRect.width;

        break;
      }
    } while ((container = container.parentNode));
  }

  return {
    top: top,
    left: left,
    bottom: bottom,
    right: right,
    width: width,
    height: height,
  };
}

/**
 * Finds the closest element that matches a selector.
 */
export function closest(el, selector, ctx, includeCTX) {
  if (!el) return;

  ctx = ctx || document;
  do {
    if (
      (selector != null &&
        (selector[0] === '>'
          ? el.parentNode === ctx && matches(el, selector)
          : matches(el, selector))) ||
      (includeCTX && el === ctx)
    ) {
      return el;
    }

    if (el === ctx) break;
  } while ((el = el.parentNode));

  return null;
}

/**
 * Check if child element is contained in parent element
 */
export function contains(el, parent) {
  if (!el || !parent) return false;

  if (parent.compareDocumentPosition) {
    return !!(parent.compareDocumentPosition(el) & 16);
  }

  if (parent.contains && el.nodeType === 1) {
    return parent.contains(el) && parent !== el;
  }

  while ((el = el.parentNode)) if (el === parent) return true;

  return false;
}

/**
 * Gets the last child in the el, ignoring ghostEl and invisible elements
 */
export function lastChild(el, selector) {
  let last = el.lastElementChild;

  while (
    last &&
    (last === Sortable.ghost ||
      css(last, 'display') === 'none' ||
      (selector && !matches(last, selector)))
  ) {
    last = last.previousElementSibling;
  }

  return last || null;
}

/**
 * Returns the index of an element within its parent for a selected set of elements
 */
export function index(el, selector) {
  if (!el || !el.parentNode) {
    return -1;
  }

  let index = 0;
  while ((el = el.previousElementSibling)) {
    if (
      el !== Sortable.ghost &&
      el.nodeName.toUpperCase() !== 'TEMPLATE' &&
      css(el, 'display') !== 'none' &&
      (!selector || matches(el, selector))
    ) {
      index++;
    }
  }

  return index;
}

/**
 * Gets nth child of el, ignoring hidden children, sortable's elements (does not ignore clone if it's visible) and non-draggable elements
 */
export function getChild(el, childNum, selector, includeDragEl) {
  let i = 0,
    currentChild = 0,
    children = el.children;

  while (i < children.length) {
    if (
      children[i] !== Sortable.ghost &&
      css(children[i], 'display') !== 'none' &&
      closest(children[i], selector, el, false) &&
      (includeDragEl || children[i] !== Sortable.dragged)
    ) {
      if (currentChild === childNum) {
        return children[i];
      }
      currentChild++;
    }

    i++;
  }
  return null;
}

export function detectDirection(el, selector) {
  let elCSS = css(el),
    elWidth =
      parseInt(elCSS.width) -
      parseInt(elCSS.paddingLeft) -
      parseInt(elCSS.paddingRight) -
      parseInt(elCSS.borderLeftWidth) -
      parseInt(elCSS.borderRightWidth),
    child1 = getChild(el, 0, selector),
    child2 = getChild(el, 1, selector),
    child1CSS = child1 && css(child1),
    child2CSS = child2 && css(child2),
    child1Width =
      child1CSS &&
      parseInt(child1CSS.marginLeft) + parseInt(child1CSS.marginRight) + getRect(child1).width,
    child2Width =
      child2CSS &&
      parseInt(child2CSS.marginLeft) + parseInt(child2CSS.marginRight) + getRect(child2).width,
    CSSFloatProperty = Edge || IE11OrLess ? 'cssFloat' : 'float';

  if (elCSS.display === 'flex') {
    return elCSS.flexDirection === 'column' || elCSS.flexDirection === 'column-reverse'
      ? 'vertical'
      : 'horizontal';
  }

  if (elCSS.display === 'grid') {
    return elCSS.gridTemplateColumns.split(' ').length <= 1 ? 'vertical' : 'horizontal';
  }

  if (child1 && child1CSS.float && child1CSS.float !== 'none') {
    let touchingSideChild2 = child1CSS.float === 'left' ? 'left' : 'right';

    return child2 && (child2CSS.clear === 'both' || child2CSS.clear === touchingSideChild2)
      ? 'vertical'
      : 'horizontal';
  }

  return child1 &&
    (child1CSS.display === 'block' ||
      child1CSS.display === 'flex' ||
      child1CSS.display === 'table' ||
      child1CSS.display === 'grid' ||
      (child1Width >= elWidth && elCSS[CSSFloatProperty] === 'none') ||
      (child2 && elCSS[CSSFloatProperty] === 'none' && child1Width + child2Width > elWidth))
    ? 'vertical'
    : 'horizontal';
}

/**
 * add or remove element's class
 */
export function toggleClass(el, name, isAdd) {
  if (el && name) {
    if (el.classList) {
      el.classList[isAdd ? 'add' : 'remove'](name);
    } else {
      const className = (' ' + el.className + ' ')
        .replace(R_SPACE, ' ')
        .replace(' ' + name + ' ', ' ');
      el.className = (className + (isAdd ? ' ' + name : '')).replace(R_SPACE, ' ');
    }
  }
}

/**
 * Check if a DOM element matches a given selector
 */
export function matches(el, selector) {
  if (!selector) return;

  selector[0] === '>' && (selector = selector.substring(1));

  if (el) {
    try {
      if (el.matches) {
        return el.matches(selector);
      } else if (el.msMatchesSelector) {
        return el.msMatchesSelector(selector);
      } else if (el.webkitMatchesSelector) {
        return el.webkitMatchesSelector(selector);
      }
    } catch (error) {
      return false;
    }
  }

  return false;
}

/**
 * get or set css property
 */
export function css(el, prop, val) {
  let style = el && el.style;
  if (style) {
    if (val === void 0) {
      if (document.defaultView && document.defaultView.getComputedStyle) {
        val = document.defaultView.getComputedStyle(el, '');
      } else if (el.currentStyle) {
        val = el.currentStyle;
      }
      return prop === void 0 ? val : val[prop];
    } else {
      if (!(prop in style) && prop.indexOf('webkit') === -1) {
        prop = '-webkit-' + prop;
      }
      style[prop] = val + (typeof val === 'string' ? '' : 'px');
    }
  }
}

export function matrix(el, selfOnly) {
  let appliedTransforms = '';
  if (typeof el === 'string') {
    appliedTransforms = el;
  } else {
    do {
      let transform = css(el, 'transform');

      if (transform && transform !== 'none') {
        appliedTransforms = transform + ' ' + appliedTransforms;
      }
    } while (!selfOnly && (el = el.parentNode));
  }

  const matrixFn =
    window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;

  return matrixFn && new matrixFn(appliedTransforms);
}

export function isRectEqual(rect1, rect2) {
  return (
    Math.round(rect1.top) === Math.round(rect2.top) &&
    Math.round(rect1.left) === Math.round(rect2.left) &&
    Math.round(rect1.height) === Math.round(rect2.height) &&
    Math.round(rect1.width) === Math.round(rect2.width)
  );
}

export function repaint(el) {
  return el.offsetWidth;
}

/**
 * Compares the position of two DOM nodes.
 */
export function comparePosition(a, b) {
  return a.compareDocumentPosition
    ? a.compareDocumentPosition(b)
    : a.contains
      ? (a != b && a.contains(b) && 16) +
        (a != b && b.contains(a) && 8) +
        (a.sourceIndex >= 0 && b.sourceIndex >= 0
          ? (a.sourceIndex < b.sourceIndex && 4) + (a.sourceIndex > b.sourceIndex && 2)
          : 1)
      : 0;
}

/**
 * Sorts the sequence of two elements.
 */
export function sort(before, after) {
  const compareValue = comparePosition(before, after);
  return compareValue === 2 ? 1 : compareValue === 4 ? -1 : 0;
}

export function preventDefault(evt) {
  evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault();
}

export function dispatchEvent({ sortable, name, evt }) {
  const callback = sortable.options[name];
  if (typeof callback === 'function') {
    return callback(Object.assign({}, evt));
  }
}

export function result(option, ...args) {
  if (typeof option === 'function') {
    return option(...args);
  }

  return option;
}

export const expando = 'Sortable' + Date.now();

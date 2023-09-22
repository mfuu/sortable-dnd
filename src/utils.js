import Sortable from './index.js';

const captureMode = {
  capture: false,
  passive: false,
};

const R_SPACE = /\s+/g;

export const events = {
  start: ['touchstart', 'mousedown'],
  move: ['touchmove', 'mousemove'],
  end: ['touchend', 'touchcancel', 'mouseup'],
};

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
export const supportPassive = (function () {
  // https://github.com/Modernizr/Modernizr/issues/1894
  let supportPassive = false;
  document.addEventListener('checkIfSupportPassive', null, {
    get passive() {
      supportPassive = true;
      return true;
    },
  });
  return supportPassive;
})();

export const vendorPrefix = (function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // Server environment
    return '';
  }

  // window.getComputedStyle() returns null inside an iframe with display: none
  // in this case return an array with a fake mozilla style in it.
  const styles = window.getComputedStyle(document.documentElement, '') || ['-moz-hidden-iframe'];
  const pre = (Array.prototype.slice
    .call(styles)
    .join('')
    .match(/-(moz|webkit|ms)-/) ||
    (styles.OLink === '' && ['', 'o']))[1];
  const dom = 'WebKit|Moz|MS|O'.match(new RegExp('(' + pre + ')', 'i'))[1];

  return {
    dom,
    lowercase: pre,
    css: '-' + pre + '-',
    js: pre[0].toUpperCase() + pre.substr(1),
  };
})();

/**
 * check if is HTMLElement
 */
export function isHTMLElement(node) {
  if (!node) return false;
  let ctx = document.createElement('div');
  try {
    ctx.appendChild(node.cloneNode(true));
    return node.nodeType == 1 ? true : false;
  } catch (e) {
    return node == window || node == document;
  }
}

export function setTransition(el, transition) {
  el.style[`${vendorPrefix.css}transition`] = transition
    ? transition === 'none'
      ? 'none'
      : `${transition}`
    : '';
}

export function setTransitionDuration(el, duration) {
  el.style[`${vendorPrefix.css}transition-duration`] = duration == null ? '' : `${duration}ms`;
}

export function setTransform(el, transform) {
  el.style[`${vendorPrefix.css}transform`] = transform ? `${transform}` : '';
}

/**
 * add specified event listener
 */
export function on(el, event, fn) {
  if (window.addEventListener) {
    el.addEventListener(event, fn, supportPassive || !IE11OrLess ? captureMode : false);
  } else if (window.attachEvent) {
    el.attachEvent('on' + event, fn);
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
  }
}

/**
 * get touch event and current event
 * @param {Event|TouchEvent} evt
 */
export function getEvent(evt) {
  let event = evt;
  let touch = (evt.touches && evt.touches[0]) || (evt.changedTouches && evt.changedTouches[0]);
  let target = touch ? document.elementFromPoint(touch.clientX, touch.clientY) : evt.target;
  if (touch && !('clientX' in event)) {
    event.clientX = touch.clientX;
    event.clientY = touch.clientY;
    event.pageX = touch.pageX;
    event.pageY = touch.pageY;
    event.screenX = touch.screenX;
    event.screenY = touch.screenY;
  }
  return { touch, event, target };
}

/**
 * get element's offet in given parent node
 */
export function getOffset(el, parentEl) {
  let offset = {
    top: 0,
    left: 0,
    height: el.offsetHeight,
    width: el.offsetWidth,
  };

  do {
    offset.top += el.offsetTop;
    offset.left += el.offsetLeft;
  } while ((el = el.parentNode) && el !== parentEl);

  return offset;
}

/**
 * get scroll element
 * @param {Boolean} includeSelf whether to include the passed element
 * @returns {HTMLElement} scroll element
 */
export function getParentAutoScrollElement(el, includeSelf) {
  // skip to window
  if (!el || !el.getBoundingClientRect) return getWindowScrollingElement();

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
        if (!elem.getBoundingClientRect || elem === document.body)
          return getWindowScrollingElement();

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
 * @param  {HTMLElement} el                       The element whose boundingClientRect is wanted
 * @param  {Object} check
 * @example - {
 * -   parent: true | false, 'check if parentNode.height < el.height'
 * -   block: true | false, 'Whether the rect should be relative to the containing block of (including) the container'
 * -   relative: true | false, 'Whether the rect should be relative to the relative parent of (including) the contaienr'
 * - }
 * @param  {HTMLElement} container              The parent the element will be placed in
 * @return {Object}                               The boundingClientRect of el, with specified adjustments
 */
export function getRect(el, check = {}, container) {
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

    if (check.parent && el.parentNode !== el.ownerDocument.body) {
      let parentRect,
        parentNode = el.parentNode;

      while (
        parentNode &&
        parentNode.getBoundingClientRect &&
        parentNode !== el.ownerDocument.body
      ) {
        parentRect = parentNode.getBoundingClientRect();
        if (parentRect.height < height) {
          top = parentRect.top;
          left = parentRect.left;
          bottom = parentRect.bottom;
          right = parentRect.right;
          height = parentRect.height;
          width = parentRect.width;
          return {
            top: top,
            left: left,
            bottom: bottom,
            right: right,
            width: width,
            height: height,
          };
        }
        parentNode = parentNode.parentNode;
      }
    }
  } else {
    top = 0;
    left = 0;
    bottom = window.innerHeight;
    right = window.innerWidth;
    height = window.innerHeight;
    width = window.innerWidth;
  }

  if ((check.block || check.relative) && el !== window) {
    // Adjust for translate()
    container = container || el.parentNode;

    // Not needed on <= IE11
    if (!IE11OrLess) {
      do {
        if (
          container &&
          container.getBoundingClientRect &&
          (css(container, 'transform') !== 'none' ||
            (check.relative && css(container, 'position') !== 'static'))
        ) {
          let containerRect = container.getBoundingClientRect();

          // Set relative to edges of padding box of container
          top -= containerRect.top + parseInt(css(container, 'border-top-width'));
          left -= containerRect.left + parseInt(css(container, 'border-left-width'));
          bottom = top + elRect.height;
          right = left + elRect.width;

          break;
        }
        /* jshint boss:true */
      } while ((container = container.parentNode));
    }
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

export function closest(el, selector, ctx, includeCTX) {
  if (el) {
    ctx = ctx || document;

    do {
      if (selector == null) {
        let children = Array.prototype.slice.call(ctx.children);

        // If it can be found directly in the child element, return
        let index = children.indexOf(el);
        if (index > -1) return children[index];

        // When the dom cannot be found directly in children, need to look down
        for (let i = 0, len = children.length; i < len; i++) {
          if (containes(el, children[i])) return children[i];
        }
      } else if (
        (selector[0] === '>'
          ? el.parentNode === ctx && matches(el, selector)
          : matches(el, selector)) ||
        (includeCTX && el === ctx)
      ) {
        return el;
      }
    } while ((el = el.parentNode));
  }
  return null;
}

/**
 * Check if child element is contained in parent element
 */
export function containes(el, root) {
  if (!el || !root) return false;
  if (root.compareDocumentPosition) {
    return root === el || !!(root.compareDocumentPosition(el) & 16);
  }
  if (root.contains && el.nodeType === 1) {
    return root.contains(el) && root !== el;
  }
  while ((el = el.parentNode)) if (el === root) return true;
  return false;
}

/**
 * Gets the last child in the el, ignoring ghostEl or invisible elements (clones)
 * @return {HTMLElement|null} The last child, ignoring ghostEl
 */
export function lastChild(el, helper, selector) {
  let last = el.lastElementChild;

  while (
    last &&
    (last === helper || css(last, 'display') === 'none' || (selector && !matches(last, selector)))
  ) {
    last = last.previousElementSibling;
  }

  return last || null;
}

/**
 * Returns the index of an element within its parent for a selected set of elements
 */
export function index(el, selector) {
  let index = 0;

  if (!el || !el.parentNode) {
    return -1;
  }

  while ((el = el.previousElementSibling)) {
    if (
      el.nodeName.toUpperCase() !== 'TEMPLATE' &&
      (!selector || matches(el, selector)) &&
      css(el, 'display') !== 'none'
    ) {
      index++;
    }
  }

  return index;
}

/**
 * Gets nth child of el, ignoring hidden children, sortable's elements (does not ignore clone if it's visible) and non-draggable elements
 * @return {HTMLElement}          The child at index childNum, or null if not found
 */
export function getChild(el, childNum, draggable, includeDragEl) {
  let i = 0,
    currentChild = 0,
    children = el.children;

  while (i < children.length) {
    if (
      children[i] !== Sortable.ghost &&
      css(children[i], 'display') !== 'none' &&
      closest(children[i], draggable, el, false) &&
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

// https://github.com/SortableJS/Sortable/blob/c5a882267542456d75b16d000dc1b603a907613a/src/Sortable.js#L161
export function detectDirection(el, draggable) {
  let elCSS = css(el),
    elWidth =
      parseInt(elCSS.width) -
      parseInt(elCSS.paddingLeft) -
      parseInt(elCSS.paddingRight) -
      parseInt(elCSS.borderLeftWidth) -
      parseInt(elCSS.borderRightWidth),
    child1 = getChild(el, 0, draggable),
    child2 = getChild(el, 1, draggable),
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
export function toggleClass(el, name, state) {
  if (el && name) {
    if (el.classList) {
      el.classList[state ? 'add' : 'remove'](name);
    } else {
      const className = (' ' + el.className + ' ')
        .replace(R_SPACE, ' ')
        .replace(' ' + name + ' ', ' ');
      el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ');
    }
  }
}

export function toggleVisible(el, visible) {
  css(el, 'display', visible ? '' : 'none');
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

/**
 * Check if the mouse pointer is within an element
 */
export function within(event, element, rect) {
  rect = rect || getRect(element);
  return (
    event.clientX <= rect.right &&
    event.clientX >= rect.left &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

export function getMutationObserver() {
  return window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
}

/**
 * Check whether the front and rear positions are consistent
 */
export function offsetChanged(o1, o2) {
  return o1.top !== o2.top || o1.left !== o2.left;
}

export function sortByOffset(o1, o2) {
  return o1.top === o2.top ? o1.left - o2.left : o1.top - o2.top;
}

export function _nextTick(fn) {
  return setTimeout(fn, 0);
}

import Sortable from './index.js';

const captureMode = {
  capture: false,
  passive: false
};

const R_SPACE = /\s+/g;

export const cssTransitions = [
  '-webkit-transition',
  '-moz-transition',
  '-ms-transition',
  '-o-transition',
  'transition'
];

export const cssTransforms = [
  '-webkit-transform',
  '-moz-transform',
  '-ms-transform',
  '-o-transform',
  'transform'
];

export const SUPPORT_PASSIVE = supportPassive();

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
 * check if is HTMLElement
 */
export function isHTMLElement(obj) {
  if (!obj) return false;
  let d = document.createElement('div');
  try {
    d.appendChild(obj.cloneNode(true));
    return obj.nodeType == 1 ? true : false;
  } catch (e) {
    return obj == window || obj == document;
  }
}

/**
 * set transition style
 * @param {HTMLElement} el
 * @param {String | Function} transition
 */
export function setTransition(el, transition) {
  if (transition) {
    if (transition === 'none') cssTransitions.forEach((ts) => css(el, ts, 'none'));
    else
      cssTransitions.forEach((ts) =>
        css(el, ts, `${ts.split('transition')[0]}transform ${transition}`)
      );
  } else cssTransitions.forEach((ts) => css(el, ts, ''));
}

/**
 * set transform style
 * @param {HTMLElement} el
 * @param {String} transform
 */
export function setTransform(el, transform) {
  if (transform) {
    cssTransforms.forEach((tf) => css(el, tf, `${tf.split('transform')[0]}${transform}`));
  } else {
    cssTransforms.forEach((tf) => css(el, tf, ''));
  }
}

/**
 * get touch event and current event
 * @param {Event} evt
 */
export function getEvent(evt) {
  const touch =
    (evt.touches && evt.touches[0]) || (evt.pointerType && evt.pointerType === 'touch' && evt);
  const e = touch || evt;
  const target = touch ? document.elementFromPoint(e.clientX, e.clientY) : e.target;
  return { touch, e, target };
}

/**
 * detect passive event support
 */
export function supportPassive() {
  // https://github.com/Modernizr/Modernizr/issues/1894
  let supportPassive = false;
  document.addEventListener('checkIfSupportPassive', null, {
    get passive() {
      supportPassive = true;
      return true;
    }
  });
  return supportPassive;
}

/**
 * add specified event listener
 * @param {HTMLElement} el
 * @param {String} event
 * @param {Function} fn
 * @param {Boolean} sp
 */
export function on(el, event, fn) {
  if (window.addEventListener) {
    el.addEventListener(event, fn, SUPPORT_PASSIVE || !IE11OrLess ? captureMode : false);
  } else if (window.attachEvent) {
    el.attachEvent('on' + event, fn);
  }
}

/**
 * remove specified event listener
 * @param {HTMLElement} el
 * @param {String} event
 * @param {Function} fn
 * @param {Boolean} sp
 */
export function off(el, event, fn) {
  if (window.removeEventListener) {
    el.removeEventListener(event, fn, SUPPORT_PASSIVE || !IE11OrLess ? captureMode : false);
  } else if (window.detachEvent) {
    el.detachEvent('on' + event, fn);
  }
}

/**
 * get element's offetTop
 * @param {HTMLElement} el
 */
export function getOffset(el) {
  let result = {
    top: 0,
    left: 0,
    height: 0,
    width: 0
  };
  result.height = el.offsetHeight;
  result.width = el.offsetWidth;
  result.top = el.offsetTop;
  result.left = el.offsetLeft;

  let parent = el.offsetParent;

  while (parent !== null) {
    result.top += parent.offsetTop;
    result.left += parent.offsetLeft;
    parent = parent.offsetParent;
  }

  return result;
}

/**
 * get scroll element
 * @param {HTMLElement} el
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
  let scrollingElement = document.scrollingElement;

  if (scrollingElement) {
    return scrollingElement.contains(document.body) ? document : scrollingElement;
  } else {
    return document;
  }
}

/**
 * get specified element's index in group
 * @param {HTMLElement} group
 * @param {HTMLElement} el
 * @returns {Number} index
 */
export function getIndex(group, el) {
  if (!el || !el.parentNode) return -1;

  const children = [...Array.from(group.children)];
  return children.indexOf(el);
}

export function setRect(el, rect) {
  css(el, 'position', 'absolute');
  css(el, 'top', rect.top);
  css(el, 'left', rect.left);
}

export function unsetRect(el) {
  css(el, 'display', '');
  css(el, 'position', '');
  css(el, 'top', '');
  css(el, 'left', '');
}

export function getMouseRect(event) {
  if (event.pageX || event.pageY) {
    return { top: event.pageY, left: event.pageX };
  } else if (event.clientX || event.clientY) {
    return {
      top: event.clientY + document.documentElement.scrollTop + document.body.scrollTop,
      left: event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft
    };
  }
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
            height: height
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
    height: height
  };
}

/**
 * get target Element in group
 * @param {HTMLElement} group
 * @param {HTMLElement} el
 * @param {Boolean} onlyEl only get element
 */
export function getElement(group, el, onlyEl) {
  const children = [...Array.from(group.children)];

  // If it can be found directly in the child element, return
  const index = children.indexOf(el);
  if (index > -1)
    return onlyEl
      ? children[index]
      : {
          index,
          el: children[index],
          rect: getRect(children[index]),
          offset: getOffset(children[index])
        };

  // When the dom cannot be found directly in children, need to look down
  for (let i = 0; i < children.length; i++) {
    if (isChildOf(el, children[i])) {
      return onlyEl
        ? children[i]
        : {
            index: i,
            el: children[i],
            rect: getRect(children[i]),
            offset: getOffset(children[i])
          };
    }
  }
  return onlyEl ? null : { index: -1, el: null, rect: {}, offset: {} };
}

/**
 * Check if child element is contained in parent element
 * @param {HTMLElement} child
 * @param {HTMLElement} parent
 * @returns {Boolean} true | false
 */
export function isChildOf(child, parent) {
  let parentNode;
  if (child && parent) {
    parentNode = child.parentNode;
    while (parentNode) {
      if (parent === parentNode) return true;
      parentNode = parentNode.parentNode;
    }
  }
  return false;
}

/**
 * Gets the last child in the el, ignoring ghostEl or invisible elements (clones)
 * @param  {HTMLElement} el       Parent element
 * @param  {selector} selector    Any other elements that should be ignored
 * @return {HTMLElement}          The last child, ignoring ghostEl
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
 * add or remove element's class
 * @param {HTMLElement} el element
 * @param {String} name class name
 * @param {Boolean} state true: add, false: remove
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

/**
 * Check if a DOM element matches a given selector
 * @param {HTMLElement} el
 * @param {String} selector
 * @returns
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
 * Check whether the front and rear positions are consistent
 */
export function offsetChanged(o1, o2) {
  return o1.top !== o2.top || o1.left !== o2.left;
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

export function debounce(fn, delay, immediate) {
  let timer = null;
  return function () {
    const context = this,
      args = arguments;
    timer && clearTimeout(timer);
    immediate && !timer && fn.apply(context, args);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

export function throttle(fn, delay) {
  let timer = null;
  return function () {
    const context = this,
      args = arguments;
    if (!timer) {
      timer = setTimeout(function () {
        timer = null;
        fn.apply(context, args);
      }, delay);
    }
  };
}

export function _nextTick(fn) {
  return setTimeout(fn, 0);
}

export const expando = 'Sortable' + Date.now();

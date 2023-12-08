/*!
 * sortable-dnd v0.5.6
 * open source under the MIT license
 * https://github.com/mfuu/sortable-dnd#readme
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Sortable = factory());
}(this, (function () { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var captureMode = {
    capture: false,
    passive: false
  };
  var R_SPACE = /\s+/g;
  var events = {
    start: ['touchstart', 'mousedown'],
    move: ['touchmove', 'mousemove'],
    end: ['touchend', 'touchcancel', 'mouseup']
  };
  function userAgent(pattern) {
    if (typeof window !== 'undefined' && window.navigator) {
      return !! /*@__PURE__*/navigator.userAgent.match(pattern);
    }
  }
  var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
  var Edge = userAgent(/Edge/i);
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);

  /**
   * detect passive event support
   */
  var supportPassive = function () {
    // https://github.com/Modernizr/Modernizr/issues/1894
    var supportPassive = false;
    document.addEventListener('checkIfSupportPassive', null, {
      get passive() {
        supportPassive = true;
        return true;
      }
    });
    return supportPassive;
  }();
  var vendorPrefix = function () {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // Server environment
      return {};
    }

    // window.getComputedStyle() returns null inside an iframe with display: none
    // in this case return an array with a fake mozilla style in it.
    var styles = window.getComputedStyle(document.documentElement, '') || ['-moz-hidden-iframe'];
    var pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o'])[1];
    var dom = 'WebKit|Moz|MS|O'.match(new RegExp('(' + pre + ')', 'i'))[1];
    return {
      dom: dom,
      lowercase: pre,
      css: '-' + pre + '-',
      js: pre[0].toUpperCase() + pre.substr(1)
    };
  }();
  function setTransition(el, transition) {
    el.style["".concat(vendorPrefix.css, "transition")] = transition ? transition === 'none' ? 'none' : "".concat(transition) : '';
  }
  function setTransitionDuration(el, duration) {
    el.style["".concat(vendorPrefix.css, "transition-duration")] = duration == null ? '' : "".concat(duration, "ms");
  }
  function setTransform(el, transform) {
    el.style["".concat(vendorPrefix.css, "transform")] = transform ? "".concat(transform) : '';
  }

  /**
   * add specified event listener
   */
  function on(el, event, fn) {
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
  function off(el, event, fn) {
    if (window.removeEventListener) {
      el.removeEventListener(event, fn, supportPassive || !IE11OrLess ? captureMode : false);
    } else if (window.detachEvent) {
      el.detachEvent('on' + event, fn);
    } else {
      el['on' + event] = null;
    }
  }

  /**
   * get touch event and current event
   * @param {Event|TouchEvent} evt
   */
  function getEvent(evt) {
    var event = evt;
    var touch = evt.touches && evt.touches[0] || evt.changedTouches && evt.changedTouches[0];
    var target = touch ? document.elementFromPoint(touch.clientX, touch.clientY) : evt.target;
    if (touch && !('clientX' in event)) {
      event.clientX = touch.clientX;
      event.clientY = touch.clientY;
      event.pageX = touch.pageX;
      event.pageY = touch.pageY;
      event.screenX = touch.screenX;
      event.screenY = touch.screenY;
    }
    return {
      touch: touch,
      event: event,
      target: target
    };
  }

  /**
   * get element's offetTop in given parent element
   */
  function getOffset(el, parentEl) {
    var offset = {
      top: 0,
      left: 0,
      height: el.offsetHeight,
      width: el.offsetWidth
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
  function getParentAutoScrollElement(el, includeSelf) {
    // skip to window
    if (!el || !el.getBoundingClientRect) return getWindowScrollingElement();
    var elem = el;
    var gotSelf = false;
    do {
      // we don't need to get elem css if it isn't even overflowing in the first place (performance)
      if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
        var elemCSS = css(elem);
        if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == 'auto' || elemCSS.overflowX == 'scroll') || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == 'auto' || elemCSS.overflowY == 'scroll')) {
          if (!elem.getBoundingClientRect || elem === document.body) return getWindowScrollingElement();
          if (gotSelf || includeSelf) return elem;
          gotSelf = true;
        }
      }
    } while (elem = elem.parentNode);
    return getWindowScrollingElement();
  }
  function getWindowScrollingElement() {
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
  function getRect(el) {
    var check = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var container = arguments.length > 2 ? arguments[2] : undefined;
    if (!el.getBoundingClientRect && el !== window) return;
    var elRect, top, left, bottom, right, height, width;
    if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
      elRect = el.getBoundingClientRect();
      top = elRect.top;
      left = elRect.left;
      bottom = elRect.bottom;
      right = elRect.right;
      height = elRect.height;
      width = elRect.width;
      if (check.parent && el.parentNode !== el.ownerDocument.body) {
        var parentRect,
          parentNode = el.parentNode;
        while (parentNode && parentNode.getBoundingClientRect && parentNode !== el.ownerDocument.body) {
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
          if (container && container.getBoundingClientRect && (css(container, 'transform') !== 'none' || check.relative && css(container, 'position') !== 'static')) {
            var containerRect = container.getBoundingClientRect();

            // Set relative to edges of padding box of container
            top -= containerRect.top + parseInt(css(container, 'border-top-width'));
            left -= containerRect.left + parseInt(css(container, 'border-left-width'));
            bottom = top + elRect.height;
            right = left + elRect.width;
            break;
          }
          /* jshint boss:true */
        } while (container = container.parentNode);
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
  function closest(el, selector, ctx, includeCTX) {
    if (el) {
      ctx = ctx || document;
      do {
        if (selector == null) {
          var children = Array.prototype.slice.call(ctx.children);

          // If it can be found directly in the child element, return
          var _index = children.indexOf(el);
          if (_index > -1) return children[_index];

          // When the dom cannot be found directly in children, need to look down
          for (var i = 0; i < children.length; i++) {
            if (containes(el, children[i])) return children[i];
          }
        } else if ((selector[0] === '>' ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
          return el;
        }
      } while (el = el.parentNode);
    }
    return null;
  }

  /**
   * Check if child element is contained in parent element
   */
  function containes(el, root) {
    if (!el || !root) return false;
    if (root.compareDocumentPosition) {
      return root === el || !!(root.compareDocumentPosition(el) & 16);
    }
    if (root.contains && el.nodeType === 1) {
      return root.contains(el) && root !== el;
    }
    while (el = el.parentNode) if (el === root) return true;
    return false;
  }

  /**
   * Gets the last child in the el, ignoring ghostEl or invisible elements (clones)
   * @return {HTMLElement|null} The last child, ignoring ghostEl
   */
  function lastChild(el, selector) {
    var last = el.lastElementChild;
    while (last && (last === Sortable.ghost || css(last, 'display') === 'none' || selector && !matches(last, selector))) {
      last = last.previousElementSibling;
    }
    return last || null;
  }

  /**
   * Returns the index of an element within its parent for a selected set of elements
   */
  function index(el, selector) {
    var index = 0;
    if (!el || !el.parentNode) {
      return -1;
    }
    while (el = el.previousElementSibling) {
      if (el.nodeName.toUpperCase() !== 'TEMPLATE' && (!selector || matches(el, selector)) && css(el, 'display') !== 'none') {
        index++;
      }
    }
    return index;
  }

  /**
   * Gets nth child of el, ignoring hidden children, sortable's elements (does not ignore clone if it's visible) and non-draggable elements
   * @return {HTMLElement}          The child at index childNum, or null if not found
   */
  function getChild(el, childNum, selector, includeDragEl) {
    var i = 0,
      currentChild = 0,
      children = el.children;
    while (i < children.length) {
      if (children[i] !== Sortable.ghost && css(children[i], 'display') !== 'none' && closest(children[i], selector, el, false) && (includeDragEl || children[i] !== Sortable.dragged)) {
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
  function detectDirection(el, selector) {
    var elCSS = css(el),
      elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth),
      child1 = getChild(el, 0, selector),
      child2 = getChild(el, 1, selector),
      child1CSS = child1 && css(child1),
      child2CSS = child2 && css(child2),
      child1Width = child1CSS && parseInt(child1CSS.marginLeft) + parseInt(child1CSS.marginRight) + getRect(child1).width,
      child2Width = child2CSS && parseInt(child2CSS.marginLeft) + parseInt(child2CSS.marginRight) + getRect(child2).width,
      CSSFloatProperty = Edge || IE11OrLess ? 'cssFloat' : 'float';
    if (elCSS.display === 'flex') {
      return elCSS.flexDirection === 'column' || elCSS.flexDirection === 'column-reverse' ? 'vertical' : 'horizontal';
    }
    if (elCSS.display === 'grid') {
      return elCSS.gridTemplateColumns.split(' ').length <= 1 ? 'vertical' : 'horizontal';
    }
    if (child1 && child1CSS["float"] && child1CSS["float"] !== 'none') {
      var touchingSideChild2 = child1CSS["float"] === 'left' ? 'left' : 'right';
      return child2 && (child2CSS.clear === 'both' || child2CSS.clear === touchingSideChild2) ? 'vertical' : 'horizontal';
    }
    return child1 && (child1CSS.display === 'block' || child1CSS.display === 'flex' || child1CSS.display === 'table' || child1CSS.display === 'grid' || child1Width >= elWidth && elCSS[CSSFloatProperty] === 'none' || child2 && elCSS[CSSFloatProperty] === 'none' && child1Width + child2Width > elWidth) ? 'vertical' : 'horizontal';
  }

  /**
   * add or remove element's class
   */
  function toggleClass(el, name, state) {
    if (el && name) {
      if (el.classList) {
        el.classList[state ? 'add' : 'remove'](name);
      } else {
        var className = (' ' + el.className + ' ').replace(R_SPACE, ' ').replace(' ' + name + ' ', ' ');
        el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ');
      }
    }
  }

  /**
   * Check if a DOM element matches a given selector
   * @returns
   */
  function matches(el, selector) {
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
  function css(el, prop, val) {
    var style = el && el.style;
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
  function within(event, element, rect) {
    rect = rect || getRect(element);
    return event.clientX <= rect.right && event.clientX >= rect.left && event.clientY >= rect.top && event.clientY <= rect.bottom;
  }

  /**
   * Reports the position of its argument node relative to the node on which it is called.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
   */
  function comparePosition(a, b) {
    return a.compareDocumentPosition ? a.compareDocumentPosition(b) : a.contains ? (a != b && a.contains(b) && 16) + (a != b && b.contains(a) && 8) + (a.sourceIndex >= 0 && b.sourceIndex >= 0 ? (a.sourceIndex < b.sourceIndex && 4) + (a.sourceIndex > b.sourceIndex && 2) : 1) + 0 : 0;
  }

  /**
   * Check whether the front and rear positions are consistent, ignore front and rear height width changes
   */
  function offsetChanged(before, after) {
    function inRange(from, to, diff) {
      if (from === to) return true;
      return from >= to - diff && from <= to + diff;
    }
    var diffW = Math.abs(before.width - after.width);
    var diffH = Math.abs(before.height - after.height);
    var xChanged = !inRange(before.left, after.left, diffW);
    var yChanged = !inRange(before.top, after.top, diffH);
    return xChanged || yChanged;
  }
  function sort(before, after) {
    var compareValue = comparePosition(before, after);
    return compareValue === 2 ? 1 : compareValue === 4 ? -1 : 0;
  }
  function preventDefault(evt) {
    evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault();
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback) {
      return setTimeout(callback, 17);
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }
  function AutoScroll(options) {
    this.options = options;
    this.autoScrollAnimationFrame = null;
  }
  AutoScroll.prototype = {
    clear: function clear() {
      if (this.autoScrollAnimationFrame == null) {
        return;
      }
      cancelAnimationFrame(this.autoScrollAnimationFrame);
      this.autoScrollAnimationFrame = null;
    },
    update: function update(scrollEl, dragEvent, moveEvent) {
      var _this = this;
      cancelAnimationFrame(this.autoScrollAnimationFrame);
      this.autoScrollAnimationFrame = requestAnimationFrame(function () {
        if (dragEvent && moveEvent) {
          _this.autoScroll(scrollEl, moveEvent);
        }
        _this.update(scrollEl, dragEvent, moveEvent);
      });
    },
    autoScroll: function autoScroll(scrollEl, evt) {
      if (!scrollEl || evt.clientX === void 0 || evt.clientY === void 0) return;
      var rect = getRect(scrollEl);
      if (!rect) return;
      var clientX = evt.clientX,
        clientY = evt.clientY;
      var top = rect.top,
        right = rect.right,
        bottom = rect.bottom,
        left = rect.left,
        height = rect.height,
        width = rect.width;
      if (clientY < top || clientX > right || clientY > bottom || clientX < left) {
        return;
      }
      var _this$options = this.options,
        scrollThreshold = _this$options.scrollThreshold,
        scrollSpeed = _this$options.scrollSpeed;
      var scrollTop = scrollEl.scrollTop,
        scrollLeft = scrollEl.scrollLeft,
        scrollHeight = scrollEl.scrollHeight,
        scrollWidth = scrollEl.scrollWidth;

      // check direction
      var toTop = scrollTop > 0 && clientY >= top && clientY <= top + scrollThreshold;
      var toLeft = scrollLeft > 0 && clientX >= left && clientX <= left + scrollThreshold;
      var toRight = scrollLeft + width < scrollWidth && clientX <= right && clientX >= right - scrollThreshold;
      var toBottom = scrollTop + height < scrollHeight && clientY <= bottom && clientY >= bottom - scrollThreshold;
      var scrollx = 0,
        scrolly = 0;
      if (toLeft) {
        scrollx = Math.floor(Math.max(-1, (clientX - left) / scrollThreshold - 1) * scrollSpeed.x);
      }
      if (toRight) {
        scrollx = Math.ceil(Math.min(1, (clientX - right) / scrollThreshold + 1) * scrollSpeed.x);
      }
      if (toTop) {
        scrolly = Math.floor(Math.max(-1, (clientY - top) / scrollThreshold - 1) * scrollSpeed.y);
      }
      if (toBottom) {
        scrolly = Math.ceil(Math.min(1, (clientY - bottom) / scrollThreshold + 1) * scrollSpeed.y);
      }
      if (scrolly) {
        scrollEl.scrollTop += scrolly;
      }
      if (scrollx) {
        scrollEl.scrollLeft += scrollx;
      }
    }
  };

  function Animation(options) {
    this.options = options;
    this.animations = [];
  }
  Animation.prototype = {
    collect: function collect(dragEl, dropEl, parentEl, except) {
      if (!parentEl) return;
      var children = Array.prototype.slice.call(parentEl.children);
      var _this$_getRange = this._getRange(children, dragEl, dropEl),
        start = _this$_getRange.start,
        end = _this$_getRange.end;
      this.animations.length = 0;
      for (var i = start; i <= end; i++) {
        var node = children[i];
        if (!node || css(node, 'display') === 'none') continue;
        if (node === except || node === Sortable.ghost) continue;
        this.animations.push({
          node: node,
          rect: getRect(node)
        });
      }
    },
    animate: function animate() {
      for (var i = 0, len = this.animations.length; i < len; i++) {
        var _this$animations$i = this.animations[i],
          node = _this$animations$i.node,
          rect = _this$animations$i.rect;
        this._excute(node, rect);
      }
    },
    _excute: function _excute(el, _ref) {
      var left = _ref.left,
        top = _ref.top;
      var rect = getRect(el);
      var ot = top - rect.top;
      var ol = left - rect.left;
      setTransitionDuration(el);
      setTransform(el, "translate3d(".concat(ol, "px, ").concat(ot, "px, 0)"));

      // repaint
      el.offsetWidth;
      var duration = this.options.animation;
      setTransitionDuration(el, duration);
      setTransform(el, 'translate3d(0px, 0px, 0px)');
      clearTimeout(el.animated);
      el.animated = setTimeout(function () {
        setTransitionDuration(el);
        setTransform(el, '');
        el.animated = null;
      }, duration);
    },
    _getRange: function _getRange(children, dragEl, dropEl) {
      var start = children.indexOf(dragEl);
      var end = children.indexOf(dropEl);
      if (start > end) {
        var _ref2 = [end, start];
        start = _ref2[0];
        end = _ref2[1];
      }
      if (start < 0) {
        start = end;
        end = children.length - 1;
      }
      if (end < 0) end = children.length - 1;
      return {
        start: start,
        end: end
      };
    }
  };

  var multiTo, multiFrom, dragElements;
  function Multiple(options) {
    this.options = options || {};
    this.selectedElements = [];
  }
  Multiple.prototype = {
    destroy: function destroy() {
      multiTo = multiFrom = dragElements = null;
    },
    active: function active() {
      return !!multiFrom;
    },
    select: function select(element) {
      toggleClass(element, this.options.selectedClass, true);
      this.selectedElements.push(element);
      this.selectedElements.sort(function (a, b) {
        return sort(a, b);
      });
    },
    deselect: function deselect(element) {
      var index = this.selectedElements.indexOf(element);
      if (index > -1) {
        toggleClass(element, this.options.selectedClass, false);
        this.selectedElements.splice(index, 1);
      }
    },
    addSelected: function addSelected(elements) {
      var _this = this;
      elements.forEach(function (el) {
        return _this.selectedElements.push(el);
      });
    },
    removeSelected: function removeSelected(elements) {
      this.selectedElements = this.selectedElements.filter(function (el) {
        return elements.indexOf(el) < 0;
      });
    },
    getSelectedElements: function getSelectedElements() {
      return this.selectedElements;
    },
    getEmits: function getEmits() {
      var emit = {
        from: {},
        to: {}
      };
      if (multiFrom && multiTo) {
        emit.from = _objectSpread2({}, multiFrom);
        emit.to = _objectSpread2({}, multiTo);
      }
      return emit;
    },
    getHelper: function getHelper() {
      if (!multiFrom) return null;
      var container = document.createElement('div');
      this.selectedElements.forEach(function (node, index) {
        var clone = node.cloneNode(true);
        var opacity = index === 0 ? 1 : 0.5;
        clone.style = "\n        opacity: ".concat(opacity, ";\n        position: absolute;\n        z-index: ").concat(index, ";\n        left: 0;\n        top: 0;\n        bottom: 0;\n        right: 0;\n      ");
        container.appendChild(clone);
      });
      return container;
    },
    getOnEndParams: function getOnEndParams() {
      if (!multiFrom) return {};
      return {
        changed: multiFrom.sortable.el !== multiTo.sortable.el || this._offsetChanged(multiFrom.nodes, multiTo.nodes)
      };
    },
    onDrag: function onDrag(rootEl, sortable) {
      if (!this._isMultiple()) return;

      // sort all selected elements by offset before drag
      this.selectedElements.sort(function (a, b) {
        return sort(a, b);
      });
      var nodes = this.selectedElements.map(function (node) {
        return {
          node: node,
          rect: getRect(node),
          offset: getOffset(node, rootEl)
        };
      });
      multiFrom = {
        sortable: sortable,
        nodes: nodes
      };
      multiTo = {
        sortable: sortable,
        nodes: nodes
      };
      dragElements = this.selectedElements;
    },
    onStarted: function onStarted(sortable) {
      if (!multiFrom) return;
      var dragEl = Sortable.dragged;
      sortable.animator.collect(dragEl, null, dragEl.parentNode);
      dragElements.forEach(function (node) {
        if (node == dragEl) return;
        css(node, 'display', 'none');
      });
      sortable.animator.animate();
    },
    toggleElementsVisible: function toggleElementsVisible(bool) {
      if (!multiFrom) return;
      if (bool) {
        var index = dragElements.indexOf(Sortable.dragged);
        this._displayElements(dragElements, index, Sortable.dragged);
      } else {
        dragElements.forEach(function (node) {
          if (node == Sortable.dragged) return;
          css(node, 'display', 'none');
        });
      }
    },
    onChange: function onChange(dragEl, sortable) {
      if (!multiFrom) return;
      var rect = getRect(dragEl);
      var offset = getOffset(dragEl, sortable.el);
      multiTo = {
        sortable: sortable,
        nodes: dragElements.map(function (node) {
          return {
            node: node,
            rect: rect,
            offset: offset
          };
        })
      };
    },
    onDrop: function onDrop(dragEvent, rootEl, sortableChanged) {
      if (!multiFrom || !multiTo) return;
      multiFrom.sortable = dragEvent.sortable;
      var dragEl = Sortable.dragged;
      var cloneEl = Sortable.clone;
      multiTo.sortable.animator.collect(dragEl, null, dragEl.parentNode);
      var index = dragElements.indexOf(dragEl);
      var cloneElements = null;
      if (sortableChanged && cloneEl) {
        css(cloneEl, 'display', 'none');
        // clone elements to another list
        cloneElements = dragElements.map(function (node) {
          return node.cloneNode(true);
        });
        this._displayElements(cloneElements, index, cloneEl);
      }
      this._displayElements(dragElements, index, dragEl);
      multiTo.nodes = (cloneElements || dragElements).map(function (node) {
        return {
          node: node,
          rect: getRect(node),
          offset: getOffset(node, rootEl)
        };
      });
      multiTo.sortable.animator.animate();

      // Recalculate selected elements
      if (sortableChanged) {
        multiTo.sortable.multiplayer.addSelected(cloneElements || dragElements);
        if (!cloneEl) {
          multiFrom.sortable.multiplayer.removeSelected(dragElements);
        }
      }
    },
    onSelect: function onSelect(dragEvent, dropEvent, from) {
      if (!Sortable.dragged || !this._isMouseClick(dragEvent, dropEvent)) return;
      var dragEl = Sortable.dragged;
      var selectHandle = this.options.selectHandle;
      var _getEvent = getEvent(dropEvent),
        target = _getEvent.target;
      if (typeof selectHandle === 'function' && !selectHandle(dropEvent)) return;
      if (typeof selectHandle === 'string' && !matches(target, selectHandle)) return;
      var index = this.selectedElements.indexOf(dragEl);
      toggleClass(dragEl, this.options.selectedClass, index < 0);
      var params = _objectSpread2(_objectSpread2({}, from), {}, {
        event: dropEvent
      });
      if (index < 0) {
        this.selectedElements.push(dragEl);
        from.sortable._dispatchEvent('onSelect', params);
      } else {
        this.selectedElements.splice(index, 1);
        from.sortable._dispatchEvent('onDeselect', params);
      }
      this.selectedElements.sort(function (a, b) {
        return sort(a, b);
      });
    },
    _displayElements: function _displayElements(elements, index, target) {
      for (var i = 0; i < elements.length; i++) {
        css(elements[i], 'display', '');
        if (i < index) {
          target.parentNode.insertBefore(elements[i], target);
        } else {
          var dropEl = i > 0 ? elements[i - 1] : target;
          target.parentNode.insertBefore(elements[i], dropEl.nextSibling);
        }
      }
    },
    _isMultiple: function _isMultiple() {
      return this.options.multiple && this.selectedElements.length && this.selectedElements.indexOf(Sortable.dragged) > -1;
    },
    _isMouseClick: function _isMouseClick(dragEvent, dropEvent) {
      var difX = dropEvent.clientX - dragEvent.clientX;
      var difY = dropEvent.clientY - dragEvent.clientY;
      var difD = Math.sqrt(difX * difX + difY * difY);
      return difD >= 0 && difD <= 1;
    },
    _offsetChanged: function _offsetChanged(froms, tos) {
      return !!froms.find(function (from) {
        var to = tos.find(function (t) {
          return t.node === from.node;
        });
        return offsetChanged(from.offset, to.offset);
      });
    }
  };

  function Helper(distance) {
    this.helper = null;
    this.distance = distance;
  }
  Helper.prototype = {
    get node() {
      return this.helper;
    },
    destroy: function destroy() {
      if (this.helper && this.helper.parentNode) {
        this.helper.parentNode.removeChild(this.helper);
      }
      this.helper = this.distance = null;
    },
    move: function move(x, y) {
      if (!this.helper) return;
      setTransform(this.helper, "translate3d(".concat(x, "px, ").concat(y, "px, 0)"));
    },
    init: function init(rect, element, container, options) {
      if (this.helper) return;
      var fallbackOnBody = options.fallbackOnBody,
        ghostClass = options.ghostClass,
        ghostStyle = options.ghostStyle;
      var helperContainer = fallbackOnBody ? document.body : container;
      this.helper = element.cloneNode(true);
      toggleClass(this.helper, ghostClass, true);
      var helperStyle = _objectSpread2({
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        minWidth: rect.width,
        minHeight: rect.height,
        opacity: '0.8',
        overflow: 'hidden',
        'z-index': '100000',
        'box-sizing': 'border-box',
        'pointer-events': 'none'
      }, ghostStyle);
      for (var key in helperStyle) {
        css(this.helper, key, helperStyle[key]);
      }
      setTransition(this.helper, 'none');
      setTransform(this.helper, 'translate3d(0px, 0px, 0px)');
      helperContainer.appendChild(this.helper);
      var ox = this.distance.x / parseInt(this.helper.style.width) * 100;
      var oy = this.distance.y / parseInt(this.helper.style.height) * 100;
      css(this.helper, 'transform-origin', "".concat(ox, "% ").concat(oy, "%"));
      css(this.helper, 'transform', 'translateZ(0)');
      css(this.helper, 'will-change', 'transform');
    }
  };

  var expando = 'Sortable' + Date.now();
  var to,
    from,
    helper,
    rootEl,
    dragEl,
    dropEl,
    nextEl,
    cloneEl,
    parentEl,
    dragEvent,
    moveEvent,
    lastDropEl,
    isCloneMode,
    listenerNode,
    lastHoverArea,
    dragStartTimer,
    sortables = [];
  var _prepareGroup = function _prepareGroup(options) {
    var group = {};
    var originalGroup = options.group;
    if (!originalGroup || _typeof(originalGroup) != 'object') {
      originalGroup = {
        name: originalGroup,
        pull: true,
        put: true,
        revertClone: true
      };
    }
    group.name = originalGroup.name;
    group.pull = originalGroup.pull;
    group.put = originalGroup.put;
    group.revertClone = originalGroup.revertClone;
    options.group = group;
  };

  /**
   * Detects first nearest empty sortable to X and Y position using emptyInsertThreshold.
   * @return {HTMLElement} Element of the first found nearest Sortable
   */
  var _detectNearestSortable = function _detectNearestSortable(x, y) {
    var result;
    sortables.some(function (sortable) {
      var threshold = sortable[expando].options.emptyInsertThreshold;
      if (!threshold) return;
      var rect = getRect(sortable, {
          parent: true
        }),
        insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
        insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
      if (insideHorizontally && insideVertically) {
        return result = sortable;
      }
    });
    return result;
  };
  var _positionChanged = function _positionChanged(evt) {
    var lastEvent = moveEvent || dragEvent;
    var clientX = evt.clientX,
      clientY = evt.clientY;
    var distanceX = clientX - lastEvent.clientX;
    var distanceY = clientY - lastEvent.clientY;
    if (clientX !== void 0 && clientY !== void 0 && Math.abs(distanceX) <= 0 && Math.abs(distanceY) <= 0) {
      return false;
    }
    return true;
  };

  /**
   * @class Sortable
   * @param {HTMLElement} el container
   * @param {Object} options
   */
  function Sortable(el, options) {
    if (!(el && el.nodeType && el.nodeType === 1)) {
      throw "Sortable-dnd: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
    }
    el[expando] = this;
    this.el = el;
    this.options = options = Object.assign({}, options);
    var defaults = {
      disabled: false,
      group: '',
      animation: 150,
      draggable: null,
      handle: null,
      multiple: false,
      selectHandle: null,
      customGhost: null,
      direction: function direction() {
        return detectDirection(el, options.draggable);
      },
      autoScroll: true,
      scrollThreshold: 55,
      scrollSpeed: {
        x: 10,
        y: 10
      },
      delay: 0,
      delayOnTouchOnly: false,
      touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
      ghostClass: '',
      ghostStyle: {},
      chosenClass: '',
      selectedClass: '',
      swapOnDrop: true,
      fallbackOnBody: false,
      supportTouch: 'ontouchstart' in window,
      emptyInsertThreshold: 5
    };

    // Set default options
    for (var name in defaults) {
      !(name in this.options) && (this.options[name] = defaults[name]);
    }
    _prepareGroup(options);

    // Bind all private methods
    for (var fn in this) {
      if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
        this[fn] = this[fn].bind(this);
      }
    }
    var supportTouch = this.options.supportTouch;
    if (supportTouch) {
      on(el, 'touchstart', this._onDrag);
    } else {
      on(el, 'mousedown', this._onDrag);
    }
    sortables.push(el);
    this.autoScroller = new AutoScroll(this.options);
    this.multiplayer = new Multiple(this.options);
    this.animator = new Animation(this.options);
  }
  Sortable.prototype = {
    constructor: Sortable,
    // ========================================= Public Methods =========================================
    destroy: function destroy() {
      var _this = this;
      this._dispatchEvent('onDestroy', {
        sortable: this
      });
      events.start.forEach(function (event) {
        return off(_this.el, event, _this._onDrag);
      });
      sortables.splice(sortables.indexOf(this.el), 1);
      this._clearState();
      this.el[expando] = this.animator = this.multiplayer = this.autoScroller = null;
    },
    option: function option(key, value) {
      if (value === void 0) {
        return this.options[key];
      }

      // set option
      this.options[key] = value;
      this.animator.options[key] = value;
      this.multiplayer.options[key] = value;
      this.autoScroller.options[key] = value;
      if (key === 'group') {
        _prepareGroup(this.options);
      }
    },
    select: function select(element) {
      this.multiplayer.select(element);
    },
    deselect: function deselect(element) {
      this.multiplayer.deselect(element);
    },
    getSelectedElements: function getSelectedElements() {
      return this.multiplayer.getSelectedElements();
    },
    // ========================================= Properties =========================================
    _onDrag: function _onDrag( /** Event|TouchEvent */evt) {
      if (this.options.disabled || !this.options.group.pull) return;

      // only left button and enabled
      if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0) return;
      var _getEvent = getEvent(evt),
        touch = _getEvent.touch,
        event = _getEvent.event,
        target = _getEvent.target;
      if (target === this.el) return;

      // Safari ignores further event handling after mousedown
      if (Safari && target && target.tagName.toUpperCase() === 'SELECT') return;
      dragEl = closest(target, this.options.draggable, this.el);

      // No dragging is allowed when there is no dragging element
      if (!dragEl || dragEl.animated) return;
      listenerNode = touch ? dragEl : document;
      cloneEl = dragEl.cloneNode(true);
      parentEl = dragEl.parentNode;
      Sortable.dragged = dragEl;
      dragEvent = event;
      dragEvent.sortable = this;
      this.multiplayer.onDrag(this.el, this);

      // get the position of the dragEl
      var rect = getRect(dragEl);
      var offset = getOffset(dragEl, this.el);
      from = {
        sortable: this,
        node: dragEl,
        rect: rect,
        offset: offset
      };
      to = {
        sortable: this,
        node: dragEl,
        rect: rect,
        offset: offset
      };
      helper = new Helper({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
      on(listenerNode, 'touchend', this._onDrop);
      on(listenerNode, 'touchcancel', this._onDrop);
      on(listenerNode, 'mouseup', this._onDrop);
      var handle = this.options.handle;
      if (typeof handle === 'function' && !handle(event)) return;
      if (typeof handle === 'string' && !matches(target, handle)) return;
      this._prepareStart(touch);
    },
    _prepareStart: function _prepareStart(touch) {
      var _this2 = this;
      var _this$options = this.options,
        delay = _this$options.delay,
        delayOnTouchOnly = _this$options.delayOnTouchOnly;

      // Delay is impossible for native DnD in Edge or IE
      if (delay && (!delayOnTouchOnly || touch) && !(Edge || IE11OrLess)) {
        events.move.forEach(function (event) {
          return on(_this2.el.ownerDocument, event, _this2._delayMoveHandler);
        });
        events.end.forEach(function (event) {
          return on(_this2.el.ownerDocument, event, _this2._cancelStart);
        });
        dragStartTimer = setTimeout(function () {
          return _this2._onStart(touch);
        }, delay);
      } else {
        this._onStart(touch);
      }
    },
    _delayMoveHandler: function _delayMoveHandler(evt) {
      var e = evt.touches ? evt.touches[0] : evt;
      if (Math.max(Math.abs(e.clientX - dragEvent.clientX), Math.abs(e.clientY - dragEvent.clientY)) >= Math.floor(this.options.touchStartThreshold / (window.devicePixelRatio || 1))) {
        this._cancelStart();
      }
    },
    _cancelStart: function _cancelStart() {
      var _this3 = this;
      clearTimeout(dragStartTimer);
      events.move.forEach(function (event) {
        return off(_this3.el.ownerDocument, event, _this3._delayMoveHandler);
      });
      events.end.forEach(function (event) {
        return off(_this3.el.ownerDocument, event, _this3._cancelStart);
      });
    },
    _onStart: function _onStart( /** TouchEvent */touch) {
      rootEl = this.el;
      if (this.options.group.pull === 'clone') {
        isCloneMode = true;
        Sortable.clone = cloneEl;
      }
      if (touch) {
        on(listenerNode, 'touchmove', this._nearestSortable);
      } else {
        on(listenerNode, 'mousemove', this._nearestSortable);
      }

      // clear selection
      try {
        if (document.selection) {
          // Timeout neccessary for IE9
          setTimeout(function () {
            return document.selection.empty();
          }, 0);
        } else {
          window.getSelection().removeAllRanges();
        }
      } catch (error) {}
    },
    _onStarted: function _onStarted() {
      Sortable.active = this;
      this._dispatchEvent('onDrag', _objectSpread2(_objectSpread2({}, this._getFromTo()), {}, {
        event: dragEvent
      }));
      this.multiplayer.onStarted(this);
      var element = this._getGhostElement();
      helper.init(from.rect, element, this.el, this.options);
      Sortable.ghost = helper.node;

      // Hide the drag element and show the cloned dom element
      css(dragEl, 'display', 'none');
      dragEl.parentNode.insertBefore(cloneEl, dragEl);
      toggleClass(cloneEl, this.options.chosenClass, true);
      Safari && css(document.body, 'user-select', 'none');
    },
    _getGhostElement: function _getGhostElement() {
      var customGhost = this.options.customGhost;
      if (typeof customGhost === 'function') {
        var selectedElements = this.multiplayer.getSelectedElements();
        return customGhost(selectedElements.length ? selectedElements : [dragEl]);
      }
      return this.multiplayer.getHelper() || dragEl;
    },
    _nearestSortable: function _nearestSortable( /** Event|TouchEvent */evt) {
      preventDefault(evt);
      if (!dragEvent || !dragEl || !_positionChanged(evt)) return;

      // Init in the move event to prevent conflict with the click event
      !moveEvent && this._onStarted();
      var _getEvent2 = getEvent(evt),
        event = _getEvent2.event,
        target = _getEvent2.target;
      moveEvent = event;
      helper.move(event.clientX - dragEvent.clientX, event.clientY - dragEvent.clientY);
      this._autoScroll(target);
      var nearest = _detectNearestSortable(event.clientX, event.clientY);
      nearest && nearest[expando]._onMove(event, target);
    },
    _autoScroll: function _autoScroll(target) {
      if (this.options.autoScroll) {
        var scrollEl = getParentAutoScrollElement(target, true);
        this.autoScroller.update(scrollEl, dragEvent, moveEvent);
      }
    },
    _allowPut: function _allowPut() {
      if (dragEvent.sortable.el === this.el) {
        return true;
      } else if (!this.options.group.put) {
        return false;
      } else {
        var _this$options$group = this.options.group,
          name = _this$options$group.name,
          put = _this$options$group.put;
        var fromGroup = dragEvent.sortable.options.group;
        return put.join && put.indexOf(fromGroup.name) > -1 || fromGroup.name && name && fromGroup.name === name;
      }
    },
    _allowSwap: function _allowSwap() {
      var order = sort(cloneEl, dropEl);
      nextEl = order < 0 ? dropEl.nextSibling : dropEl;
      if (lastDropEl !== dropEl) {
        lastHoverArea = 0;
        return true;
      }
      var rect = getRect(dropEl),
        direction = typeof this.options.direction === 'function' ? this.options.direction.call(moveEvent, dragEl, this) : this.options.direction,
        vertical = direction === 'vertical',
        mouseOnAxis = vertical ? moveEvent.clientY : moveEvent.clientX,
        dropElSize = dropEl[direction === 'vertical' ? 'offsetHeight' : 'offsetWidth'],
        hoverArea = mouseOnAxis >= (vertical ? rect.top : rect.left) && mouseOnAxis < (vertical ? rect.bottom : rect.right) - dropElSize / 2 ? -1 : 1;
      if (lastHoverArea !== hoverArea) {
        lastHoverArea = hoverArea;
        return hoverArea < 0 ? order > 0 : order < 0;
      }
      return false;
    },
    _onMove: function _onMove( /** Event|TouchEvent */event, target) {
      if (!this._allowPut()) return;
      this._dispatchEvent('onMove', _objectSpread2(_objectSpread2({}, this._getFromTo()), {}, {
        event: event
      }));
      rootEl = this.el;
      dropEl = closest(target, this.options.draggable, rootEl);

      // insert to last
      if (rootEl !== from.sortable.el && (target === rootEl || !lastChild(rootEl))) {
        lastDropEl = null;
        this._onInsert(event, true);
        return;
      }
      if (!dropEl || dropEl.animated || !this._allowSwap()) return;
      if (dropEl === cloneEl || containes(dropEl, cloneEl)) return;
      if (rootEl !== from.sortable.el) {
        this._onInsert(event, false);
      } else if (!(within(event, parentEl) && target === parentEl)) {
        this._onChange(event);
      }
      lastDropEl = dropEl;
    },
    _onInsert: function _onInsert( /** Event|TouchEvent */event, insertToLast) {
      var target = insertToLast ? cloneEl : dropEl;
      parentEl = insertToLast ? rootEl : dropEl.parentNode;
      from.sortable.animator.collect(cloneEl, null, cloneEl.parentNode, cloneEl);
      this.animator.collect(null, target, parentEl, cloneEl);
      this.multiplayer.onChange(cloneEl, this);
      to = {
        sortable: this,
        node: target,
        rect: getRect(target),
        offset: getOffset(target, rootEl)
      };

      // show dragEl before clone to another list
      if (isCloneMode && this.el !== dragEvent.sortable.el && from.sortable.el === dragEvent.sortable.el) {
        css(dragEl, 'display', '');
        if (!dragEvent.sortable.options.group.revertClone) {
          dragEl.parentNode.insertBefore(dragEl, cloneEl);
        }
        dragEvent.sortable.multiplayer.toggleElementsVisible(true);
      }
      from.sortable._dispatchEvent('onRemove', _objectSpread2(_objectSpread2({}, this._getFromTo()), {}, {
        event: event
      }));
      if (insertToLast) {
        parentEl.appendChild(cloneEl);
      } else {
        parentEl.insertBefore(cloneEl, dropEl);
      }
      this._dispatchEvent('onAdd', _objectSpread2(_objectSpread2({}, this._getFromTo()), {}, {
        event: event
      }));

      // hide dragEl when returning to the original list
      if (isCloneMode && this.el === dragEvent.sortable.el) {
        css(dragEl, 'display', 'none');
        dragEvent.sortable.multiplayer.toggleElementsVisible(false);
      }
      from.sortable.animator.animate();
      this.animator.animate();
      from.sortable = this;
    },
    _onChange: function _onChange( /** Event|TouchEvent */event) {
      parentEl = dropEl.parentNode;
      this.animator.collect(cloneEl, dropEl, parentEl);
      this.multiplayer.onChange(cloneEl, this);
      to = {
        sortable: this,
        node: dropEl,
        rect: getRect(dropEl),
        offset: getOffset(dropEl, rootEl)
      };
      this._dispatchEvent('onChange', _objectSpread2(_objectSpread2({}, this._getFromTo()), {}, {
        event: event
      }));
      parentEl.insertBefore(cloneEl, nextEl);
      this.animator.animate();
      from.sortable = this;
    },
    _onDrop: function _onDrop( /** Event|TouchEvent */event) {
      preventDefault(event);
      this._cancelStart();
      this._unbindEvents();
      this.autoScroller.clear();
      if (dragEl && dragEvent && moveEvent) {
        this._onEnd(event);
      } else if (this.options.multiple) {
        this.multiplayer.onSelect(dragEvent, event, _objectSpread2({}, from));
      }
      this._clearState();
    },
    _onEnd: function _onEnd( /** Event|TouchEvent */event) {
      from.sortable = dragEvent.sortable;
      var sortableChanged = from.sortable.el !== to.sortable.el;

      // swap real drag element to the current drop position
      if (this.options.swapOnDrop && (!isCloneMode || !sortableChanged)) {
        parentEl.insertBefore(dragEl, cloneEl);
      }

      // re-acquire the offset and rect values of the dragged element as the value after the drag is completed
      to.rect = getRect(cloneEl);
      to.offset = getOffset(cloneEl, rootEl);
      if (to.node === cloneEl) to.node = dragEl;
      this.multiplayer.onDrop(dragEvent, rootEl, sortableChanged);
      var multiParams = this.multiplayer.getOnEndParams();
      var changed = sortableChanged || offsetChanged(from.offset, to.offset);
      var params = _objectSpread2(_objectSpread2({}, this._getFromTo()), {}, {
        changed: changed,
        event: event
      }, multiParams);
      if (sortableChanged) {
        from.sortable._dispatchEvent('onDrop', params);
      }
      to.sortable._dispatchEvent('onDrop', params);
      if (!isCloneMode || !sortableChanged || this.multiplayer.active()) {
        parentEl.removeChild(cloneEl);
      } else {
        toggleClass(cloneEl, this.options.chosenClass, false);
      }
      css(dragEl, 'display', '');
      Safari && css(document.body, 'user-select', '');
    },
    _getFromTo: function _getFromTo() {
      var multiEmit = this.multiplayer.getEmits();
      return {
        from: _objectSpread2(_objectSpread2({}, multiEmit.from), from),
        to: _objectSpread2(_objectSpread2({}, multiEmit.to), to)
      };
    },
    _dispatchEvent: function _dispatchEvent(event) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var callback = this.options[event];
      if (typeof callback === 'function') {
        callback(_objectSpread2({}, params));
      }
    },
    _clearState: function _clearState() {
      this.multiplayer.destroy();
      helper && helper.destroy();
      to = from = helper = rootEl = dragEl = dropEl = nextEl = cloneEl = parentEl = dragEvent = moveEvent = lastDropEl = isCloneMode = listenerNode = lastHoverArea = dragStartTimer = Sortable.clone = Sortable.ghost = Sortable.active = Sortable.dragged = null;
    },
    _unbindEvents: function _unbindEvents() {
      var _this4 = this;
      events.move.forEach(function (event) {
        return off(listenerNode, event, _this4._nearestSortable);
      });
      events.end.forEach(function (event) {
        return off(listenerNode, event, _this4._onDrop);
      });
    }
  };
  Sortable.utils = {
    on: on,
    off: off,
    css: css,
    index: index,
    closest: closest,
    getOffset: getOffset,
    toggleClass: toggleClass,
    detectDirection: detectDirection
  };

  /**
   * Get the Sortable instance of an element
   */
  Sortable.get = function (element) {
    return element[expando];
  };

  /**
   * Create sortable instance
   */
  Sortable.create = function (el, options) {
    return new Sortable(el, options);
  };

  return Sortable;

})));

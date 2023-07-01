/*!
 * sortable-dnd v0.5.4
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
      return '';
    }

    // window.getComputedStyle() returns null inside an iframe with display: none
    // in this case return an array with a fake mozilla style in it.
    var styles = window.getComputedStyle(document.documentElement, '') || ['-moz-hidden-iframe'];
    var pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o'])[1];
    switch (pre) {
      case 'ms':
        return 'ms';
      default:
        return pre && pre.length ? pre[0].toUpperCase() + pre.substr(1) : '';
    }
  }();

  /**
   * check if is HTMLElement
   */
  function isHTMLElement(node) {
    if (!node) return false;
    var ctx = document.createElement('div');
    try {
      ctx.appendChild(node.cloneNode(true));
      return node.nodeType == 1 ? true : false;
    } catch (e) {
      return node == window || node == document;
    }
  }
  function setTransition(el, transition) {
    el.style["".concat(vendorPrefix, "Transition")] = transition ? transition === 'none' ? 'none' : "".concat(transition) : '';
  }
  function setTransitionDuration(el, duration) {
    el.style["".concat(vendorPrefix, "TransitionDuration")] = duration == null ? '' : "".concat(duration, "ms");
  }
  function setTransform(el, transform) {
    el.style["".concat(vendorPrefix, "Transform")] = transform ? "".concat(transform) : '';
  }

  /**
   * add specified event listener
   */
  function on(el, event, fn) {
    if (window.addEventListener) {
      el.addEventListener(event, fn, supportPassive || !IE11OrLess ? captureMode : false);
    } else if (window.attachEvent) {
      el.attachEvent('on' + event, fn);
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
   * get element's offetTop in given parent node
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
    var scrollingElement = document.scrollingElement;
    if (scrollingElement) {
      return scrollingElement;
    } else {
      return document.documentElement;
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
          var index = children.indexOf(el);
          if (index > -1) return children[index];

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
  function lastChild(el, helper, selector) {
    var last = el.lastElementChild;
    while (last && (last === helper || css(last, 'display') === 'none' || selector && !matches(last, selector))) {
      last = last.previousElementSibling;
    }
    return last || null;
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

  /**
   * Check whether the front and rear positions are consistent
   */
  function offsetChanged(o1, o2) {
    return o1.top !== o2.top || o1.left !== o2.left;
  }
  function sortByOffset(o1, o2) {
    return o1.top == o2.top ? o1.left - o2.left : o1.top - o2.top;
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
  function sortableChanged(from, to) {
    return from.sortable.el !== to.sortable.el;
  }
  function visible(el, visible) {
    css(el, 'display', visible ? '' : 'none');
  }
  function _nextTick(fn) {
    return setTimeout(fn, 0);
  }
  function randomCode() {
    return Number(Math.random().toString().slice(-3) + Date.now()).toString(32);
  }
  var expando = 'Sortable' + Date.now();

  var multiFromTo = {
    sortable: null,
    nodes: []
  };
  var multiFrom = _objectSpread2({}, multiFromTo),
    multiTo = _objectSpread2({}, multiFromTo),
    selectedElements = {};
  var getMultiDiffer = function getMultiDiffer() {
    return {
      from: _objectSpread2({}, multiFrom),
      to: _objectSpread2({}, multiTo)
    };
  };
  function Multiple(options) {
    this.options = options || {};
    this.groupName = options.group.name || 'group_' + randomCode();
  }
  Multiple.prototype = {
    /**
     * Indicates whether the multi-drag mode is used
     * @returns {boolean}
     */
    allowDrag: function allowDrag(dragEl) {
      return this.options.multiple && selectedElements[this.groupName] && selectedElements[this.groupName].length && selectedElements[this.groupName].indexOf(dragEl) > -1;
    },
    getHelper: function getHelper() {
      var container = document.createElement('div');
      selectedElements[this.groupName].forEach(function (node, index) {
        var clone = node.cloneNode(true);
        var opacity = index === 0 ? 1 : 0.5;
        clone.style = "\n        opacity: ".concat(opacity, ";\n        position: absolute;\n        z-index: ").concat(index, ";\n        left: 0;\n        top: 0;\n        bottom: 0;\n        right: 0;\n      ");
        container.appendChild(clone);
      });
      return container;
    },
    /**
     * Collecting Multi-Drag Elements
     */
    select: function select(event, dragEl, rootEl, from) {
      if (!dragEl) return;
      if (!selectedElements[this.groupName]) {
        selectedElements[this.groupName] = [];
      }
      var index = selectedElements[this.groupName].indexOf(dragEl);
      toggleClass(dragEl, this.options.selectedClass, index < 0);
      var params = _objectSpread2(_objectSpread2({}, from), {}, {
        event: event
      });
      if (index < 0) {
        selectedElements[this.groupName].push(dragEl);
        from.sortable._dispatchEvent('onSelect', params);
      } else {
        selectedElements[this.groupName].splice(index, 1);
        from.sortable._dispatchEvent('onDeselect', params);
      }
      selectedElements[this.groupName].sort(function (a, b) {
        return sortByOffset(getOffset(a, rootEl), getOffset(b, rootEl));
      });
    },
    onDrag: function onDrag(rootEl, sortable) {
      multiFrom.sortable = sortable;
      multiFrom.nodes = selectedElements[this.groupName].map(function (node) {
        return {
          node: node,
          rect: getRect(node),
          offset: getOffset(node, rootEl)
        };
      });
      multiTo.sortable = sortable;
    },
    onTrulyStarted: function onTrulyStarted(dragEl, sortable) {
      sortable.animator.collect(dragEl, null, dragEl.parentNode);
      selectedElements[this.groupName].forEach(function (node) {
        if (node == dragEl) return;
        visible(node, false);
      });
      sortable.animator.animate();
    },
    onChange: function onChange(dragEl, sortable) {
      var rect = getRect(dragEl);
      var offset = getOffset(dragEl, sortable.el);
      multiTo.sortable = sortable;
      multiTo.nodes = selectedElements[this.groupName].map(function (node) {
        return {
          node: node,
          rect: rect,
          offset: offset
        };
      });
    },
    onDrop: function onDrop(event, dragEl, rootEl, downEvent, _emits) {
      var _this = this;
      multiTo.sortable.animator.collect(dragEl, null, dragEl.parentNode);
      var index = selectedElements[this.groupName].indexOf(dragEl);
      selectedElements[this.groupName].forEach(function (node, i) {
        visible(node, true);
        if (i < index) {
          dragEl.parentNode.insertBefore(node, dragEl);
        } else {
          var dropEl = i > 0 ? selectedElements[_this.groupName][i - 1] : dragEl;
          dragEl.parentNode.insertBefore(node, dropEl.nextSibling);
        }
      });
      multiFrom.sortable = downEvent.sortable;
      multiTo.nodes = selectedElements[this.groupName].map(function (node) {
        return {
          node: node,
          rect: getRect(node),
          offset: getOffset(node, rootEl)
        };
      });
      var ctxChanged = sortableChanged(multiFrom, multiTo);
      var changed = ctxChanged || this._offsetChanged(multiFrom.nodes, multiTo.nodes);
      var params = _objectSpread2(_objectSpread2({}, _emits()), {}, {
        changed: changed,
        event: event
      });
      if (ctxChanged) {
        multiFrom.sortable._dispatchEvent('onDrop', params);
      }
      multiTo.sortable._dispatchEvent('onDrop', params);
      multiTo.sortable.animator.animate();
    },
    _offsetChanged: function _offsetChanged(ns1, ns2) {
      return !!ns1.find(function (o2) {
        var o1 = ns2.find(function (n) {
          return n.node === o2.node;
        });
        return offsetChanged(o1.offset, o2.offset);
      });
    }
  };

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
  function AutoScroll() {
    this.autoScrollAnimationFrame = null;
    this.speed = {
      x: 10,
      y: 10
    };
  }
  AutoScroll.prototype = {
    clear: function clear() {
      if (this.autoScrollAnimationFrame == null) {
        return;
      }
      cancelAnimationFrame(this.autoScrollAnimationFrame);
      this.autoScrollAnimationFrame = null;
    },
    update: function update(scrollEl, scrollThreshold, downEvent, moveEvent) {
      var _this = this;
      cancelAnimationFrame(this.autoScrollAnimationFrame);
      this.autoScrollAnimationFrame = requestAnimationFrame(function () {
        if (downEvent && moveEvent) {
          _this.autoScroll(scrollEl, scrollThreshold, moveEvent);
        }
        _this.update(scrollEl, scrollThreshold, downEvent, moveEvent);
      });
    },
    autoScroll: function autoScroll(scrollEl, scrollThreshold, evt) {
      if (!scrollEl) return;
      var clientX = evt.clientX,
        clientY = evt.clientY;
      if (clientX === void 0 || clientY === void 0) return;
      var rect = getRect(scrollEl);
      if (!rect) return;
      var scrollTop = scrollEl.scrollTop,
        scrollLeft = scrollEl.scrollLeft,
        scrollHeight = scrollEl.scrollHeight,
        scrollWidth = scrollEl.scrollWidth;
      var top = rect.top,
        right = rect.right,
        bottom = rect.bottom,
        left = rect.left,
        height = rect.height,
        width = rect.width;
      if (clientY < top || clientX > right || clientY > bottom || clientX < left) {
        return;
      }

      // check direction
      var toTop = scrollTop > 0 && clientY >= top && clientY <= top + scrollThreshold;
      var toLeft = scrollLeft > 0 && clientX >= left && clientX <= left + scrollThreshold;
      var toRight = scrollLeft + width < scrollWidth && clientX <= right && clientX >= right - scrollThreshold;
      var toBottom = scrollTop + height < scrollHeight && clientY <= bottom && clientY >= bottom - scrollThreshold;
      var scrollx = 0,
        scrolly = 0;
      if (toLeft) {
        scrollx = Math.floor(Math.max(-1, (clientX - left) / scrollThreshold - 1) * this.speed.x);
      }
      if (toRight) {
        scrollx = Math.ceil(Math.min(1, (clientX - right) / scrollThreshold + 1) * this.speed.x);
      }
      if (toTop) {
        scrolly = Math.floor(Math.max(-1, (clientY - top) / scrollThreshold - 1) * this.speed.y);
      }
      if (toBottom) {
        scrolly = Math.ceil(Math.min(1, (clientY - bottom) / scrollThreshold + 1) * this.speed.y);
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
    collect: function collect(dragEl, dropEl, container, except) {
      var _this = this;
      if (!container) return;
      var children = Array.prototype.slice.call(container.children);
      var _this$_getRange = this._getRange(children, dragEl, dropEl, except),
        start = _this$_getRange.start,
        end = _this$_getRange.end;
      this.animations.length = 0;
      children.slice(start, end + 1).forEach(function (node) {
        if (css(node, 'display') === 'none') return;
        if (node === except || node === Sortable.helper) return;
        _this.animations.push({
          node: node,
          rect: getRect(node)
        });
      });
    },
    animate: function animate() {
      var _this2 = this;
      this.animations.forEach(function (state) {
        var node = state.node,
          rect = state.rect;
        _this2._excute(node, rect);
      });
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

  function Helper() {
    this.helper = null;
    this.distance = {
      x: 0,
      y: 0
    };
  }
  Helper.prototype = {
    get node() {
      return this.helper;
    },
    destroy: function destroy() {
      if (this.helper && this.helper.parentNode) {
        this.helper.parentNode.removeChild(this.helper);
      }
      this.helper = null;
      this.distance = {
        x: 0,
        y: 0
      };
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
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        position: 'fixed',
        opacity: '0.8',
        'z-index': 100000,
        'pointer-events': 'none',
        'box-sizing': 'border-box'
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

  var FromTo = {
    sortable: null,
    group: null,
    node: null,
    rect: {},
    offset: {}
  };
  var sortables = [];
  var rootEl,
    dragEl,
    dropEl,
    cloneEl,
    downEvent,
    moveEvent,
    isMultiple,
    lastDropEl,
    dragStartTimer,
    helper = new Helper(),
    autoScroller = new AutoScroll();
  var from = _objectSpread2({}, FromTo);
  var to = _objectSpread2({}, FromTo);
  var lastPosition = {
    x: 0,
    y: 0
  };
  var _prepareGroup = function _prepareGroup(options) {
    var group = {};
    var originalGroup = options.group;
    if (!originalGroup || _typeof(originalGroup) != 'object') {
      originalGroup = {
        name: originalGroup,
        pull: true,
        put: true
      };
    }
    group.name = originalGroup.name;
    group.pull = originalGroup.pull;
    group.put = originalGroup.put;
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
    var clientX = evt.clientX,
      clientY = evt.clientY;
    var distanceX = clientX - lastPosition.x;
    var distanceY = clientY - lastPosition.y;
    lastPosition.x = clientX;
    lastPosition.y = clientY;
    if (clientX !== void 0 && clientY !== void 0 && Math.abs(distanceX) <= 0 && Math.abs(distanceY) <= 0) {
      return false;
    }
    return true;
  };
  var _emits = function _emits() {
    var result = {
      from: _objectSpread2({}, from),
      to: _objectSpread2({}, to)
    };
    if (isMultiple) {
      var ft = getMultiDiffer();
      result.from = _objectSpread2(_objectSpread2({}, ft.from), result.from);
      result.to = _objectSpread2(_objectSpread2({}, ft.to), result.to);
    }
    return result;
  };

  /**
   * @class Sortable
   * @param {HTMLElement} el container
   * @param {Object} options
   */
  function Sortable(el, options) {
    if (!(el && el.nodeType && el.nodeType === 1)) {
      throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
    }
    el[expando] = this;
    this.el = el;
    this.ownerDocument = el.ownerDocument;
    this.options = options = Object.assign({}, options);
    var defaults = {
      disabled: false,
      group: '',
      animation: 150,
      multiple: false,
      draggable: null,
      handle: null,
      onDrag: null,
      onMove: null,
      onDrop: null,
      onChange: null,
      autoScroll: true,
      scrollThreshold: 55,
      delay: 0,
      delayOnTouchOnly: false,
      touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
      ghostClass: '',
      ghostStyle: {},
      chosenClass: '',
      selectedClass: '',
      swapOnDrop: true,
      fallbackOnBody: false,
      stopPropagation: false,
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
    this.multiplayer = new Multiple(this.options);
    this.animator = new Animation(this.options);
  }
  Sortable.prototype = {
    constructor: Sortable,
    /**
     * Destroy
     */
    destroy: function destroy() {
      this._dispatchEvent('destroy', this);
      this.el[expando] = null;
      for (var i = 0; i < events.start.length; i++) {
        off(this.el, events.start[i], this._onDrag);
      }
      this._clearState();
      sortables.splice(sortables.indexOf(this.el), 1);
      this.el = null;
    },
    /**
     * Get/Set option
     */
    option: function option(key, value) {
      var options = this.options;
      if (value === void 0) {
        return options[key];
      } else {
        options[key] = value;
        if (key === 'group') {
          _prepareGroup(options);
        }
      }
    },
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
      var _this$options = this.options,
        draggable = _this$options.draggable,
        handle = _this$options.handle;
      if (typeof handle === 'function' && !handle(evt)) return;
      if (typeof handle === 'string' && !matches(target, handle)) return;
      if (typeof draggable === 'function') {
        // The function type must return an HTMLElement if used to specifies the drag element
        var element = draggable(evt);
        if (!element) return;
        if (isHTMLElement(element)) {
          dragEl = element;
        }
      } else {
        // String use as 'TagName' or '.class' or '#id'
        dragEl = closest(target, draggable, this.el, false);
      }

      // No dragging is allowed when there is no dragging element
      if (!dragEl || dragEl.animated) return;
      cloneEl = dragEl.cloneNode(true);
      this._prepareStart(touch, event);
    },
    _prepareStart: function _prepareStart(touch, event) {
      var _this = this;
      var parentEl = dragEl.parentNode;
      downEvent = event;
      downEvent.sortable = this;
      downEvent.group = dragEl.parentNode;
      isMultiple = this.options.multiple && this.multiplayer.allowDrag(dragEl);
      isMultiple && this.multiplayer.onDrag(this.el, this);

      // get the position of the dragEl
      var rect = getRect(dragEl);
      var offset = getOffset(dragEl, this.el);
      from = {
        sortable: this,
        group: parentEl,
        node: dragEl,
        rect: rect,
        offset: offset
      };
      to.group = parentEl;
      to.sortable = this;
      helper.distance = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      on(document, 'touchend', this._onDrop);
      on(document, 'touchcancel', this._onDrop);
      on(document, 'mouseup', this._onDrop);
      var _this$options2 = this.options,
        delay = _this$options2.delay,
        delayOnTouchOnly = _this$options2.delayOnTouchOnly;
      if (delay && (!delayOnTouchOnly || touch) && !(Edge || IE11OrLess)) {
        for (var i = 0; i < events.end.length; i++) {
          on(this.ownerDocument, events.end[i], this._cancelStart);
        }
        for (var _i = 0; _i < events.move.length; _i++) {
          on(this.ownerDocument, events.move[_i], this._delayMoveHandler);
        }
        dragStartTimer = setTimeout(function () {
          return _this._onStart(touch);
        }, delay);
      } else {
        this._onStart(touch);
      }
    },
    _delayMoveHandler: function _delayMoveHandler(evt) {
      var touch = evt.touches ? evt.touches[0] : evt;
      if (Math.max(Math.abs(touch.clientX - downEvent.clientX), Math.abs(touch.clientY - downEvent.clientY)) >= Math.floor(this.options.touchStartThreshold / (window.devicePixelRatio || 1))) {
        this._cancelStart();
      }
    },
    _cancelStart: function _cancelStart() {
      clearTimeout(dragStartTimer);
      for (var i = 0; i < events.end.length; i++) {
        off(this.ownerDocument, events.end[i], this._cancelStart);
      }
      for (var _i2 = 0; _i2 < events.move.length; _i2++) {
        off(this.ownerDocument, events.move[_i2], this._delayMoveHandler);
      }
    },
    _onStart: function _onStart( /** TouchEvent */touch) {
      rootEl = this.el;
      if (touch) {
        on(document, 'touchmove', this._nearestSortable);
      } else {
        on(document, 'mousemove', this._nearestSortable);
      }

      // clear selection
      try {
        if (document.selection) {
          // Timeout neccessary for IE9
          _nextTick(function () {
            document.selection.empty();
          });
        } else {
          window.getSelection().removeAllRanges();
        }
      } catch (error) {}
    },
    _onTrulyStarted: function _onTrulyStarted() {
      if (!moveEvent) {
        this._dispatchEvent('onDrag', _objectSpread2(_objectSpread2({}, _emits()), {}, {
          event: downEvent
        }));
        isMultiple && this.multiplayer.onTrulyStarted(dragEl, this);

        // Init in the move event to prevent conflict with the click event
        var element = isMultiple ? this.multiplayer.getHelper() : dragEl;
        helper.init(from.rect, element, this.el, this.options);
        Sortable.helper = helper.node;

        // Hide the drag element and show the cloned dom element
        visible(dragEl, false);
        dragEl.parentNode.insertBefore(cloneEl, dragEl);
        toggleClass(cloneEl, this.options.chosenClass, true);
        Safari && css(document.body, 'user-select', 'none');
      }
    },
    _nearestSortable: function _nearestSortable( /** Event|TouchEvent */evt) {
      this._preventEvent(evt);
      if (!downEvent || !dragEl || !_positionChanged(evt)) return;
      var _getEvent2 = getEvent(evt),
        event = _getEvent2.event,
        target = _getEvent2.target;
      var nearest = _detectNearestSortable(event.clientX, event.clientY);
      this._onTrulyStarted();
      moveEvent = event;
      helper.move(event.clientX - downEvent.clientX, event.clientY - downEvent.clientY);
      this._autoScroll(target);
      if (nearest) {
        nearest[expando]._onMove(event, target);
      }
    },
    _allowPut: function _allowPut() {
      if (downEvent.sortable.el === this.el) {
        return true;
      } else if (!this.options.group.put) {
        return false;
      } else {
        var name = this.options.group.name;
        var fromGroup = downEvent.sortable.options.group;
        return fromGroup.name && name && fromGroup.name === name;
      }
    },
    _onMove: function _onMove( /** Event|TouchEvent */event, target) {
      if (!this._allowPut()) return;
      this._dispatchEvent('onMove', _objectSpread2(_objectSpread2({}, _emits()), {}, {
        event: event
      }));
      rootEl = this.el;
      dropEl = closest(target, this.options.draggable, rootEl, false);
      if (dropEl) {
        if (dropEl === lastDropEl) return;
        lastDropEl = dropEl;
        if (dropEl === cloneEl) return;
        if (dropEl.animated || containes(dropEl, cloneEl)) return;
      }
      if (rootEl !== from.sortable.el) {
        if (target === rootEl || !lastChild(rootEl, helper.node)) {
          this._onInsert(event, true);
        } else if (dropEl) {
          this._onInsert(event, false);
        }
      } else if (dropEl) {
        this._onChange(event);
      }
    },
    _autoScroll: function _autoScroll(target) {
      var scrollEl = getParentAutoScrollElement(target, true);
      var _this$options3 = this.options,
        autoScroll = _this$options3.autoScroll,
        scrollThreshold = _this$options3.scrollThreshold;
      if (autoScroll) {
        autoScroller.update(scrollEl, scrollThreshold, downEvent, moveEvent);
      }
    },
    _onInsert: function _onInsert( /** Event|TouchEvent */event, insertToLast) {
      var target = insertToLast ? cloneEl : dropEl;
      var parentEl = insertToLast ? rootEl : dropEl.parentNode;
      from.sortable.animator.collect(cloneEl, null, cloneEl.parentNode, cloneEl);
      this.animator.collect(null, target, parentEl, cloneEl);
      isMultiple && this.multiplayer.onChange(cloneEl, this);
      to = {
        sortable: this,
        group: parentEl,
        node: target,
        rect: getRect(target),
        offset: getOffset(target, rootEl)
      };
      from.sortable._dispatchEvent('onRemove', _objectSpread2(_objectSpread2({}, _emits()), {}, {
        event: event
      }));
      if (insertToLast) {
        parentEl.appendChild(cloneEl);
      } else {
        parentEl.insertBefore(cloneEl, dropEl);
      }
      this._dispatchEvent('onAdd', _objectSpread2(_objectSpread2({}, _emits()), {}, {
        event: event
      }));
      from.sortable.animator.animate();
      this.animator.animate();
      from.group = parentEl;
      from.sortable = this;
    },
    _onChange: function _onChange( /** Event|TouchEvent */event) {
      var parentEl = dropEl.parentNode;
      this.animator.collect(cloneEl, dropEl, parentEl);
      isMultiple && this.multiplayer.onChange(cloneEl, this);
      to = {
        sortable: this,
        group: parentEl,
        node: dropEl,
        rect: getRect(dropEl),
        offset: getOffset(dropEl, rootEl)
      };
      this._dispatchEvent('onChange', _objectSpread2(_objectSpread2({}, _emits()), {}, {
        event: event
      }));

      // the top value is compared first, and the left is compared if the top value is the same
      var fromOffset = getOffset(cloneEl, rootEl);
      var nextEl = null;
      if (fromOffset.top === to.offset.top) {
        nextEl = fromOffset.left < to.offset.left ? dropEl.nextSibling : dropEl;
      } else {
        nextEl = fromOffset.top < to.offset.top ? dropEl.nextSibling : dropEl;
      }
      parentEl.insertBefore(cloneEl, nextEl);
      this.animator.animate();
      from.group = parentEl;
      from.sortable = this;
    },
    _onDrop: function _onDrop( /** Event|TouchEvent */evt) {
      this._unbindMoveEvents();
      this._unbindDropEvents();
      this._preventEvent(evt);
      this._cancelStart();
      autoScroller.clear();
      if (dragEl && downEvent && moveEvent) {
        this._onEnd(evt);
      } else if (this.options.multiple) {
        this.multiplayer.select(evt, dragEl, rootEl, _objectSpread2({}, from));
      }
      this._clearState();
    },
    _onEnd: function _onEnd( /** Event|TouchEvent */evt) {
      if (this.options.swapOnDrop) {
        cloneEl.parentNode.insertBefore(dragEl, cloneEl);
      }
      from.group = downEvent.group;
      from.sortable = downEvent.sortable;

      // re-acquire the offset and rect values of the dragged element as the value after the drag is completed
      to.rect = getRect(cloneEl);
      to.offset = getOffset(cloneEl, rootEl);
      if (isMultiple) {
        this.multiplayer.onDrop(evt, dragEl, rootEl, downEvent, _emits);
      } else {
        if (to.node === cloneEl) to.node = dragEl;
        var ctxChanged = sortableChanged(from, to);
        var changed = ctxChanged || offsetChanged(from.offset, to.offset);
        var params = _objectSpread2(_objectSpread2({}, _emits()), {}, {
          changed: changed,
          event: evt
        });
        if (ctxChanged) {
          from.sortable._dispatchEvent('onDrop', params);
        }
        to.sortable._dispatchEvent('onDrop', params);
      }
      visible(dragEl, true);
      cloneEl.parentNode.removeChild(cloneEl);
      Safari && css(document.body, 'user-select', '');
    },
    _preventEvent: function _preventEvent( /** Event|TouchEvent */evt) {
      evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault();
      if (this.options.stopPropagation) {
        if (evt && evt.stopPropagation) {
          evt.stopPropagation();
        } else {
          window.event.cancelBubble = true;
        }
      }
    },
    _dispatchEvent: function _dispatchEvent(emit, params) {
      var callback = this.options[emit];
      if (typeof callback === 'function') callback(params);
    },
    _clearState: function _clearState() {
      dragEl = dropEl = cloneEl = downEvent = moveEvent = isMultiple = lastDropEl = dragStartTimer = Sortable.helper = null;
      lastPosition = {
        x: 0,
        y: 0
      };
      from = to = _objectSpread2({}, FromTo);
      helper.destroy();
    },
    _unbindMoveEvents: function _unbindMoveEvents() {
      for (var i = 0; i < events.move.length; i++) {
        off(document, events.move[i], this._nearestSortable);
      }
    },
    _unbindDropEvents: function _unbindDropEvents() {
      for (var i = 0; i < events.end.length; i++) {
        off(document, events.end[i], this._onDrop);
      }
    }
  };
  Sortable.prototype.utils = {
    on: on,
    off: off,
    css: css,
    closest: closest,
    getRect: getRect,
    getOffset: getOffset
  };

  /**
   * Get the Sortable instance of an element
   * @param  {HTMLElement} element The element
   * @return {Sortable|undefined} The instance of Sortable
   */
  Sortable.get = function (element) {
    return element[expando];
  };

  /**
   * Create sortable instance
   * @param {HTMLElement} el
   * @param {Object} options
   */
  Sortable.create = function (el, options) {
    return new Sortable(el, options);
  };

  return Sortable;

})));

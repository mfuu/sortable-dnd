/*!
 * sortable-dnd v0.7.0
 * open source under the MIT license
 * https://github.com/mfuu/sortable-dnd#readme
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Sortable = factory());
})(this, (function () { 'use strict';

  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function (n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }

  var captureMode = {
    capture: false,
    passive: false
  };
  var R_SPACE = /\s+/g;
  function userAgent(pattern) {
    if (typeof window !== 'undefined' && window.navigator) {
      return !!(/*@__PURE__*/navigator.userAgent.match(pattern));
    }
  }
  var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
  var Edge = userAgent(/Edge/i);
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);

  /**
   * detect passive event support
   */
  var supportPassive = function () {
    var supportPassive = false;
    document.addEventListener('checkIfSupportPassive', null, {
      get passive() {
        supportPassive = true;
        return true;
      }
    });
    return supportPassive;
  }();

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
  function getScrollingElement(el, includeSelf) {
    // skip to window
    if (!el || !el.getBoundingClientRect) {
      return getWindowScrollingElement();
    }
    var elem = el;
    var gotSelf = false;
    do {
      // we don't need to get elem css if it isn't even overflowing in the first place (performance)
      if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
        var elemCSS = css(elem);
        if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == 'auto' || elemCSS.overflowX == 'scroll') || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == 'auto' || elemCSS.overflowY == 'scroll')) {
          if (!elem.getBoundingClientRect || elem === document.body) {
            return getWindowScrollingElement();
          }
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
   * @param  {HTMLElement} el The element whose boundingClientRect is wanted
   * @param  {Boolean} relativeToContainingBlock Whether the rect should be relative to the containing block of (including) the container
   * @param  {HTMLElement} container The parent the element will be placed in
   * @return {Object} The boundingClientRect of el, with specified adjustments
   */
  function getRect(el, relativeToContainingBlock, container) {
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
          var containerRect = container.getBoundingClientRect();

          // Set relative to edges of padding box of container
          top -= containerRect.top + parseInt(css(container, 'border-top-width'));
          left -= containerRect.left + parseInt(css(container, 'border-left-width'));
          bottom = top + elRect.height;
          right = left + elRect.width;
          break;
        }
      } while (container = container.parentNode);
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
   * Finds the closest element that matches a selector.
   */
  function closest(el, selector, ctx, includeCTX) {
    if (!el) return;
    ctx = ctx || document;
    do {
      if (selector != null && (selector[0] === '>' ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
        return el;
      }
      if (el === ctx) break;
    } while (el = el.parentNode);
    return null;
  }

  /**
   * Check if child element is contained in parent element
   */
  function contains(el, parent) {
    if (!el || !parent) return false;
    if (parent.compareDocumentPosition) {
      return !!(parent.compareDocumentPosition(el) & 16);
    }
    if (parent.contains && el.nodeType === 1) {
      return parent.contains(el) && parent !== el;
    }
    while (el = el.parentNode) if (el === parent) return true;
    return false;
  }

  /**
   * Gets the last child in the el, ignoring ghostEl and invisible elements
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
    if (!el || !el.parentNode) {
      return -1;
    }
    var index = 0;
    while (el = el.previousElementSibling) {
      if (el !== Sortable.ghost && el.nodeName.toUpperCase() !== 'TEMPLATE' && css(el, 'display') !== 'none' && (!selector || matches(el, selector))) {
        index++;
      }
    }
    return index;
  }

  /**
   * Gets nth child of el, ignoring hidden children, sortable's elements (does not ignore clone if it's visible) and non-draggable elements
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
  function toggleClass(el, name, isAdd) {
    if (el && name) {
      if (el.classList) {
        el.classList[isAdd ? 'add' : 'remove'](name);
      } else {
        var className = (' ' + el.className + ' ').replace(R_SPACE, ' ').replace(' ' + name + ' ', ' ');
        el.className = (className + (isAdd ? ' ' + name : '')).replace(R_SPACE, ' ');
      }
    }
  }

  /**
   * Check if a DOM element matches a given selector
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
   * get or set css property
   */
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
  function matrix(el, selfOnly) {
    var appliedTransforms = '';
    if (typeof el === 'string') {
      appliedTransforms = el;
    } else {
      do {
        var transform = css(el, 'transform');
        if (transform && transform !== 'none') {
          appliedTransforms = transform + ' ' + appliedTransforms;
        }
      } while (!selfOnly && (el = el.parentNode));
    }
    var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
    return matrixFn && new matrixFn(appliedTransforms);
  }
  function isRectEqual(rect1, rect2) {
    return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
  }
  function repaint(el) {
    return el.offsetWidth;
  }

  /**
   * Compares the position of two DOM nodes.
   */
  function comparePosition(a, b) {
    return a.compareDocumentPosition ? a.compareDocumentPosition(b) : a.contains ? (a != b && a.contains(b) && 16) + (a != b && b.contains(a) && 8) + (a.sourceIndex >= 0 && b.sourceIndex >= 0 ? (a.sourceIndex < b.sourceIndex && 4) + (a.sourceIndex > b.sourceIndex && 2) : 1) : 0;
  }

  /**
   * Sorts the sequence of two elements.
   */
  function sort(before, after) {
    var compareValue = comparePosition(before, after);
    return compareValue === 2 ? 1 : compareValue === 4 ? -1 : 0;
  }
  function preventDefault(evt) {
    evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault();
  }
  function dispatchEvent(_ref) {
    var sortable = _ref.sortable,
      name = _ref.name,
      evt = _ref.evt;
    var callback = sortable.options[name];
    if (typeof callback === 'function') {
      return callback(_extends({}, evt));
    }
  }
  function result(option) {
    if (typeof option === 'function') {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      return option.apply(void 0, args);
    }
    return option;
  }
  var expando = 'Sortable' + Date.now();

  function AutoScroll(options) {
    this.options = options;
    this.scrollEl = null;
    this.autoScrollInterval = null;
  }
  AutoScroll.prototype = {
    nulling: function nulling() {
      if (this.autoScrollInterval) {
        clearInterval(this.autoScrollInterval);
        this.autoScrollInterval = null;
      }
    },
    onStarted: function onStarted() {
      this.nulling();
      this.autoScrollInterval = setInterval(this.autoScroll.bind(this));
    },
    onMove: function onMove(target, moveEvent, el, defaultOptions) {
      var options = el ? el[expando].options : defaultOptions;
      if (el && !options.autoScroll) {
        this.scrollEl = null;
        return;
      }
      this.options = options;
      this.scrollEl = getScrollingElement(target, true);
      this.moveEvent = moveEvent;
    },
    autoScroll: function autoScroll() {
      var options = this.options,
        event = this.moveEvent,
        scrollEl = this.scrollEl,
        scrollThreshold = options.scrollThreshold,
        scrollSpeed = options.scrollSpeed;
      if (!scrollEl || event.clientX === void 0 || event.clientY === void 0) return;
      var rect = getRect(scrollEl);
      if (!rect) return;
      var clientX = event.clientX,
        clientY = event.clientY;
      var top = rect.top,
        right = rect.right,
        bottom = rect.bottom,
        left = rect.left,
        height = rect.height,
        width = rect.width;

      // execute only inside scrolling elements
      if (clientY < top || clientX > right || clientY > bottom || clientX < left) return;
      var scrollTop = scrollEl.scrollTop,
        scrollLeft = scrollEl.scrollLeft,
        scrollHeight = scrollEl.scrollHeight,
        scrollWidth = scrollEl.scrollWidth;
      scrollEl.scrollLeft += this.getScrollOffset(clientX, left, right, scrollThreshold, scrollSpeed.x, scrollLeft, scrollWidth, width);
      scrollEl.scrollTop += this.getScrollOffset(clientY, top, bottom, scrollThreshold, scrollSpeed.y, scrollTop, scrollHeight, height);
    },
    getScrollOffset: function getScrollOffset(mousePos, edgeStart, edgeEnd, threshold, speed, scrollPos, maxScroll, dimension) {
      if (scrollPos > 0 && mousePos >= edgeStart && mousePos <= edgeStart + threshold) {
        return Math.max(-1, (mousePos - edgeStart) / threshold - 1) * speed;
      } else if (scrollPos + dimension < maxScroll && mousePos <= edgeEnd && mousePos >= edgeEnd - threshold) {
        return Math.min(1, (mousePos - edgeEnd) / threshold + 1) * speed;
      }
      return 0;
    }
  };

  function Animation(options) {
    this.options = options;
    this.animationStack = [];
    this.animationCallbackId = null;
  }
  Animation.prototype = {
    collect: function collect(parentEl) {
      if (!parentEl) return;
      var parentRect = getRect(parentEl),
        docWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        docHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
        maxWidth = Math.min(parentRect.right, docWidth),
        maxHeight = Math.min(parentRect.bottom, docHeight),
        children = Array.prototype.slice.call(parentEl.children),
        animations = [];

      // Animate only elements within the visible area
      for (var i = 0, len = children.length; i < len; i++) {
        var el = children[i];
        if (el === Sortable.ghost || css(el, 'display') === 'none') continue;
        var rect = getRect(el);
        if (rect.bottom < 0 || rect.right < 0) continue;

        // buffer front
        if (animations.length === 0 && el.previousElementSibling) {
          var prevEl = el.previousElementSibling;
          do {
            if (prevEl && prevEl !== Sortable.ghost && css(prevEl, 'display') !== 'none') {
              break;
            }
          } while (prevEl = prevEl.previousElementSibling);
          if (prevEl) {
            animations.push({
              el: prevEl,
              rect: getRect(prevEl)
            });
          }
        }

        // buffer behind
        if (rect.top - rect.height > maxHeight || rect.left - rect.width > maxWidth) {
          animations.push({
            el: el,
            rect: rect
          });
          break;
        }
        animations.push({
          el: el,
          rect: rect
        });
      }
      this.animationStack.push(animations);
    },
    animate: function animate(callback) {
      var _this = this;
      var animations = this.animationStack.pop(),
        animation = this.options.animation;
      if (!animations || !animation) {
        clearTimeout(this.animationCallbackId);
        typeof callback === 'function' && callback();
        return;
      }
      var maxAnimationTime = 0;
      animations.forEach(function (item) {
        var duration = 0,
          el = item.el,
          toRect = getRect(el),
          fromRect = item.rect,
          prevToRect = el.prevToRect,
          prevFromRect = el.prevFromRect;

        // if element is animating, try to calculate the remaining duration
        if (el.animating && prevFromRect && prevToRect && isRectEqual(fromRect, toRect)) {
          var elMatrix = matrix(el, true);
          if (elMatrix) {
            var remainingRect = {
              top: toRect.top - elMatrix.f,
              left: toRect.left - elMatrix.e
            };
            var remainingDistance = calculateDistance(remainingRect, toRect);
            var distance = calculateDistance(prevFromRect, prevToRect);
            duration = remainingDistance / distance * animation;
          }
        }
        if (!isRectEqual(fromRect, toRect)) {
          el.prevFromRect = fromRect;
          el.prevToRect = toRect;
          if (!duration) {
            duration = animation;
          }
          _this.execute(el, fromRect, toRect, duration);
        }
        if (duration) {
          maxAnimationTime = Math.max(maxAnimationTime, duration);
        }
      });
      clearTimeout(this.animationCallbackId);
      if (maxAnimationTime) {
        this.animationCallbackId = setTimeout(function () {
          typeof callback === 'function' && callback();
        }, maxAnimationTime);
      } else {
        typeof callback === 'function' && callback();
      }
    },
    execute: function execute(el, fromRect, toRect, duration) {
      var easing = this.options.easing || '',
        dx = fromRect.left - toRect.left,
        dy = fromRect.top - toRect.top;
      css(el, 'transition', '');
      css(el, 'transform', "translate3d(".concat(dx, "px, ").concat(dy, "px, 0)"));
      this.repaintDummy = repaint(el);
      css(el, 'transition', "transform ".concat(duration, "ms ").concat(easing));
      css(el, 'transform', 'translate3d(0px, 0px, 0px)');
      typeof el.animating === 'number' && clearTimeout(el.animating);
      el.animating = setTimeout(function () {
        css(el, 'transition', '');
        css(el, 'transform', '');
        el.prevFromRect = null;
        el.prevToRect = null;
        el.animating = null;
      }, duration);
    }
  };
  function calculateDistance(fromRect, toRect) {
    return Math.sqrt(Math.pow(fromRect.left - toRect.left, 2) + Math.pow(fromRect.top - toRect.top, 2));
  }

  var sortables = [];
  var toEl, fromEl, dragEl, dropEl, nextEl, startEl, cloneEl, ghostEl, targetEl, parentEl, pullMode, oldIndex, newIndex, startIndex, dragEvent, moveEvent, lastDropEl, listenerEl, cloneEvent, cloneTarget, lastHoverArea;
  function _prepareGroup(options) {
    var _originalGroup$pull, _originalGroup$put, _originalGroup$revert;
    var group = {};
    var originalGroup = options.group;
    if (!originalGroup || _typeof(originalGroup) !== 'object') {
      originalGroup = {
        name: originalGroup,
        pull: true,
        put: true,
        revertDrag: true
      };
    }
    group.name = originalGroup.name;
    group.pull = (_originalGroup$pull = originalGroup.pull) !== null && _originalGroup$pull !== void 0 ? _originalGroup$pull : true;
    group.put = (_originalGroup$put = originalGroup.put) !== null && _originalGroup$put !== void 0 ? _originalGroup$put : true;
    group.revertDrag = (_originalGroup$revert = originalGroup.revertDrag) !== null && _originalGroup$revert !== void 0 ? _originalGroup$revert : true;
    options.group = group;
  }

  /**
   * Detects nearest empty sortable to X and Y position using emptyInsertThreshold.
   */
  function _detectNearestSortable(x, y) {
    var nearestRect;
    return sortables.reduce(function (result, element) {
      var threshold = element[expando].options.emptyInsertThreshold;
      if (threshold == void 0) return;
      var rect = getRect(element),
        insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
        insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
      if (insideHorizontally && insideVertically && (!nearestRect || nearestRect && rect.left >= nearestRect.left && rect.right <= nearestRect.right && rect.top >= nearestRect.top && rect.bottom <= nearestRect.bottom)) {
        result = element;
        nearestRect = rect;
      }
      return result;
    }, null);
  }
  function _mouseMoved(evt) {
    var lastEvent = moveEvent || dragEvent;
    return !(evt.clientX !== void 0 && evt.clientY !== void 0 && Math.abs(evt.clientX - lastEvent.clientX) <= 0 && Math.abs(evt.clientY - lastEvent.clientY) <= 0);
  }

  /**
   * @class Sortable
   */
  function Sortable(el, options) {
    if (!(el && el.nodeType && el.nodeType === 1)) {
      throw "Sortable-dnd: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
    }
    el[expando] = this;
    this.el = el;
    this.options = options = _extends({}, options);
    var defaults = {
      store: null,
      group: '',
      handle: null,
      draggable: '>*',
      sortable: true,
      disabled: false,
      customGhost: null,
      lockAxis: '',
      direction: '',
      animation: 150,
      easing: '',
      ghostClass: '',
      ghostStyle: {},
      chosenClass: '',
      placeholderClass: '',
      autoScroll: true,
      scrollThreshold: 55,
      scrollSpeed: {
        x: 10,
        y: 10
      },
      delay: 0,
      delayOnTouchOnly: false,
      swapOnDrop: true,
      removeCloneOnDrop: true,
      dropOnAnimationEnd: false,
      appendToBody: false,
      supportTouch: 'ontouchstart' in window,
      touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
      emptyInsertThreshold: -1
    };

    // Set default options
    for (var name in defaults) {
      !(name in options) && (options[name] = defaults[name]);
    }
    _prepareGroup(options);

    // Bind all private methods
    for (var fn in this) {
      if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
        this[fn] = this[fn].bind(this);
      }
    }
    on(el, options.supportTouch ? 'touchstart' : 'mousedown', this._onDrag);
    this.autoScroller = new AutoScroll(options);
    this.animator = new Animation(options);
    sortables.push(el);
  }
  Sortable.prototype = {
    constructor: Sortable,
    _onDrag: function _onDrag(event) {
      var _this = this;
      var el = this.el,
        options = this.options,
        handle = options.handle,
        touch = event.touches && event.touches[0],
        target = (touch || event).target,
        ownerDocument = el.ownerDocument;

      // Don't trigger start event when an element is been dragged
      if (dragEl || options.disabled || !options.group.pull) return;

      // only left button and enabled
      if (/mousedown|pointerdown/.test(event.type) && event.button !== 0) return;

      // Safari ignores further event handling after mousedown
      if (Safari && target && target.tagName.toUpperCase() === 'SELECT') return;
      var element = closest(target, options.draggable, el);

      // No dragging is allowed when there is no dragging element
      if (!element || element.animating) return;
      dragEvent = {
        event: event,
        clientX: (touch || event).clientX,
        clientY: (touch || event).clientY
      };
      dragEl = element;
      listenerEl = touch ? dragEl : document;
      on(listenerEl, 'mouseup', this._onDrop);
      on(listenerEl, 'touchend', this._onDrop);
      on(listenerEl, 'touchcancel', this._onDrop);

      // handle dragging detection
      if (typeof handle === 'function' && !handle(event) || typeof handle === 'string' && !closest(target, handle, dragEl)) {
        return;
      }

      // Delay is impossible for native DnD in Edge or IE
      if (options.delay && (!options.delayOnTouchOnly || touch) && !(Edge || IE11OrLess)) {
        on(ownerDocument, 'touchmove', this._delayedMoveHandler);
        on(ownerDocument, 'mousemove', this._delayedMoveHandler);
        on(ownerDocument, 'mouseup', this._cancelStart);
        on(ownerDocument, 'touchend', this._cancelStart);
        on(ownerDocument, 'touchcancel', this._cancelStart);
        this._dragStartTimer = setTimeout(function () {
          return _this._onStart(touch, event);
        }, options.delay);
      } else {
        this._onStart(touch, event);
      }
    },
    _delayedMoveHandler: function _delayedMoveHandler(event) {
      var evt = event.touches ? event.touches[0] : event;
      if (Math.max(Math.abs(evt.clientX - dragEvent.clientX), Math.abs(evt.clientY - dragEvent.clientY)) >= Math.floor(this.options.touchStartThreshold / (window.devicePixelRatio || 1))) {
        this._cancelStart();
      }
    },
    _cancelStart: function _cancelStart() {
      var ownerDocument = this.el.ownerDocument;
      clearTimeout(this._dragStartTimer);
      off(ownerDocument, 'touchmove', this._delayedMoveHandler);
      off(ownerDocument, 'mousemove', this._delayedMoveHandler);
      off(ownerDocument, 'mouseup', this._cancelStart);
      off(ownerDocument, 'touchend', this._cancelStart);
      off(ownerDocument, 'touchcancel', this._cancelStart);
    },
    _onStart: function _onStart(touch, event) {
      preventDefault(event);
      var el = this.el,
        options = this.options,
        dragIndex = index(dragEl);
      oldIndex = dragIndex;
      newIndex = dragIndex;
      startIndex = dragIndex;
      toEl = el;
      fromEl = el;
      startEl = el;
      targetEl = dragEl;
      parentEl = dragEl.parentNode;
      pullMode = options.group.pull;
      cloneTarget = dragEl;
      cloneEvent = {
        to: el,
        target: dragEl,
        newIndex: dragIndex,
        relative: 0
      };
      cloneEl = dragEl.cloneNode(true);
      Sortable.dragged = dragEl;
      Sortable.clone = cloneEl;
      Sortable.active = this;
      dispatchEvent({
        sortable: this,
        name: 'onChoose',
        evt: this._getEventProperties(event)
      });
      toggleClass(dragEl, options.chosenClass, true);
      on(listenerEl, touch ? 'touchmove' : 'mousemove', this._nearestSortable);

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

      // Do not allow text to be selected when draggable
      on(document, 'selectstart', preventDefault);
      Safari && css(document.body, 'user-select', 'none');
    },
    _onStarted: function _onStarted() {
      var options = this.options;
      this.animator.collect(parentEl);
      this._appendGhost();
      toggleClass(cloneEl, options.chosenClass, true);
      toggleClass(cloneEl, options.placeholderClass, true);
      dragEl.parentNode.insertBefore(cloneEl, dragEl);
      css(dragEl, 'display', 'none');
      dispatchEvent({
        sortable: this,
        name: 'onDrag',
        evt: this._getEventProperties(dragEvent.event)
      });
      this.animator.animate();
      this.autoScroller.onStarted();
    },
    _appendGhost: function _appendGhost() {
      if (ghostEl) return;
      var options = this.options;
      var container = options.appendToBody ? document.body : this.el;
      var element = result(options.customGhost, cloneEl) || cloneEl;
      ghostEl = element.cloneNode(true);
      toggleClass(ghostEl, options.ghostClass, true);
      var rect = getRect(dragEl);
      var style = _extends({
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        margin: 0,
        zIndex: 100000,
        opacity: '0.8',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transform: '',
        transition: '',
        pointerEvents: 'none'
      }, options.ghostStyle);
      for (var key in style) {
        css(ghostEl, key, style[key]);
      }
      Sortable.ghost = ghostEl;
      container.appendChild(ghostEl);
      var ox = (dragEvent.clientX - rect.left) / parseInt(ghostEl.style.width) * 100;
      var oy = (dragEvent.clientY - rect.top) / parseInt(ghostEl.style.height) * 100;
      css(ghostEl, 'transform-origin', "".concat(ox, "% ").concat(oy, "%"));
      css(ghostEl, 'will-change', 'transform');
    },
    _nearestSortable: function _nearestSortable(event) {
      preventDefault(event);
      var touch = event.touches && event.touches[0],
        evt = touch || event;
      if (!dragEl || !_mouseMoved(evt)) return;

      // init in the move event to prevent conflict with the click event
      !moveEvent && this._onStarted();
      var lockAxis = this.options.lockAxis,
        clientX = lockAxis === 'x' ? dragEvent.clientX : evt.clientX,
        clientY = lockAxis === 'y' ? dragEvent.clientY : evt.clientY,
        target = document.elementFromPoint(clientX, clientY),
        dx = clientX - dragEvent.clientX,
        dy = clientY - dragEvent.clientY;
      moveEvent = {
        event: event,
        clientX: clientX,
        clientY: clientY
      };
      css(ghostEl, 'transform', "translate3d(".concat(dx, "px, ").concat(dy, "px, 0)"));
      var nearest = _detectNearestSortable(clientX, clientY);
      nearest && nearest[expando]._onMove(event, target);
      this.autoScroller.onMove(target, moveEvent, nearest, this.options);
    },
    _allowPut: function _allowPut() {
      var group = this.options.group,
        startGroup = startEl[expando].options.group;
      if (this.el === startEl) return true;
      if (!group.put) return false;
      return group.put.join && group.put.indexOf(startGroup.name) > -1 || startGroup.name && group.name && startGroup.name === group.name;
    },
    _getDirection: function _getDirection() {
      var draggable = this.options.draggable,
        direction = this.options.direction;
      return direction ? result(direction, moveEvent.event, cloneEl, this) : detectDirection(parentEl, draggable);
    },
    _allowSwap: function _allowSwap() {
      var rect = getRect(dropEl),
        vertical = this._getDirection() === 'vertical',
        front = vertical ? 'top' : 'left',
        behind = vertical ? 'bottom' : 'right',
        dropElSize = dropEl[vertical ? 'offsetHeight' : 'offsetWidth'],
        mouseAxis = vertical ? moveEvent.clientY : moveEvent.clientX,
        hoverArea = mouseAxis >= rect[front] && mouseAxis < rect[behind] - dropElSize / 2 ? -1 : 1,
        childf = getChild(parentEl, 0, this.options.draggable),
        childl = lastChild(parentEl),
        childfRect = getRect(childf),
        childlRect = getRect(childl);
      if (dropEl === parentEl || contains(parentEl, dropEl)) {
        // The dragged element is the first child of its parent
        if (cloneEl === childf && mouseAxis < childfRect[front]) {
          nextEl = dropEl;
          return true;
        }

        // The dragged element is the last child of its parent
        if (cloneEl === childl && mouseAxis > childlRect[behind]) {
          nextEl = dropEl.nextSibling;
          return true;
        }
        return false;
      }
      var order = sort(cloneEl, dropEl);
      nextEl = order < 0 ? dropEl.nextSibling : dropEl;

      // swap if new drop element
      if (lastDropEl !== dropEl) {
        lastHoverArea = hoverArea;
        return true;
      }

      // swap if changed hover area
      if (lastHoverArea !== hoverArea) {
        lastHoverArea = hoverArea;
        return hoverArea < 0 ? order > 0 : order < 0;
      }
      return false;
    },
    _onMove: function _onMove(event, target) {
      var el = this.el,
        options = this.options;
      if (options.disabled || !this._allowPut()) return;
      dropEl = closest(target, options.draggable, el);
      dispatchEvent({
        sortable: this,
        name: 'onMove',
        evt: this._getEventProperties(event, {
          target: dropEl
        })
      });

      // dragEl is allowed to return to the original list in `sortable: false`
      if (!options.sortable && el === startEl) {
        if (fromEl !== startEl) {
          dropEl = lastDropEl = dragEl;
          lastHoverArea = 0;
          this._onInsert(event);
        }
        return;
      }

      // insert to last
      if (el !== fromEl && (target === el || !lastChild(el))) {
        dropEl = lastDropEl = null;
        this._onInsert(event);
        return;
      }
      if (!dropEl || dropEl.animating || contains(dropEl, cloneEl) || !this._allowSwap()) return;
      if (dropEl === cloneEl || nextEl === cloneEl) {
        lastDropEl = dropEl;
        return;
      }
      if (el !== fromEl) {
        this._onInsert(event);
      } else if (dropEl !== dragEl) {
        this._onChange(event);
      }
      lastDropEl = dropEl;
    },
    _onInsert: function _onInsert(event) {
      var el = this.el,
        target = dropEl || cloneEl,
        cloneToOther = pullMode === 'clone' && el !== startEl && fromEl === startEl,
        cloneToStart = pullMode === 'clone' && el === startEl && fromEl !== startEl,
        dropElExist = contains(dropEl, document),
        hideCloneEl = dropEl === dragEl && !dropElExist,
        fromSortable = fromEl[expando],
        startSortable = startEl[expando];
      toEl = el;
      oldIndex = index(cloneEl);
      targetEl = target;
      parentEl = dropElExist ? dropEl.parentNode : el;
      fromSortable.animator.collect(cloneEl.parentNode);
      this.animator.collect(parentEl);
      if (cloneToOther) {
        cloneEvent.target = cloneTarget;
        cloneEvent.newIndex = oldIndex;
        cloneEvent.relative = cloneTarget === dragEl ? 0 : sort(cloneEl, cloneTarget);

        // show dragEl before clone to another list
        css(dragEl, 'display', '');
        if (!startSortable.options.group.revertDrag) {
          cloneEl.parentNode.insertBefore(dragEl, cloneEl);
        }
      }
      if (cloneToStart) {
        oldIndex = index(dragEl);

        // hide dragEl when returning to the original list
        css(dragEl, 'display', 'none');
      }
      css(cloneEl, 'display', hideCloneEl ? 'none' : '');
      if (dropEl && dropElExist) {
        parentEl.insertBefore(cloneEl, lastHoverArea < 0 ? dropEl : dropEl.nextSibling);
      } else {
        parentEl.appendChild(cloneEl);
      }
      newIndex = hideCloneEl ? startIndex : index(cloneEl);
      if (cloneToOther && startSortable.options.group.revertDrag) {
        cloneEvent.target = dragEl;
        cloneEvent.newIndex = startIndex;
        cloneEvent.relative = 0;
        dispatchEvent({
          sortable: startSortable,
          name: 'onChange',
          evt: this._getEventProperties(event, {
            to: startEl,
            target: dragEl,
            newIndex: startIndex,
            revertDrag: true
          })
        });
      }
      if (!cloneToOther) {
        dispatchEvent({
          sortable: fromSortable,
          name: 'onRemove',
          evt: this._getEventProperties(event, {
            newIndex: -1
          })
        });
      }
      if (cloneToStart && target !== dragEl) {
        cloneTarget = target;
        dispatchEvent({
          sortable: this,
          name: 'onChange',
          evt: this._getEventProperties(event, {
            from: startEl,
            backToOrigin: true
          })
        });
      }
      if (!cloneToStart) {
        dispatchEvent({
          sortable: this,
          name: 'onAdd',
          evt: this._getEventProperties(event, {
            oldIndex: -1
          })
        });
      }
      fromSortable.animator.animate();
      this.animator.animate();
      fromEl = el;
    },
    _onChange: function _onChange(event) {
      var el = this.el;
      this.animator.collect(parentEl);
      oldIndex = index(cloneEl);
      parentEl = dropEl.parentNode;
      targetEl = dropEl;
      if (el === startEl) {
        cloneTarget = dropEl;
      }
      parentEl.insertBefore(cloneEl, nextEl);
      newIndex = index(cloneEl);
      dispatchEvent({
        sortable: this,
        name: 'onChange',
        evt: this._getEventProperties(event)
      });
      this.animator.animate();
      fromEl = el;
    },
    _onDrop: function _onDrop(event) {
      var _this2 = this;
      var options = this.options;
      this._cancelStart();
      off(listenerEl, 'touchmove', this._nearestSortable);
      off(listenerEl, 'mousemove', this._nearestSortable);
      off(listenerEl, 'mouseup', this._onDrop);
      off(listenerEl, 'touchend', this._onDrop);
      off(listenerEl, 'touchcancel', this._onDrop);
      off(document, 'selectstart', preventDefault);
      Safari && css(document.body, 'user-select', '');
      ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
      if (startEl) {
        fromEl = startEl;
        oldIndex = startIndex;
        if (targetEl === cloneEl) {
          targetEl = dragEl;
        }
        toggleClass(dragEl, options.chosenClass, false);
        dispatchEvent({
          sortable: this,
          name: 'onUnchoose',
          evt: this._getEventProperties(event)
        });
        if (moveEvent) {
          this.animator.collect(parentEl);
          toggleClass(cloneEl, options.chosenClass, false);
          toggleClass(cloneEl, options.placeholderClass, false);
          var evt = this._getEventProperties(event);
          !options.dropOnAnimationEnd && this._onEnd(evt);
          this.animator.animate(function () {
            options.dropOnAnimationEnd && _this2._onEnd(evt);
          });
        } else {
          this._nulling();
        }
      } else {
        this._nulling();
      }
    },
    _onEnd: function _onEnd(evt) {
      var options = this.options,
        isClone = pullMode === 'clone',
        isSameEl = fromEl === toEl;

      // swap real drag element to the current drop position
      if ((!isClone || isSameEl) && result(options.swapOnDrop, evt)) {
        parentEl.insertBefore(dragEl, cloneEl);
      }
      if ((!isClone || isSameEl) && result(options.removeCloneOnDrop, evt)) {
        cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
      }
      css(dragEl, 'display', '');
      if (fromEl !== toEl) {
        dispatchEvent({
          sortable: fromEl[expando],
          name: 'onDrop',
          evt: _extends({}, evt, isClone ? cloneEvent : {
            newIndex: -1
          })
        });
      }
      dispatchEvent({
        sortable: toEl[expando],
        name: 'onDrop',
        evt: _extends({}, evt, isSameEl ? {} : {
          oldIndex: -1
        })
      });
      this._nulling();
    },
    _getEventProperties: function _getEventProperties(originalEvent) {
      var extra = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var evt = {};
      evt.event = originalEvent;
      evt.to = toEl;
      evt.from = fromEl;
      evt.node = dragEl;
      evt.clone = cloneEl;
      evt.target = targetEl;
      evt.oldIndex = oldIndex;
      evt.newIndex = newIndex;
      evt.pullMode = pullMode;
      _extends(evt, extra);
      evt.relative = targetEl === dragEl ? 0 : sort(cloneEl, targetEl);
      return evt;
    },
    _nulling: function _nulling() {
      toEl = fromEl = dragEl = dropEl = nextEl = startEl = cloneEl = ghostEl = targetEl = parentEl = pullMode = oldIndex = newIndex = startIndex = dragEvent = moveEvent = lastDropEl = listenerEl = cloneEvent = cloneTarget = lastHoverArea = Sortable.clone = Sortable.ghost = Sortable.active = Sortable.dragged = null;
      this.autoScroller.nulling();
    },
    destroy: function destroy() {
      this._cancelStart();
      this._nulling();
      off(this.el, 'touchstart', this._onDrag);
      off(this.el, 'mousedown', this._onDrag);
      var index = sortables.indexOf(this.el);
      index > -1 && sortables.splice(index, 1);
      this.el[expando] = this.animator = this.autoScroller = null;
    },
    option: function option(key, value) {
      if (value === void 0) {
        return this.options[key];
      }

      // set option
      this.options[key] = value;
      this.animator.options[key] = value;
      this.autoScroller.options[key] = value;
      if (key === 'group') {
        _prepareGroup(this.options);
      }
    }
  };
  Sortable.utils = {
    on: on,
    off: off,
    css: css,
    index: index,
    matches: matches,
    closest: closest,
    getRect: getRect,
    toggleClass: toggleClass,
    detectDirection: detectDirection
  };
  Sortable.get = function (element) {
    return element[expando];
  };
  Sortable.create = function (el, options) {
    return new Sortable(el, options);
  };

  return Sortable;

}));

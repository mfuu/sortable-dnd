/*!
 * sortable-dnd v0.4.2
 * open source under the MIT license
 * https://github.com/mfuu/sortable-dnd#readme
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Sortable = factory());
})(this, (function () { 'use strict';

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

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
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

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var captureMode = {
    capture: false,
    passive: false
  };
  var R_SPACE = /\s+/g;
  var SUPPORT_PASSIVE = supportPassive();

  function userAgent(pattern) {
    if (typeof window !== 'undefined' && window.navigator) {
      return !! /*@__PURE__*/navigator.userAgent.match(pattern);
    }
  }

  var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
  var Edge = userAgent(/Edge/i);
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
  var vendorPrefix = function () {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // Server environment
      return '';
    } // window.getComputedStyle() returns null inside an iframe with display: none
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

  function isHTMLElement(obj) {
    if (!obj) return false;
    var d = document.createElement('div');

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

  function setTransition(el, transition) {
    el.style["".concat(vendorPrefix, "Transition")] = transition ? transition === 'none' ? 'none' : "".concat(transition) : '';
  }
  /**
   * set transform style
   * @param {HTMLElement} el
   * @param {String} transform
   */

  function setTransform(el, transform) {
    el.style["".concat(vendorPrefix, "Transform")] = transform ? "".concat(transform) : '';
  }
  /**
   * get touch event and current event
   * @param {Event} evt
   */

  function getEvent(evt) {
    var touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === 'touch' && evt;
    var e = touch || evt;
    var target = touch ? document.elementFromPoint(e.clientX, e.clientY) : e.target;
    return {
      touch: touch,
      e: e,
      target: target
    };
  }
  /**
   * detect passive event support
   */

  function supportPassive() {
    // https://github.com/Modernizr/Modernizr/issues/1894
    var supportPassive = false;
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

  function on(el, event, fn) {
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

  function off(el, event, fn) {
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

  function getOffset(el) {
    var result = {
      top: 0,
      left: 0,
      height: 0,
      width: 0
    };
    result.height = el.offsetHeight;
    result.width = el.offsetWidth;
    result.top = el.offsetTop;
    result.left = el.offsetLeft;
    var parent = el.offsetParent;

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

  function getIndex(group, el) {
    if (!el || !el.parentNode) return -1;

    var children = _toConsumableArray(Array.from(group.children));

    return children.indexOf(el);
  }
  function setRect(el, rect) {
    css(el, 'position', 'absolute');
    css(el, 'top', rect.top);
    css(el, 'left', rect.left);
  }
  function unsetRect(el) {
    css(el, 'display', '');
    css(el, 'position', '');
    css(el, 'top', '');
    css(el, 'left', '');
  }
  function getMouseRect(event) {
    if (event.pageX || event.pageY) {
      return {
        top: event.pageY,
        left: event.pageX
      };
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
      container = container || el.parentNode; // Not needed on <= IE11

      if (!IE11OrLess) {
        do {
          if (container && container.getBoundingClientRect && (css(container, 'transform') !== 'none' || check.relative && css(container, 'position') !== 'static')) {
            var containerRect = container.getBoundingClientRect(); // Set relative to edges of padding box of container

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
  /**
   * get target Element in group
   * @param {HTMLElement} group
   * @param {HTMLElement} el
   * @param {Boolean} onlyEl only get element
   */

  function getElement(group, el, onlyEl) {
    var children = _toConsumableArray(Array.from(group.children)); // If it can be found directly in the child element, return


    var index = children.indexOf(el);
    if (index > -1) return onlyEl ? children[index] : {
      index: index,
      el: children[index],
      rect: getRect(children[index]),
      offset: getOffset(children[index])
    }; // When the dom cannot be found directly in children, need to look down

    for (var i = 0; i < children.length; i++) {
      if (isChildOf(el, children[i])) {
        return onlyEl ? children[i] : {
          index: i,
          el: children[i],
          rect: getRect(children[i]),
          offset: getOffset(children[i])
        };
      }
    }

    return onlyEl ? null : {
      index: -1,
      el: null,
      rect: {},
      offset: {}
    };
  }
  /**
   * Check if child element is contained in parent element
   * @param {HTMLElement} child
   * @param {HTMLElement} parent
   * @returns {Boolean} true | false
   */

  function isChildOf(child, parent) {
    var parentNode;

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

  function lastChild(el, selector) {
    var last = el.lastElementChild;

    while (last && (last === Sortable.ghost || css(last, 'display') === 'none' || selector && !matches(last, selector))) {
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
   * @param {HTMLElement} el
   * @param {String} selector
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
  function _nextTick(fn) {
    return setTimeout(fn, 0);
  }
  var expando = 'Sortable' + Date.now();

  var AutoScroll = /*#__PURE__*/function () {
    function AutoScroll() {
      _classCallCheck(this, AutoScroll);

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

      this.timer = null;
    }

    _createClass(AutoScroll, [{
      key: "clear",
      value: function clear() {
        if (this.timer == null) {
          return;
        }

        clearTimeout(this.timer);
        this.timer = null;
      }
    }, {
      key: "update",
      value: function update(Sortable, eventState) {
        var _this = this;

        if (!Sortable.scrollEl) return; // check if is moving now

        if (!(eventState.down && eventState.move)) return;
        var _eventState$move = eventState.move,
            clientX = _eventState$move.clientX,
            clientY = _eventState$move.clientY;
        if (clientX === void 0 || clientY === void 0) return;
        var rect = getRect(Sortable.scrollEl);
        if (!rect) return;
        var _Sortable$scrollEl = Sortable.scrollEl,
            scrollTop = _Sortable$scrollEl.scrollTop,
            scrollLeft = _Sortable$scrollEl.scrollLeft,
            scrollHeight = _Sortable$scrollEl.scrollHeight,
            scrollWidth = _Sortable$scrollEl.scrollWidth;
            _Sortable$scrollEl.clientHeight;
            _Sortable$scrollEl.clientWidth;
        var top = rect.top,
            right = rect.right,
            bottom = rect.bottom,
            left = rect.left,
            height = rect.height,
            width = rect.width;
        var scrollThreshold = Sortable.options.scrollThreshold; // check direction

        var totop = scrollTop > 0 && clientY >= top && clientY <= top + scrollThreshold;
        var toleft = scrollLeft > 0 && clientX >= left && clientX <= left + scrollThreshold;
        var toright = scrollLeft + width < scrollWidth && clientX <= right && clientX >= right - scrollThreshold;
        var tobottom = scrollTop + height < scrollHeight && clientY <= bottom && clientY >= bottom - scrollThreshold;
        var scrollx = 0,
            scrolly = 0;

        if (toleft) {
          scrollx = Math.floor(Math.max(-1, (clientX - left) / scrollThreshold - 1) * 10);
        } else if (toright) {
          scrollx = Math.ceil(Math.min(1, (clientX - right) / scrollThreshold + 1) * 10);
        } else {
          scrollx = 0;
        }

        if (totop) {
          scrolly = Math.floor(Math.max(-1, (clientY - top) / scrollThreshold - 1) * 10);
        } else if (tobottom) {
          scrolly = Math.ceil(Math.min(1, (clientY - bottom) / scrollThreshold + 1) * 10);
        } else {
          scrolly = 0;
        }

        clearTimeout(this.timer);
        this.timer = setTimeout(function () {
          if (scrolly) {
            _this.scrollY(Sortable.scrollEl, scrolly);
          }

          if (scrollx) {
            _this.scrollX(Sortable.scrollEl, scrollx);
          }
        });
      }
    }, {
      key: "scrollX",
      value: function scrollX(el, amount) {
        if (el === window) {
          window.scrollTo(el.pageXOffset + amount, el.pageYOffset);
        } else {
          el.scrollLeft += amount;
        }
      }
    }, {
      key: "scrollY",
      value: function scrollY(el, amount) {
        if (el === window) {
          window.scrollTo(el.pageXOffset, el.pageYOffset + amount);
        } else {
          el.scrollTop += amount;
        }
      }
    }]);

    return AutoScroll;
  }();

  function Animation() {
    var animationState = [];

    function getRange(children, drag, drop) {
      var start = children.indexOf(drag);
      var end = children.indexOf(drop);
      return start < end ? {
        start: start,
        end: end
      } : {
        start: end,
        end: start
      };
    }

    return {
      _captureAnimationState: function _captureAnimationState(dragEl, dropEl) {
        var children = _toConsumableArray(Array.from(this.el.children));

        var _getRange = getRange(children, dragEl, dropEl),
            start = _getRange.start,
            end = _getRange.end;

        animationState.length = 0; // reset

        if (start < 0) {
          start = end;
          end = Math.min(children.length - 1, 100);
        }

        if (end < 0) end = Math.min(children.length - 1, 100);
        children.slice(start, end + 1).forEach(function (child) {
          animationState.push({
            target: child,
            rect: getRect(child)
          });
        });
      },
      _animate: function _animate() {
        var _this = this;

        animationState.forEach(function (state) {
          var target = state.target,
              rect = state.rect;

          _this._excuteAnimation(target, rect, _this.options.animation);
        });
      },
      _excuteAnimation: function _excuteAnimation(el, preRect) {
        var animation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 150;
        var curRect = getRect(el);
        var left = preRect.left - curRect.left;
        var top = preRect.top - curRect.top;
        setTransition(el, 'none');
        setTransform(el, "translate3d(".concat(left, "px, ").concat(top, "px, 0)"));
        el.offsetWidth; // trigger repaint

        setTransition(el, "".concat(animation, "ms"));
        setTransform(el, 'translate3d(0px, 0px, 0px)');
        clearTimeout(el.animated);
        el.animated = setTimeout(function () {
          setTransition(el, '');
          setTransform(el, '');
          el.animated = null;
        }, animation);
      }
    };
  }

  var MultiFromTo = {
    sortable: null,
    group: null,
    nodes: []
  };
  /**
   * Difference before and after dragging
   */

  var MultiDifference = /*#__PURE__*/function () {
    function MultiDifference() {
      _classCallCheck(this, MultiDifference);

      this.from = _objectSpread2({}, MultiFromTo);
      this.to = _objectSpread2({}, MultiFromTo);
    }

    _createClass(MultiDifference, [{
      key: "destroy",
      value: function destroy() {
        this.from = _objectSpread2({}, MultiFromTo);
        this.to = _objectSpread2({}, MultiFromTo);
      }
    }]);

    return MultiDifference;
  }();

  var selectedElements = [];
  var multiDiffer = new MultiDifference();

  var _emitMultiDiffer = function _emitMultiDiffer() {
    return {
      from: _objectSpread2({}, multiDiffer.from),
      to: _objectSpread2({}, multiDiffer.to)
    };
  };

  var _offsetChanged = function _offsetChanged(ns1, ns2) {
    return !!ns1.find(function (node) {
      var n = ns2.find(function (n) {
        return n.node === node.node;
      });
      return offsetChanged(n.offset, node.offset);
    });
  };

  function Multiple() {
    return {
      _setMultiElements: function _setMultiElements(event, group) {
        var _this = this;

        if (!this.options.multiple) return;
        var target;
        var draggable = this.options.draggable;

        if (typeof draggable === 'function') {
          var element = draggable(event);
          if (!element) return;
          if (isHTMLElement(element)) target = element;
        }

        if (!target) target = getElement(this.el, event.target, true);
        if (!target) return;
        toggleClass(target, this.options.selectedClass, !~selectedElements.indexOf(target));
        var params = {
          sortable: this,
          group: group,
          target: target,
          event: event,
          originalEvent: event
        };

        if (!~selectedElements.indexOf(target)) {
          selectedElements.push(target);

          this._dispatchEvent('onSelect', params);
        } else {
          selectedElements.splice(selectedElements.indexOf(target), 1);

          this._dispatchEvent('onDeselect', params);
        } // get each node's index in group


        selectedElements.forEach(function (node) {
          node.sortableIndex = getIndex(_this.el, node);
        }); // sort

        selectedElements.sort(function (a, b) {
          return a.sortableIndex - b.sortableIndex;
        });
      },
      _allowMultiDrag: function _allowMultiDrag(dragEl) {
        return this.options.multiple && selectedElements.length && selectedElements.includes(dragEl);
      },
      _getMultiGhostElement: function _getMultiGhostElement() {
        var ghost = document.createElement('div');
        selectedElements.forEach(function (node, index) {
          var clone = node.cloneNode(true);
          var pos = index * 4 + 4;
          var opacity = index === 0 ? 1 : 0.5;
          clone.style = "opacity: ".concat(opacity, ";position: absolute;z-index: ").concat(index, ";bottom: -").concat(pos, "px;right: -").concat(pos, "px;width: 100%;height: 100%;");
          ghost.appendChild(clone);
        });
        return ghost;
      },
      _setMultiDiffer: function _setMultiDiffer(key) {
        multiDiffer[key] = {
          sortable: this,
          group: this.el,
          nodes: selectedElements.map(function (node) {
            return {
              node: node,
              rect: getRect(node),
              offset: getOffset(node)
            };
          })
        };
      },
      _onMultiDrag: function _onMultiDrag() {
        this._setMultiDiffer('from');
      },
      _onMultiStarted: function _onMultiStarted(_ref) {
        var e = _ref.e,
            evt = _ref.evt,
            dragEl = _ref.dragEl;

        // on-muti-drag
        this._dispatchEvent('onDrag', _objectSpread2(_objectSpread2({}, _emitMultiDiffer()), {}, {
          event: e,
          originalEvent: evt
        })); // capture animate


        this._captureAnimationState(dragEl);

        selectedElements.forEach(function (node) {
          if (node === dragEl) return;
          css(node, 'position', 'absolute');
        });
        var dragRect = getRect(dragEl, {
          relative: true
        }); // hide selected elements

        selectedElements.forEach(function (node) {
          if (node === dragEl) return;
          setRect(node, dragRect);
          css(node, 'display', 'none');
        });

        this._animate();
      },
      _onMultiMove: function _onMultiMove(_ref2) {
        var e = _ref2.e,
            evt = _ref2.evt,
            dragEl = _ref2.dragEl,
            ghostEl = _ref2.ghostEl;

        // on-multi-move
        this._dispatchEvent('onMove', _objectSpread2(_objectSpread2({}, _emitMultiDiffer()), {}, {
          ghostEl: ghostEl,
          event: e,
          originalEvent: evt
        }));

        var rect = getMouseRect(e); // move selected elements

        selectedElements.forEach(function (node) {
          if (node === dragEl) return;
          css(node, 'top', rect.top);
          css(node, 'left', rect.left);
        });
      },
      _onMultiChange: function _onMultiChange(_ref3) {
        var dragEl = _ref3.dragEl,
            rootEl = _ref3.rootEl,
            target = _ref3.target,
            e = _ref3.e,
            evt = _ref3.evt;
        if (!multiDiffer.from.group) return;

        if (!lastChild(rootEl) || target === rootEl && multiDiffer.from.group !== rootEl) {
          multiDiffer.from.sortable._captureAnimationState(dragEl, dragEl);

          selectedElements.forEach(function (node) {
            rootEl.appendChild(node);
          });

          this._setMultiDiffer('to'); // on-remove


          multiDiffer.from.sortable._dispatchEvent('onRemove', _objectSpread2(_objectSpread2({}, _emitMultiDiffer()), {}, {
            event: e,
            originalEvent: evt
          })); // on-add


          this._dispatchEvent('onAdd', _objectSpread2(_objectSpread2({}, _emitMultiDiffer()), {}, {
            event: e,
            originalEvent: evt
          }));

          multiDiffer.from.sortable._animate();
        } else {
          var _getElement = getElement(rootEl, target),
              el = _getElement.el,
              rect = _getElement.rect,
              offset = _getElement.offset;

          if (!el || el && el.animated || el === dragEl) return;

          this._setMultiDiffer('to');

          var clientX = e.clientX,
              clientY = e.clientY;
          var left = rect.left,
              right = rect.right,
              top = rect.top,
              bottom = rect.bottom; // swap when the elements before and after the drag are inconsistent

          if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
            this._captureAnimationState(dragEl, el);

            if (multiDiffer.from.group !== multiDiffer.to.group) {
              multiDiffer.from.sortable._captureAnimationState(dragEl, el);

              selectedElements.forEach(function (node) {
                rootEl.insertBefore(node, el);
              }); // on-remove

              multiDiffer.from.sortable._dispatchEvent('onRemove', _objectSpread2(_objectSpread2({}, _emitMultiDiffer()), {}, {
                event: e,
                originalEvent: evt
              })); // on-add


              this._dispatchEvent('onAdd', _objectSpread2(_objectSpread2({}, _emitMultiDiffer()), {}, {
                event: e,
                originalEvent: evt
              }));

              multiDiffer.from.sortable._animate();
            } else {
              // the top value is compared first, and the left is compared if the top value is the same
              var _offset = getOffset(dragEl);

              if (_offset.top < offset.top || _offset.left < offset.left) {
                selectedElements.forEach(function (node) {
                  rootEl.insertBefore(node, el.nextSibling);
                });
              } else {
                selectedElements.forEach(function (node) {
                  rootEl.insertBefore(node, el);
                });
              } // on-change


              this._dispatchEvent('onChange', _objectSpread2(_objectSpread2({}, _emitMultiDiffer()), {}, {
                event: e,
                originalEvent: evt
              }));
            }

            this._animate();
          }
        }

        multiDiffer.from.sortable = this;
        multiDiffer.from.group = rootEl;
      },
      _onMultiDrop: function _onMultiDrop(_ref4) {
        var fromGroup = _ref4.fromGroup,
            fromSortable = _ref4.fromSortable,
            dragEl = _ref4.dragEl,
            rootEl = _ref4.rootEl,
            evt = _ref4.evt;

        this._captureAnimationState(dragEl);

        selectedElements.forEach(function (node) {
          if (node === dragEl) return;
          unsetRect(node);
        });
        var index = selectedElements.indexOf(dragEl);

        for (var i = 0; i < selectedElements.length; i++) {
          if (i < index) {
            rootEl.insertBefore(selectedElements[i], dragEl);
          } else {
            var dropEl = i > 0 ? selectedElements[i - 1] : dragEl;
            rootEl.insertBefore(selectedElements[i], dropEl.nextSibling);
          }
        }

        multiDiffer.to.nodes = selectedElements.map(function (node) {
          return {
            node: node,
            rect: getRect(node),
            offset: getOffset(node)
          };
        });

        if (!multiDiffer.to.group) {
          multiDiffer.to.group = this.el;
          multiDiffer.to.sortable = this;
        }

        multiDiffer.from.group = fromGroup;
        multiDiffer.from.sortable = fromSortable;

        var changed = _offsetChanged(multiDiffer.from.nodes, multiDiffer.to.nodes);

        var params = _objectSpread2(_objectSpread2({}, _emitMultiDiffer()), {}, {
          changed: changed,
          event: evt,
          originalEvent: evt
        }); // on-drop


        if (multiDiffer.to.group !== fromGroup) fromSortable._dispatchEvent('onDrop', params);

        this._dispatchEvent('onDrop', params);

        this._animate();
      }
    };
  }

  /**
   * Sortable states
   */

  var EventState = /*#__PURE__*/function () {
    function EventState() {
      _classCallCheck(this, EventState);

      this.down = undefined;
      this.move = undefined;
    }

    _createClass(EventState, [{
      key: "destroy",
      value: function destroy() {
        this.down = undefined;
        this.move = undefined;
      }
    }]);

    return EventState;
  }();

  var FromTo = {
    sortable: null,
    group: null,
    node: null,
    rect: {},
    offset: {}
  };
  /**
   * Difference before and after dragging
   */

  var Difference = /*#__PURE__*/function () {
    function Difference() {
      _classCallCheck(this, Difference);

      this.from = _objectSpread2({}, FromTo);
      this.to = _objectSpread2({}, FromTo);
    }

    _createClass(Difference, [{
      key: "destroy",
      value: function destroy() {
        this.from = _objectSpread2({}, FromTo);
        this.to = _objectSpread2({}, FromTo);
      }
    }]);

    return Difference;
  }(); // -------------------------------- Sortable ----------------------------------


  var sortables = [];
  var rootEl,
      dragEl,
      dropEl,
      ghostEl,
      isMultiple,
      fromGroup,
      activeGroup,
      fromSortable,
      dragStartTimer,
      // timer for start to drag
  autoScrollAnimationFrame,
      differ = new Difference(),
      // Record the difference before and after
  eventState = new EventState(); // Status record during drag and move

  var distance = {
    x: 0,
    y: 0
  };
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
   * get nearest Sortable
   */


  var _nearestSortable = function _nearestSortable(evt) {
    if (dragEl) {
      evt = evt.touches ? evt.touches[0] : evt;
      var _evt = evt,
          clientX = _evt.clientX,
          clientY = _evt.clientY;

      var nearest = _detectNearestSortable(clientX, clientY);

      if (nearest) {
        // Create imitation event
        var event = {};

        for (var i in evt) {
          event[i] = evt[i];
        }

        event.target = document.elementFromPoint(clientX, clientY);
        rootEl = nearest;
        event.preventDefault = void 0;
        event.stopPropagation = void 0;
        if (rootEl === fromGroup) return;

        nearest[expando]._onMove(event);
      }
    }
  };
  /**
   * Detects first nearest empty sortable to X and Y position using emptyInsertThreshold.
   * @param  {Number} x      X position
   * @param  {Number} y      Y position
   * @return {HTMLElement}   Element of the first found nearest Sortable
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

  var _emitDiffer = function _emitDiffer() {
    return {
      from: _objectSpread2({}, differ.from),
      to: _objectSpread2({}, differ.to)
    };
  };

  var _params = function _params(args) {
    return _objectSpread2(_objectSpread2({}, args), {}, {
      rootEl: rootEl,
      dragEl: dragEl,
      ghostEl: ghostEl,
      fromSortable: fromSortable,
      fromGroup: fromGroup,
      activeGroup: activeGroup
    });
  };
  /**
   * @class  Sortable
   * @param  {HTMLElement}  el group element
   * @param  {Object}       options
   */


  function Sortable(el, options) {
    if (!(el && el.nodeType && el.nodeType === 1)) {
      throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
    }

    el[expando] = this;
    this.el = el;
    this.scrollEl = getParentAutoScrollElement(el, true); // scroll element

    this.options = options = Object.assign({}, options);
    this.ownerDocument = el.ownerDocument;
    var defaults = {
      group: '',
      // string: 'group' or object: { name: 'group', put: true | false, pull: true | false }
      animation: 150,
      // Define the timing of the sorting animation
      multiple: false,
      // Enable multi-drag
      draggable: undefined,
      // String: css selector, Function: (e) => return true
      onDrag: undefined,
      // The callback function triggered when dragging starts: () => {}
      onMove: undefined,
      // The callback function during drag and drop: (from, to) => {}
      onDrop: undefined,
      // The callback function when the drag is completed: (from, to, changed) => {}
      onChange: undefined,
      // The callback function when dragging an element to change its position: (from, to) => {}
      scrollThreshold: 25,
      // Autoscroll threshold
      delay: 0,
      // Defines the delay time after which the mouse-selected list cell can start dragging
      delayOnTouchOnly: false,
      // only delay if user is using touch
      disabled: false,
      // Defines whether the sortable object is available or not. When it is true, the sortable object cannot drag and drop sorting and other functions. When it is false, it can be sorted, which is equivalent to a switch.
      ghostClass: '',
      // Ghost element class name
      ghostStyle: {},
      // Ghost element style
      chosenClass: '',
      // Chosen element style
      selectedClass: '',
      // The style of the element when it is selected
      fallbackOnBody: false,
      // Appends the cloned DOM Element into the Document's Body
      stopPropagation: false,
      // Prevents further propagation of the current event in the capture and bubbling phases
      supportPointer: 'onpointerdown' in window && !Safari,
      supportTouch: 'ontouchstart' in window,
      emptyInsertThreshold: 5
    }; // Set default options

    for (var name in defaults) {
      !(name in this.options) && (this.options[name] = defaults[name]);
    }

    _prepareGroup(options); // Bind all private methods


    for (var fn in this) {
      if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
        this[fn] = this[fn].bind(this);
      }
    }

    var _this$options = this.options,
        supportPointer = _this$options.supportPointer,
        supportTouch = _this$options.supportTouch;

    if (supportPointer) {
      on(el, 'pointerdown', this._onDrag);
    } else if (supportTouch) {
      on(el, 'touchstart', this._onDrag);
    } else {
      on(el, 'mousedown', this._onDrag);
    }

    sortables.push(el);
    Object.assign(this, Animation());
    this.autoScroll = new AutoScroll();

    if (this.options.multiple) {
      Object.assign(this, Multiple());
    }
  }

  Sortable.prototype = {
    constructor: Sortable,
    // -------------------------------- public methods ----------------------------------

    /**
     * Destroy
     */
    destroy: function destroy() {
      this._dispatchEvent('destroy', this);

      this.el[expando] = null;
      off(this.el, 'pointerdown', this._onDrag);
      off(this.el, 'touchstart', this._onDrag);
      off(this.el, 'mousedown', this._onDrag); // clear status

      this._clearState();

      clearTimeout(dragStartTimer);
      sortables.splice(sortables.indexOf(this.el), 1);
      this.el = null;
    },
    // -------------------------------- prepare start ----------------------------------
    _onDrag: function _onDrag(
    /** Event|TouchEvent */
    evt) {
      var _this = this;

      if (dragEl || this.options.disabled || this.options.group.pull === false) return;
      if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0) return true; // only left button and enabled

      var _getEvent = getEvent(evt),
          touch = _getEvent.touch,
          e = _getEvent.e,
          target = _getEvent.target; // Safari ignores further event handling after mousedown


      if (Safari && target && target.tagName.toUpperCase() === 'SELECT') return true;
      if (target === this.el) return true;
      var draggable = this.options.draggable;

      if (typeof draggable === 'function') {
        // Function type must return a HTMLElement if used to specifies the drag el
        var element = draggable(e);
        if (!element) return true; // set drag element

        if (isHTMLElement(element)) dragEl = element;
      } else if (typeof draggable === 'string') {
        // String use as 'TagName' or '.class' or '#id'
        if (!matches(target, draggable)) return true;
      } else if (draggable) {
        throw new Error("draggable expected \"function\" or \"string\" but received \"".concat(_typeof(draggable), "\""));
      } // Get the dragged element


      if (!dragEl) dragEl = getElement(this.el, target, true); // No dragging is allowed when there is no dragging element

      if (!dragEl || dragEl.animated) return true; // solve the problem that the mobile cannot be dragged

      if (touch) dragEl.style['touch-action'] = 'none';
      fromGroup = this.el;
      fromSortable = this;
      isMultiple = this.options.multiple && this._allowMultiDrag(dragEl); // multi-drag

      if (isMultiple) this._onMultiDrag(); // get the position of the dragged element in the list

      var _getElement = getElement(this.el, dragEl),
          rect = _getElement.rect,
          offset = _getElement.offset;

      differ.from = {
        sortable: this,
        group: this.el,
        node: dragEl,
        rect: rect,
        offset: offset
      };
      distance = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      eventState.down = e; // sortable state down is active
      // enable drag between groups

      if (this.options.supportPointer) {
        on(this.ownerDocument, 'pointermove', _nearestSortable);
        on(this.ownerDocument, 'pointerup', this._onDrop);
      } else if (touch) {
        on(this.ownerDocument, 'touchmove', _nearestSortable);
        on(this.ownerDocument, 'touchend', this._onDrop);
      } else {
        on(this.ownerDocument, 'mousemove', _nearestSortable);
        on(this.ownerDocument, 'mouseup', this._onDrop);
      }

      var _this$options2 = this.options,
          delay = _this$options2.delay,
          delayOnTouchOnly = _this$options2.delayOnTouchOnly;

      if (delay && (!delayOnTouchOnly || touch) && !(Edge || IE11OrLess)) {
        clearTimeout(dragStartTimer); // delay to start

        dragStartTimer = setTimeout(function () {
          return _this._onStart(e, touch);
        }, delay);
      } else {
        this._onStart(e, touch);
      }
    },
    _onStart: function _onStart(
    /** Event|TouchEvent */
    e, touch) {
      rootEl = this.el;
      activeGroup = this.options.group;

      if (this.options.supportPointer) {
        on(this.ownerDocument, 'pointermove', this._onMove);
        on(this.ownerDocument, 'pointercancel', this._onDrop);
      } else if (touch) {
        on(this.ownerDocument, 'touchmove', this._onMove);
        on(this.ownerDocument, 'touchcancel', this._onDrop);
      } else {
        on(this.ownerDocument, 'mousemove', this._onMove);
      } // clear selection


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
    // -------------------------------- move ----------------------------------
    _onMove: function _onMove(
    /** Event|TouchEvent */
    evt) {
      this._preventEvent(evt);

      if (!eventState.down || !dragEl) return;
      if (!_positionChanged(evt)) return;

      var _getEvent2 = getEvent(evt),
          e = _getEvent2.e,
          target = _getEvent2.target; // truly started


      this._onStarted(e, evt);

      var clientX = evt.clientX - eventState.down.clientX;
      var clientY = evt.clientY - eventState.down.clientY;
      setTransition(ghostEl, 'none');
      setTransform(ghostEl, "translate3d(".concat(clientX, "px, ").concat(clientY, "px, 0)"));

      if (isMultiple) {
        // on-multi-move
        this._onMultiMove(_params({
          e: e,
          evt: evt
        }));
      } else {
        // on-move
        this._dispatchEvent('onMove', _objectSpread2(_objectSpread2({}, _emitDiffer()), {}, {
          ghostEl: ghostEl,
          event: e,
          originalEvent: evt
        }));
      } // check if element will exchange


      if (this._allowPut()) this._triggerChangeEvent(target, e, evt); // auto scroll

      cancelAnimationFrame(autoScrollAnimationFrame);
      autoScrollAnimationFrame = requestAnimationFrame(this._autoScroll);
    },
    _autoScroll: function _autoScroll() {
      this.autoScroll.update(this, eventState);
      cancelAnimationFrame(autoScrollAnimationFrame);
      autoScrollAnimationFrame = requestAnimationFrame(this._autoScroll);
    },
    _allowPut: function _allowPut() {
      if (fromGroup === this.el) {
        return true;
      } else if (!this.options.group.put) {
        return false;
      } else {
        var name = this.options.group.name;
        return activeGroup.name && name && activeGroup.name === name;
      }
    },
    // -------------------------------- real started ----------------------------------
    _onStarted: function _onStarted(e,
    /** originalEvent */
    evt) {
      if (!eventState.move) {
        // on-multi-drag
        if (isMultiple) {
          this._onMultiStarted(_params({
            e: e,
            evt: evt
          }));
        } else {
          // on-drag
          this._dispatchEvent('onDrag', _objectSpread2(_objectSpread2({}, _emitDiffer()), {}, {
            event: e,
            originalEvent: evt
          }));
        } // Init in the move event to prevent conflict with the click event


        this._appendGhost(); // add class for drag element


        toggleClass(dragEl, this.options.chosenClass, true);
        dragEl.style['will-change'] = 'transform';
        if (Safari) css(document.body, 'user-select', 'none');
        css(this.ownerDocument.body, 'cursor', 'move');
      }

      eventState.move = e; // sortable state move is active
    },
    // -------------------------------- ghost ----------------------------------
    _appendGhost: function _appendGhost() {
      if (ghostEl) return;
      var _this$options3 = this.options,
          fallbackOnBody = _this$options3.fallbackOnBody,
          ghostClass = _this$options3.ghostClass,
          _this$options3$ghostS = _this$options3.ghostStyle,
          ghostStyle = _this$options3$ghostS === void 0 ? {} : _this$options3$ghostS;
      var container = fallbackOnBody ? document.body : this.el;
      var rect = getRect(dragEl, {
        block: true
      }, container);

      if (isMultiple) {
        ghostEl = this._getMultiGhostElement();
      } else {
        ghostEl = dragEl.cloneNode(true);
      }

      toggleClass(ghostEl, ghostClass, true);
      css(ghostEl, 'cursor', 'move');
      css(ghostEl, 'box-sizing', 'border-box');
      css(ghostEl, 'margin', 0);
      css(ghostEl, 'top', rect.top);
      css(ghostEl, 'left', rect.left);
      css(ghostEl, 'width', rect.width);
      css(ghostEl, 'height', rect.height);
      css(ghostEl, 'opacity', '0.8');
      css(ghostEl, 'position', 'fixed');
      css(ghostEl, 'zIndex', '100000');
      css(ghostEl, 'pointerEvents', 'none');

      for (var key in ghostStyle) {
        css(ghostEl, key, ghostStyle[key]);
      }

      setTransition(ghostEl, 'none');
      setTransform(ghostEl, 'translate3d(0px, 0px, 0px)');
      container.appendChild(ghostEl);
      var ox = distance.x / parseInt(ghostEl.style.width) * 100;
      var oy = distance.y / parseInt(ghostEl.style.height) * 100;
      css(ghostEl, 'transform-origin', "".concat(ox, "% ").concat(oy, "%"));
      css(ghostEl, 'transform', 'translateZ(0)');
      Sortable.ghost = ghostEl;
    },
    // -------------------------------- on change ----------------------------------
    _triggerChangeEvent: function _triggerChangeEvent(target, e, evt) {
      if (!dragEl) return; // on-multi-change

      if (isMultiple) {
        this._onMultiChange(_params({
          target: target,
          e: e,
          evt: evt
        }));
      } else {
        // on-change
        this._onChange(target, e, evt);
      }
    },
    _onChange: function _onChange(target, e, evt) {
      if (!differ.from.group) return;

      if (!lastChild(rootEl) || target === rootEl && differ.from.group !== rootEl) {
        differ.from.sortable._captureAnimationState(dragEl, dragEl);

        differ.to = {
          sortable: this,
          group: rootEl,
          node: dragEl,
          rect: getRect(dragEl),
          offset: getOffset(dragEl)
        }; // on-remove

        differ.from.sortable._dispatchEvent('onRemove', _objectSpread2(_objectSpread2({}, _emitDiffer()), {}, {
          event: e,
          originalEvent: evt
        })); // on-add


        this._dispatchEvent('onAdd', _objectSpread2(_objectSpread2({}, _emitDiffer()), {}, {
          event: e,
          originalEvent: evt
        }));

        rootEl.appendChild(dragEl);

        differ.from.sortable._animate();
      } else {
        var _getElement2 = getElement(rootEl, target),
            el = _getElement2.el,
            rect = _getElement2.rect,
            offset = _getElement2.offset;

        if (!el || el && el.animated || el === dragEl) return;
        dropEl = el;
        differ.to = {
          sortable: this,
          group: rootEl,
          node: dropEl,
          rect: rect,
          offset: offset
        };
        var clientX = e.clientX,
            clientY = e.clientY;
        var left = rect.left,
            right = rect.right,
            top = rect.top,
            bottom = rect.bottom; // swap when the elements before and after the drag are inconsistent

        if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
          this._captureAnimationState(dragEl, dropEl);

          if (differ.from.group !== differ.to.group) {
            differ.from.sortable._captureAnimationState(dragEl, dropEl); // on-remove


            differ.from.sortable._dispatchEvent('onRemove', _objectSpread2(_objectSpread2({}, _emitDiffer()), {}, {
              event: e,
              originalEvent: evt
            })); // on-add


            this._dispatchEvent('onAdd', _objectSpread2(_objectSpread2({}, _emitDiffer()), {}, {
              event: e,
              originalEvent: evt
            }));

            rootEl.insertBefore(dragEl, dropEl);

            differ.from.sortable._animate();
          } else {
            // on-change
            this._dispatchEvent('onChange', _objectSpread2(_objectSpread2({}, _emitDiffer()), {}, {
              event: e,
              originalEvent: evt
            })); // the top value is compared first, and the left is compared if the top value is the same


            var _offset = getOffset(dragEl);

            if (_offset.top < offset.top || _offset.left < offset.left) {
              rootEl.insertBefore(dragEl, dropEl.nextSibling);
            } else {
              rootEl.insertBefore(dragEl, dropEl);
            }
          }

          this._animate();
        }
      }

      differ.from.sortable = this;
      differ.from.group = rootEl;
    },
    // -------------------------------- on drop ----------------------------------
    _onDrop: function _onDrop(
    /** Event|TouchEvent */
    evt) {
      this._unbindMoveEvents();

      this._unbindDropEvents();

      this._preventEvent(evt);

      clearTimeout(dragStartTimer);
      cancelAnimationFrame(autoScrollAnimationFrame); // clear style, attrs and class

      if (dragEl) {
        var _getEvent3 = getEvent(evt),
            touch = _getEvent3.touch;

        toggleClass(dragEl, this.options.chosenClass, false);
        if (touch) dragEl.style['touch-action'] = '';
        dragEl.style['will-change'] = '';
      } // drag and drop done


      if (dragEl && eventState.down && eventState.move) {
        if (isMultiple) {
          this._onMultiDrop(_params({
            evt: evt
          }));
        } else {
          // re-acquire the offset and rect values of the dragged element as the value after the drag is completed
          differ.to.rect = getRect(dragEl);
          differ.to.offset = getOffset(dragEl);

          if (!differ.to.group) {
            differ.to.group = this.el;
            differ.to.sortable = this;
          }

          differ.from.group = fromGroup;
          differ.from.sortable = fromSortable;
          var changed = offsetChanged(differ.from.offset, differ.to.offset);

          var params = _objectSpread2(_objectSpread2({}, _emitDiffer()), {}, {
            changed: changed,
            event: evt,
            originalEvent: evt
          }); // on-drop


          if (differ.to.group !== fromGroup) fromSortable._dispatchEvent('onDrop', params);

          this._dispatchEvent('onDrop', params);
        }

        if (Safari) css(document.body, 'user-select', '');
        css(this.ownerDocument.body, 'cursor', '');
      } else if (this.options.multiple) {
        // click event
        this._setMultiElements(evt, this.el);
      }

      this._clearState();
    },
    // -------------------------------- event ----------------------------------
    _preventEvent: function _preventEvent(evt) {
      evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault();
      if (this.options.stopPropagation) evt.stopPropagation && evt.stopPropagation(); // prevent events from bubbling
    },
    _dispatchEvent: function _dispatchEvent(event, params) {
      var callback = this.options[event];
      if (typeof callback === 'function') callback(params);
    },
    // -------------------------------- clear ----------------------------------
    _clearState: function _clearState() {
      ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
      dragEl = dropEl = ghostEl = isMultiple = fromGroup = activeGroup = fromSortable = dragStartTimer = autoScrollAnimationFrame = Sortable.ghost = null;
      distance = lastPosition = {
        x: 0,
        y: 0
      };
      eventState.destroy();
      differ.destroy();
    },
    _unbindMoveEvents: function _unbindMoveEvents() {
      off(this.ownerDocument, 'pointermove', this._onMove);
      off(this.ownerDocument, 'touchmove', this._onMove);
      off(this.ownerDocument, 'mousemove', this._onMove);
      off(this.ownerDocument, 'pointermove', _nearestSortable);
      off(this.ownerDocument, 'touchmove', _nearestSortable);
      off(this.ownerDocument, 'mousemove', _nearestSortable);
    },
    _unbindDropEvents: function _unbindDropEvents() {
      off(this.ownerDocument, 'pointerup', this._onDrop);
      off(this.ownerDocument, 'pointercancel', this._onDrop);
      off(this.ownerDocument, 'touchend', this._onDrop);
      off(this.ownerDocument, 'touchcancel', this._onDrop);
      off(this.ownerDocument, 'mouseup', this._onDrop);
    }
  };
  Sortable.prototype.utils = {
    getRect: getRect,
    getOffset: getOffset
  };

  return Sortable;

}));

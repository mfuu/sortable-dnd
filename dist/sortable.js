/*!
 * sortable-dnd v0.3.9
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

  function userAgent(pattern) {
    if (typeof window !== 'undefined' && window.navigator) {
      return !! /*@__PURE__*/navigator.userAgent.match(pattern);
    }
  }

  var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
  var Edge = userAgent(/Edge/i);
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
  var IOS = userAgent(/iP(ad|od|hone)/i);
  var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);

  var captureMode = {
    capture: false,
    passive: false
  };
  var R_SPACE = /\s+/g;
  var CSSTRANSITIONS = ['-webkit-transition', '-moz-transition', '-ms-transition', '-o-transition', 'transition'];
  var CSSTRANSFORMS = ['-webkit-transform', '-moz-transform', '-ms-transform', '-o-transform', 'transform'];
  var SUPPORTPASSIVE = supportPassive();
  /**
   * check if is HTMLElement
   */

  function isHTMLElement(obj) {
    var d = document.createElement("div");

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
    if (transition) {
      if (transition === 'none') CSSTRANSITIONS.forEach(function (ts) {
        return css(el, ts, 'none');
      });else CSSTRANSITIONS.forEach(function (ts) {
        return css(el, ts, "".concat(ts.split('transition')[0], "transform ").concat(transition));
      });
    } else CSSTRANSITIONS.forEach(function (ts) {
      return css(el, ts, '');
    });
  }
  /**
   * set transform style
   * @param {HTMLElement} el 
   * @param {String} transform 
   */

  function setTransform(el, transform) {
    if (transform) CSSTRANSFORMS.forEach(function (tf) {
      return css(el, tf, "".concat(tf.split('transform')[0]).concat(transform));
    });else CSSTRANSFORMS.forEach(function (tf) {
      return css(el, tf, '');
    });
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
      el.addEventListener(event, fn, SUPPORTPASSIVE || !IE11OrLess ? captureMode : false);
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
      el.removeEventListener(event, fn, SUPPORTPASSIVE || !IE11OrLess ? captureMode : false);
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
   * Returns the "bounding client rect" of given element
   * @param {HTMLElement} el  The element whose boundingClientRect is wanted
   * @param {Boolean} checkParent check if parentNode.height < el.height
   */

  function getRect(el, checkParent) {
    if (!el.getBoundingClientRect && el !== window) return;
    var rect = {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      height: 0,
      width: 0
    };
    var elRect;

    if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
      elRect = el.getBoundingClientRect();
      rect.top = elRect.top;
      rect.left = elRect.left;
      rect.bottom = elRect.bottom;
      rect.right = elRect.right;
      rect.height = elRect.height;
      rect.width = elRect.width;

      if (checkParent && el.parentNode !== el.ownerDocument.body) {
        var parentRect,
            parentNode = el.parentNode;

        while (parentNode && parentNode.getBoundingClientRect && parentNode !== el.ownerDocument.body) {
          parentRect = parentNode.getBoundingClientRect();

          if (parentRect.height < rect.height) {
            rect.top = parentRect.top;
            rect.left = parentRect.left;
            rect.bottom = parentRect.bottom;
            rect.right = parentRect.right;
            rect.height = parentRect.height;
            rect.width = parentRect.width;
            return rect;
          }

          parentNode = parentNode.parentNode;
        }
      }
    } else {
      rect.top = 0;
      rect.left = 0;
      rect.bottom = window.innerHeight;
      rect.right = window.innerWidth;
      rect.height = window.innerHeight;
      rect.width = window.innerWidth;
    }

    return rect;
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
  function debounce(fn, delay, immediate) {
    var timer = null;
    return function () {
      var context = this,
          args = arguments;
      timer && clearTimeout(timer);
      immediate && !timer && fn.apply(context, args);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }
  function throttle(fn, delay) {
    var timer = null;
    return function () {
      var context = this,
          args = arguments;

      if (!timer) {
        timer = setTimeout(function () {
          timer = null;
          fn.apply(context, args);
        }, delay);
      }
    };
  }
  function _nextTick(fn) {
    return setTimeout(fn, 0);
  }
  var expando = 'Sortable' + Date.now();

  function AutoScroll() {
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function (callback) {
        return setTimeout(callback, 17);
      };
    }

    return {
      _autoScroll: throttle(function (Sortable, state) {
        if (!Sortable.scrollEl) return; // check if is moving now

        if (!(state.sortableDown && state.sortableMove)) return;
        var _state$sortableMove = state.sortableMove,
            clientX = _state$sortableMove.clientX,
            clientY = _state$sortableMove.clientY;
        if (clientX === void 0 || clientY === void 0) return;

        if (Sortable.scrollEl === Sortable.ownerDocument) ; else {
          var _Sortable$scrollEl = Sortable.scrollEl,
              scrollTop = _Sortable$scrollEl.scrollTop,
              scrollLeft = _Sortable$scrollEl.scrollLeft,
              scrollHeight = _Sortable$scrollEl.scrollHeight,
              scrollWidth = _Sortable$scrollEl.scrollWidth;

          var _getRect = getRect(Sortable.scrollEl),
              top = _getRect.top,
              right = _getRect.right,
              bottom = _getRect.bottom,
              left = _getRect.left,
              height = _getRect.height,
              width = _getRect.width;

          var _Sortable$options = Sortable.options,
              scrollStep = _Sortable$options.scrollStep,
              scrollThreshold = _Sortable$options.scrollThreshold; // check direction

          var totop = scrollTop > 0 && clientY >= top && clientY <= top + scrollThreshold;
          var toleft = scrollLeft > 0 && clientX >= left && clientX <= left + scrollThreshold;
          var toright = scrollLeft + width < scrollWidth && clientX <= right && clientX >= right - scrollThreshold;
          var tobottom = scrollTop + height < scrollHeight && clientY <= bottom && clientY >= bottom - scrollThreshold; // scroll position

          var position = {
            x: scrollLeft,
            y: scrollTop
          };

          if (totop) {
            if (toleft) {
              // to top-left
              position.x = scrollLeft - scrollStep;
            } else if (toright) {
              // to top-right
              position.x = scrollLeft + scrollStep;
            } else {
              // to top
              position.x = scrollLeft;
            }

            position.y = scrollTop - scrollStep;
          } else if (tobottom) {
            if (toleft) {
              // to bottom-left
              position.x = scrollLeft - scrollStep;
            } else if (toright) {
              // to bottom-right
              position.x = scrollLeft + scrollStep;
            } else {
              // to bottom
              position.x = scrollLeft;
            }

            position.y = scrollTop + scrollStep;
          } else if (toleft) {
            // to left
            position.x = scrollLeft - scrollStep;
            position.y = scrollTop;
          } else if (toright) {
            // to right
            position.x = scrollLeft + scrollStep;
            position.y = scrollTop;
          } // if need to scroll


          if (totop || toleft || toright || tobottom) {
            requestAnimationFrame(function () {
              Sortable.scrollEl.scrollTo(position.x, position.y);

              Sortable._autoScroll(Sortable, state);
            });
          }
        }
      }, 10)
    };
  }

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

        children.slice(start, end + 1).forEach(function (child) {
          animationState.push({
            target: child,
            rect: getRect(child)
          });
        });
      },
      _rangeAnimate: function _rangeAnimate() {
        var _this = this;

        animationState.forEach(function (state) {
          var target = state.target,
              rect = state.rect;

          _this._animate(target, rect, _this.options.animation);
        });
      },
      _animate: function _animate(el, preRect) {
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

  /**
   * Sortable states
   */

  var State = /*#__PURE__*/function () {
    function State() {
      _classCallCheck(this, State);

      this.sortableDown = undefined;
      this.sortableMove = undefined;
    }

    _createClass(State, [{
      key: "destroy",
      value: function destroy() {
        this.sortableDown = undefined;
        this.sortableMove = undefined;
      }
    }]);

    return State;
  }();
  /**
   * Difference before and after dragging
   */


  var Differ = /*#__PURE__*/function () {
    function Differ() {
      _classCallCheck(this, Differ);

      this.from = {
        sortable: null,
        group: null,
        node: null,
        rect: {},
        offset: {}
      };
      this.to = {
        sortable: null,
        group: null,
        node: null,
        rect: {},
        offset: {}
      };
    }

    _createClass(Differ, [{
      key: "destroy",
      value: function destroy() {
        this.from = {
          sortable: null,
          group: null,
          node: null,
          rect: {},
          offset: {}
        };
        this.to = {
          sortable: null,
          group: null,
          node: null,
          rect: {},
          offset: {}
        };
      }
    }]);

    return Differ;
  }(); // -------------------------------- Sortable ----------------------------------


  var documentExists = typeof document !== 'undefined';
  var supportDraggable = documentExists && !ChromeForAndroid && !IOS && 'draggable' in document.createElement('div');
  var sortables = [];
  var rootEl,
      dragEl,
      dropEl,
      ghostEl,
      fromGroup,
      activeGroup,
      fromSortable,
      dragStartTimer,
      // timer for start to drag
  autoScrollTimer,
      state = new State(),
      // Status record during drag and drop
  differ = new Differ(); // Record the difference before and after dragging

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
        event.rootEl = nearest;
        event.preventDefault = void 0;
        event.stopPropagation = void 0;

        nearest[expando]._triggerEvent(event);
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
      var rect = getRect(sortable, true),
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

    if (clientX !== void 0 && Math.abs(distanceX) <= 0 && clientY !== void 0 && Math.abs(distanceY) <= 0) {
      return false;
    }

    return true;
  };

  var _globalDragOver = function _globalDragOver(evt) {
    if (evt.dataTransfer) {
      evt.dataTransfer.dropEffect = 'move';
    }

    evt.cancelable && evt.preventDefault();
  };

  var _emitDiffer = function _emitDiffer() {
    return {
      from: _objectSpread2({}, differ.from),
      to: _objectSpread2({}, differ.to)
    };
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
      autoScroll: true,
      // Auto scrolling when dragging to the edge of the container
      scrollStep: 5,
      // The distance to scroll each frame
      scrollThreshold: 15,
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
      fallbackOnBody: false,
      // Appends the cloned DOM Element into the Document's Body
      forceFallback: false,
      // Ignore HTML5 drag and drop behavior, force callback to proceed
      stopPropagation: false,
      // Prevents further propagation of the current event in the capture and bubbling phases
      supportPointer: 'PointerEvent' in window && !Safari,
      supportTouch: 'ontouchstart' in window,
      emptyInsertThreshold: 5
    }; // Set default options

    for (var name in defaults) {
      !(name in this.options) && (this.options[name] = defaults[name]);
    }

    this.nativeDraggable = this.options.forceFallback ? false : supportDraggable;

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
    Object.assign(this, Animation(), AutoScroll());
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
      off(this.el, 'mousedown', this._onDrag);

      this._clearState(); // Remove draggable attributes


      Array.prototype.forEach.call(this.el.querySelectorAll('[draggable]'), function (el) {
        el.removeAttribute('draggable');
      });
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


      if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === 'SELECT') return true;
      if (target === this.el) return true;
      var draggable = this.options.draggable;

      if (typeof draggable === 'function') {
        // Function type must return a HTMLElement if used to specifies the drag el
        var value = draggable(e);
        if (!value) return true;
        if (isHTMLElement(value)) dragEl = value; // set drag element
      } else if (typeof draggable === 'string') {
        // String use as 'tag' or '.class' or '#id'
        if (!matches(target, draggable)) return true;
      } else if (draggable) {
        throw new Error("draggable expected \"function\" or \"string\" but received \"".concat(_typeof(draggable), "\""));
      } // Get the dragged element               


      if (!dragEl) dragEl = getElement(this.el, target, true); // No dragging is allowed when there is no dragging element

      if (!dragEl || dragEl.animated) return true; // solve the problem that the mobile cannot be dragged

      if (touch) dragEl.style['touch-action'] = 'none';
      fromGroup = this.el;
      fromSortable = this; // get the position of the dragged element in the list

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
      state.sortableDown = e; // sortable state down is active
      // enable drag between groups

      if (this.nativeDraggable) {
        on(this.ownerDocument, 'dragover', _nearestSortable);
      } else if (this.options.supportPointer) {
        on(this.ownerDocument, 'pointermove', _nearestSortable);
      } else if (touch) {
        on(this.ownerDocument, 'touchmove', _nearestSortable);
      } else {
        on(this.ownerDocument, 'mousemove', _nearestSortable);
      } // Solve the problem that `dragend` does not take effect when the `dragover` event is not triggered


      on(this.ownerDocument, 'pointerup', this._onDrop);
      on(this.ownerDocument, 'touchend', this._onDrop);
      on(this.ownerDocument, 'mouseup', this._onDrop);
      var _this$options2 = this.options,
          delay = _this$options2.delay,
          delayOnTouchOnly = _this$options2.delayOnTouchOnly;

      if (delay && (!delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
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

      if (!this.nativeDraggable || touch) {
        if (this.options.supportPointer) {
          on(this.ownerDocument, 'pointermove', this._onMove);
        } else if (touch) {
          on(this.ownerDocument, 'touchmove', this._onMove);
        } else {
          on(this.ownerDocument, 'mousemove', this._onMove);
        }

        on(this.ownerDocument, 'pointercancel', this._onDrop);
        on(this.ownerDocument, 'touchcancel', this._onDrop);
      } else {
        // allow HTML5 drag event
        dragEl.draggable = true;
        on(this.el, 'dragstart', this._onDragStart);
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
    // -------------------------------- drag event ----------------------------------
    _onDragStart: function _onDragStart(evt) {
      this._appendGhost();

      var dataTransfer = evt.dataTransfer;

      if (dataTransfer) {
        // elements can only be dragged after firefox sets setData
        dataTransfer.setData('text', ''); // set ghost element

        dataTransfer.setDragImage(ghostEl, distance.x, distance.y);
        dataTransfer.effectAllowed = 'move';
      }
    },
    // -------------------------------- trigger ----------------------------------
    _triggerEvent: function _triggerEvent(evt) {
      rootEl = evt.rootEl;

      if (this.nativeDraggable) {
        on(this.el, 'dragover', _globalDragOver);
        on(this.el, 'dragend', this._onDrop);

        this._onDragOver(evt);
      } else {
        this._onMove(evt);
      }
    },
    // -------------------------------- move ----------------------------------
    _onMove: function _onMove(
    /** Event|TouchEvent */
    evt) {
      var _this2 = this;

      if (!state.sortableDown || !dragEl) return;

      this._preventEvent(evt);

      var _getEvent2 = getEvent(evt),
          e = _getEvent2.e,
          target = _getEvent2.target;

      this._onStarted(e, evt);

      if (evt.rootEl) {
        // on-move
        this._dispatchEvent('onMove', _objectSpread2(_objectSpread2({}, _emitDiffer()), {}, {
          ghostEl: ghostEl,
          event: e,
          originalEvent: evt
        })); // check if element will exchange


        if (this._allowPut()) this._onChange(target, e, evt); // auto scroll

        clearTimeout(autoScrollTimer);

        if (this.options.autoScroll) {
          autoScrollTimer = setTimeout(function () {
            return _this2._autoScroll(_this2, state);
          }, 0);
        }
      }
    },
    _onDragOver: function _onDragOver(evt) {
      if (!state.sortableDown || !dragEl) return;

      this._preventEvent(evt);

      var allowPut = this._allowPut();

      if (evt.dataTransfer) evt.dataTransfer.dropEffect = allowPut ? 'move' : 'none'; // truly started

      this._onStarted(evt, evt);

      if (evt.rootEl && _positionChanged(evt)) {
        // on-move
        this._dispatchEvent('onMove', _objectSpread2(_objectSpread2({}, _emitDiffer()), {}, {
          ghostEl: ghostEl,
          event: evt,
          originalEvent: evt
        }));

        if (allowPut) this._onChange(evt.target, evt, evt);
      }
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
      if (!state.sortableMove) {
        // on-drag
        this._dispatchEvent('onDrag', _objectSpread2(_objectSpread2({}, _emitDiffer()), {}, {
          event: e,
          originalEvent: evt
        })); // Init in the move event to prevent conflict with the click event


        if (!this.nativeDraggable) this._appendGhost(); // add class for drag element

        toggleClass(dragEl, this.options.chosenClass, true);
        dragEl.style['will-change'] = 'transform';
        if (this.nativeDraggable) this._unbindDropEvents();
        if (Safari) css(document.body, 'user-select', 'none');
      }

      state.sortableMove = e; // sortable state move is active

      if (!this.nativeDraggable) {
        var _state$sortableDown = state.sortableDown,
            clientX = _state$sortableDown.clientX,
            clientY = _state$sortableDown.clientY;
        setTransition(ghostEl, 'none');
        setTransform(ghostEl, "translate3d(".concat(e.clientX - clientX, "px, ").concat(e.clientY - clientY, "px, 0)"));
      }
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
      var rect = differ.from.rect;
      ghostEl = dragEl.cloneNode(true);
      toggleClass(ghostEl, ghostClass, true);
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
      } // hide ghostEl when use drag event


      if (this.nativeDraggable) {
        css(ghostEl, 'top', '-999px');
        css(ghostEl, 'zIndex', '-100000');
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
    _onChange: function _onChange(target, e, evt) {
      if (!dragEl) return;

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

        differ.from.sortable._rangeAnimate();
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

            differ.from.sortable._rangeAnimate();
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

          this._rangeAnimate();
        }
      }

      differ.from.sortable = this;
      differ.from.group = rootEl;
    },
    // -------------------------------- on drop ----------------------------------
    _onDrop: function _onDrop(
    /** Event|TouchEvent */
    evt) {
      this._unbindDragEvents();

      this._unbindMoveEvents();

      this._unbindDropEvents();

      this._preventEvent(evt);

      clearTimeout(dragStartTimer);
      clearTimeout(autoScrollTimer);

      if (dragEl) {
        var _getEvent3 = getEvent(evt),
            touch = _getEvent3.touch; // clear style, attrs and class


        toggleClass(dragEl, this.options.chosenClass, false);
        if (this.nativeDraggable) dragEl.draggable = false;
        if (touch) dragEl.style['touch-action'] = '';
        dragEl.style['will-change'] = '';

        if (state.sortableDown && state.sortableMove) {
          // re-acquire the offset and rect values of the dragged element as the value after the drag is completed
          differ.to.rect = getRect(dragEl);
          differ.to.offset = getOffset(dragEl);
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
      }

      if (Safari) css(document.body, 'user-select', '');

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
      dragEl = dropEl = ghostEl = fromGroup = activeGroup = fromSortable = dragStartTimer = autoScrollTimer = Sortable.ghost = null;
      distance = lastPosition = {
        x: 0,
        y: 0
      };
      state.destroy();
      differ.destroy();
    },
    _unbindDragEvents: function _unbindDragEvents() {
      if (this.nativeDraggable) {
        off(this.el, 'dragstart', this._onDragStart);
        off(this.el, 'dragover', _globalDragOver);
        off(this.el, 'dragend', this._onDrop);
      }
    },
    _unbindMoveEvents: function _unbindMoveEvents() {
      off(this.ownerDocument, 'pointermove', this._onMove);
      off(this.ownerDocument, 'touchmove', this._onMove);
      off(this.ownerDocument, 'mousemove', this._onMove);
      off(this.ownerDocument, 'pointermove', _nearestSortable);
      off(this.ownerDocument, 'touchmove', _nearestSortable);
      off(this.ownerDocument, 'mousemove', _nearestSortable);
      off(this.ownerDocument, 'dragover', _nearestSortable);
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
    getOffset: getOffset,
    debounce: debounce,
    throttle: throttle
  };

  return Sortable;

}));

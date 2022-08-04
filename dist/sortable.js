/*!
 * sortable-dnd v0.3.2
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
   */

  function getRect(el) {
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

  /**
   * Sortable states
   */

  var State = /*#__PURE__*/_createClass(function State() {
    _classCallCheck(this, State);

    this.sortableDown = undefined;
    this.sortableMove = undefined;
    this.animationEnd = undefined;
  });
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
  }();
  /**
   * Elements being dragged
   */

  var Ghost = /*#__PURE__*/function () {
    function Ghost(sortable) {
      _classCallCheck(this, Ghost);

      this.el = null;
      this.initPos = this.distance = {
        x: 0,
        y: 0
      };
      this.options = sortable.options;
      this.container = sortable.container;
    }

    _createClass(Ghost, [{
      key: "init",
      value: function init(el, rect) {
        var append = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        this.el = el;
        if (!append) return;
        var _this$options = this.options,
            ghostClass = _this$options.ghostClass,
            _this$options$ghostSt = _this$options.ghostStyle,
            ghostStyle = _this$options$ghostSt === void 0 ? {} : _this$options$ghostSt;
        toggleClass(this.el, ghostClass, true);
        css(this.el, 'box-sizing', 'border-box');
        css(this.el, 'margin', 0);
        css(this.el, 'top', rect.top);
        css(this.el, 'left', rect.left);
        css(this.el, 'width', rect.width);
        css(this.el, 'height', rect.height);
        css(this.el, 'opacity', '0.8'); // css(this.el, 'position', IOS ? 'absolute' : 'fixed')

        css(this.el, 'position', 'fixed');
        css(this.el, 'zIndex', '100000');
        css(this.el, 'pointerEvents', 'none');
        this.setStyle(ghostStyle);
        setTransition(this.el, 'none');
        setTransform(this.el, 'translate3d(0px, 0px, 0px)');
        this.container.appendChild(this.el);
        css(this.el, 'transform-origin', this.distance.x / parseInt(this.el.style.width) * 100 + '% ' + this.distance.y / parseInt(this.el.style.height) * 100 + '%');
        css(this.el, 'transform', 'translateZ(0)');
      }
    }, {
      key: "setStyle",
      value: function setStyle(style) {
        for (var key in style) {
          css(this.el, key, style[key]);
        }
      }
    }, {
      key: "rect",
      value: function rect() {
        return getRect(this.el);
      }
    }, {
      key: "move",
      value: function move(x, y) {
        var smooth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        if (!this.el) return;
        setTransition(this.el, smooth ? "".concat(this.options.ghostAnimation, "ms") : 'none');
        setTransform(this.el, "translate3d(".concat(x - this.initPos.x, "px, ").concat(y - this.initPos.y, "px, 0)"));
      }
    }, {
      key: "clear",
      value: function clear() {
        this.distance = {
          x: 0,
          y: 0
        };
        this.el && this.el.remove();
        this.el = null;
      }
    }, {
      key: "destroy",
      value: function destroy(rect) {
        var _this = this;

        if (!this.el) return;
        var left = parseInt(this.el.style.left);
        var top = parseInt(this.el.style.top);
        this.move(rect.left - left, rect.top - top, true);
        var ghostAnimation = this.options.ghostAnimation;
        ghostAnimation ? setTimeout(function () {
          return _this.clear();
        }, ghostAnimation) : this.clear();
      }
    }]);

    return Ghost;
  }();

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

  var documentExists = typeof document !== 'undefined';
  var supportDraggable = documentExists && !ChromeForAndroid && !IOS && 'draggable' in document.createElement('div');
  var sortables = [];
  var rootEl,
      dragEl,
      dropEl,
      ghostEl,
      fromGroup,
      activeGroup,
      state = new State(),
      // Status record during drag and drop
  differ = new Differ(); // Record the difference before and after dragging

  var _prepareGroup = function _prepareGroup(options) {
    var group = {};
    var originalGroup = options.group;

    if (!originalGroup || _typeof(originalGroup) != 'object') {
      originalGroup = {
        name: originalGroup
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
      var rect = getRect(sortable),
          insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold,
          insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;

      if (insideHorizontally && insideVertically) {
        return result = sortable;
      }
    });
    return result;
  };

  var lastPosition = {
    x: 0,
    y: 0
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
      ghostAnimation: 0,
      // Animation when the ghost element is destroyed
      ghostClass: '',
      // Ghost element class name
      ghostStyle: {},
      // Ghost element style
      chosenClass: '',
      // Chosen element style
      fallbackOnBody: false,
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

    this.container = this.options.fallbackOnBody ? document.body : el;
    this.nativeDraggable = this.options.forceFallback ? false : supportDraggable;
    this.ghost = new Ghost(this); // Mask element while dragging

    this.dragStartTimer = null; // setTimeout timer

    this.autoScrollTimer = null;

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
      this.el[expando] = null;
      off(this.el, 'pointerdown', this._onDrag);
      off(this.el, 'touchstart', this._onDrag);
      off(this.el, 'mousedown', this._onDrag);

      this._clearState(); // Remove draggable attributes


      Array.prototype.forEach.call(this.el.querySelectorAll('[draggable]'), function (el) {
        el.removeAttribute('draggable');
      });
    },

    /**
     * set value for options by key
     */
    set: function set(key, value) {
      this.options[key] = value;
    },

    /**
     * get value from options by key
     */
    get: function get(key) {
      return this.options[key];
    },
    // -------------------------------- prepare start ----------------------------------
    _onDrag: function _onDrag(
    /** Event|TouchEvent */
    evt) {
      var _this = this;

      if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0 || this.options.disabled || this.options.group.pull === false) return true; // only left button and enabled

      var _getEvent = getEvent(evt),
          touch = _getEvent.touch,
          e = _getEvent.e,
          target = _getEvent.target; // Safari ignores further event handling after mousedown


      if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === 'SELECT') return true;
      if (target === this.el) return true;
      if (this.options.stopPropagation) evt.stopPropagation && evt.stopPropagation(); // prevent events from bubbling

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
      fromGroup = this.el; // get the position of the dragged element in the list

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
      this.ghost.distance = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      this.ghost.initPos = {
        x: e.clientX,
        y: e.clientY
      };
      state.sortableDown = e; // sortable state down is active

      on(this.ownerDocument, 'dragover', _nearestSortable);
      on(this.ownerDocument, 'mousemove', _nearestSortable);
      on(this.ownerDocument, 'touchmove', _nearestSortable);
      on(this.ownerDocument, 'pointermove', _nearestSortable); // Solve the problem that `dragend` does not take effect when the `dragover` event is not triggered

      on(this.ownerDocument, 'pointerup', this._onDrop);
      on(this.ownerDocument, 'touchend', this._onDrop);
      on(this.ownerDocument, 'mouseup', this._onDrop);
      var _this$options2 = this.options,
          delay = _this$options2.delay,
          delayOnTouchOnly = _this$options2.delayOnTouchOnly;

      if (delay && (!delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
        clearTimeout(this.dragStartTimer); // delay to start

        this.dragStartTimer = setTimeout(function () {
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
        on(dragEl, 'dragend', this);
        on(rootEl, 'dragstart', this._onDragStart);
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
      } catch (error) {//
      }
    },
    // -------------------------------- trigger ----------------------------------
    _triggerEvent: function _triggerEvent(evt) {
      if (activeGroup.name !== this.options.group.name) return;
      rootEl = evt.rootEl;

      if (this.nativeDraggable) {
        on(this.el, 'dragend', this._onDrop);

        this._onDragOver(evt);
      } else {
        this._onMove(evt);
      }
    },
    // -------------------------------- drag event ----------------------------------
    _onDragStart: function _onDragStart(evt) {
      // elements can only be dragged after firefox sets setData
      if (evt.dataTransfer) {
        evt.dataTransfer.setData('DRAGGABLE_EFFECT', evt.target.innerText);
        evt.dataTransfer.effectAllowed = 'move';
      }

      on(this.el, 'dragover', this._onDragOver);
      on(this.el, 'dragend', this._onDrop);
    },
    _onDragOver: function _onDragOver(evt) {
      if (!state.sortableDown || !dragEl) return;

      this._preventEvent(evt); // truly started


      this._onStarted(evt, evt);

      if (!evt.rootEl) return;

      if (_positionChanged(evt)) {
        // onMove callback
        this._dispatchEvent('onMove', _objectSpread2(_objectSpread2({}, differ), {}, {
          ghostEl: ghostEl,
          event: evt,
          originalEvent: evt
        }));

        if (this.options.group.put || fromGroup === this.el) this._onChange(evt.target, evt, evt);
      }
    },
    // -------------------------------- real started ----------------------------------
    _onStarted: function _onStarted(e,
    /** originalEvent */
    evt) {
      state.sortableMove = e; // sortable state move is active

      if (!ghostEl) {
        // onDrag callback
        this._dispatchEvent('onDrag', {
          dragEl: dragEl,
          event: e,
          originalEvent: evt
        }); // Init in the move event to prevent conflict with the click event


        var rect = differ.from.rect;
        ghostEl = dragEl.cloneNode(true);
        this.ghost.init(ghostEl, rect, !this.nativeDraggable);
        Sortable.ghost = ghostEl; // add class for drag element

        toggleClass(dragEl, this.options.chosenClass, true);
        dragEl.style['will-change'] = 'transform';

        if (this.nativeDraggable) {
          this._unbindDropEvents();

          on(document, 'drop', this);
        }

        if (evt.dataTransfer) evt.dataTransfer.dropEffect = 'move';
        if (Safari) css(document.body, 'user-select', 'none');
      }
    },
    // -------------------------------- on move ----------------------------------
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

      this.ghost.move(e.clientX, e.clientY);
      if (!evt.rootEl) return; // onMove callback

      this._dispatchEvent('onMove', _objectSpread2(_objectSpread2({}, differ), {}, {
        ghostEl: ghostEl,
        event: e,
        originalEvent: evt
      })); // check if element will exchange


      if (this.options.group.put || fromGroup === this.el) this._onChange(target, e, evt); // auto scroll

      clearTimeout(this.autoScrollTimer);

      if (this.options.autoScroll) {
        this.autoScrollTimer = setTimeout(function () {
          return _this2._autoScroll(_this2, state);
        }, 0);
      }
    },
    // -------------------------------- on change ----------------------------------
    _onChange: debounce(function (target, e, evt) {
      if (!dragEl) return;

      if (!lastChild(this.el)) {
        differ.to = {
          sortable: this,
          group: this.el,
          node: dragEl,
          rect: getRect(dragEl),
          offset: getOffset(dragEl)
        }; // onRemove callback

        differ.from.sortable._dispatchEvent('onRemove', _objectSpread2(_objectSpread2({}, differ), {}, {
          event: e,
          originalEvent: evt
        })); // onAdd callback


        this._dispatchEvent('onAdd', _objectSpread2(_objectSpread2({}, differ), {}, {
          event: e,
          originalEvent: evt
        }));

        this.el.appendChild(dragEl);
        differ.from.sortable = this;
        differ.from.group = this.el;
      } else {
        var _getElement2 = getElement(rootEl, target),
            el = _getElement2.el,
            rect = _getElement2.rect,
            offset = _getElement2.offset;

        if (!el || el && el.animated || el === dragEl) return;
        dropEl = el;
        differ.to = {
          sortable: this,
          group: this.el,
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

          if (isChildOf(dragEl, rootEl) === false) {
            // onRemove callback
            differ.from.sortable._dispatchEvent('onRemove', _objectSpread2(_objectSpread2({}, differ), {}, {
              event: e,
              originalEvent: evt
            })); // onAdd callback


            this._dispatchEvent('onAdd', _objectSpread2(_objectSpread2({}, differ), {}, {
              event: e,
              originalEvent: evt
            }));

            this.el.insertBefore(dragEl, el);
            differ.from.sortable = this;
            differ.from.group = this.el;
          } else {
            // onChange callback
            this._dispatchEvent('onChange', _objectSpread2(_objectSpread2({}, differ), {}, {
              event: e,
              originalEvent: evt
            })); // the top value is compared first, and the left is compared if the top value is the same


            var _offset = getOffset(dragEl);

            if (_offset.top < offset.top || _offset.left < offset.left) {
              this.el.insertBefore(dragEl, el.nextElementSibling);
            } else {
              this.el.insertBefore(dragEl, el);
            }

            differ.from.sortable = this;
            differ.from.group = this.el;
          }

          this._rangeAnimate();
        }
      }
    }, 5),
    // -------------------------------- on drop ----------------------------------
    _onDrop: function _onDrop(
    /** Event|TouchEvent */
    evt) {
      this._unbindDragEvents();

      this._unbindMoveEvents();

      this._unbindDropEvents();

      this._preventEvent(evt);

      this.dragStartTimer && clearTimeout(this.dragStartTimer);

      if (dragEl) {
        if (this.nativeDraggable) off(dragEl, 'dragend', this);

        var _getEvent3 = getEvent(evt),
            touch = _getEvent3.touch; // clear style, attrs and class


        toggleClass(dragEl, this.options.chosenClass, false);
        if (this.nativeDraggable) dragEl.draggable = false;
        if (touch) dragEl.style['touch-action'] = '';
        dragEl.style['will-change'] = '';

        if (state.sortableDown && state.sortableMove) {
          // re-acquire the offset and rect values of the dragged element as the value after the drag is completed
          differ.to.offset = getOffset(dragEl);
          differ.to.rect = getRect(dragEl);
          var changed = offsetChanged(differ.from.offset, differ.to.offset);

          this._dispatchEvent('onDrop', {
            changed: changed,
            event: evt,
            originalEvent: evt
          });
        }
      }

      if (Safari) css(document.body, 'user-select', '');
      this.ghost.destroy(differ.to.rect);

      this._clearState();
    },
    // -------------------------------- event ----------------------------------
    _preventEvent: function _preventEvent(evt) {
      if (this.options.stopPropagation) evt.stopPropagation && evt.stopPropagation(); // prevent events from bubbling

      evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault();
    },
    _dispatchEvent: function _dispatchEvent(event, params) {
      var callback = this.options[event];
      if (typeof callback === 'function') callback(params);
    },
    // -------------------------------- clear ----------------------------------
    _clearState: function _clearState() {
      state = new State();
      differ.destroy();
      dragEl = dropEl = ghostEl = fromGroup = activeGroup = null;
      lastPosition = {
        x: 0,
        y: 0
      };
    },
    _unbindDragEvents: function _unbindDragEvents() {
      if (this.nativeDraggable) {
        off(this.el, 'dragstart', this._onDragStart);
        off(this.el, 'dragover', this._onDragOver);
        off(this.el, 'dragend', this._onDrop);
        off(document, 'drop', this);
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

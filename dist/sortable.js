/*!
 * sortable-dnd v0.2.3
 * open source under the MIT license
 * https://github.com/mfuu/sortable-dnd#readme
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Sortable = factory());
})(this, (function () { 'use strict';

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
    var children = _toConsumableArray(Array.from(group.children)); // 如果能直接在子元素中找到，返回对应的index


    var index = children.indexOf(el);
    if (index > -1) return onlyEl ? children[index] : {
      index: index,
      el: children[index],
      rect: getRect(children[index]),
      offset: getOffset(children[index])
    }; // children 中无法直接找到对应的dom时，需要向下寻找

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

  var _throttleTimeout;

  function throttle(callback, ms) {
    return function () {
      if (!_throttleTimeout) {
        var args = arguments,
            _this = this;

        if (args.length === 1) {
          callback.call(_this, args[0]);
        } else {
          callback.apply(_this, args);
        }

        _throttleTimeout = setTimeout(function () {
          _throttleTimeout = void 0;
        }, ms);
      }
    };
  }
  function _nextTick(fn) {
    return setTimeout(fn, 0);
  }

  var State = /*#__PURE__*/_createClass(function State() {
    _classCallCheck(this, State);

    this.sortableDown = undefined;
    this.sortableMove = undefined;
    this.animationEnd = undefined;
  });
  /**
   * 拖拽前后差异初始化
   */

  var Differ = /*#__PURE__*/function () {
    function Differ() {
      _classCallCheck(this, Differ);

      this.from = {
        node: null,
        rect: {},
        offset: {}
      };
      this.to = {
        node: null,
        rect: {},
        offset: {}
      };
    }

    _createClass(Differ, [{
      key: "get",
      value: function get(key) {
        return this[key];
      }
    }, {
      key: "set",
      value: function set(key, value) {
        this[key] = value;
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.from = {
          node: null,
          rect: {},
          offset: {}
        };
        this.to = {
          node: null,
          rect: {},
          offset: {}
        };
      }
    }]);

    return Differ;
  }();
  /**
   * 拖拽中的元素
   */

  var Ghost = /*#__PURE__*/function () {
    function Ghost(sortable) {
      _classCallCheck(this, Ghost);

      this.$el = null;
      this.distance = {
        x: 0,
        y: 0
      };
      this.options = sortable.options;
      this.container = sortable.container;
    }

    _createClass(Ghost, [{
      key: "init",
      value: function init(el, rect) {
        this.$el = el;
        var _this$options = this.options,
            ghostClass = _this$options.ghostClass,
            _this$options$ghostSt = _this$options.ghostStyle,
            ghostStyle = _this$options$ghostSt === void 0 ? {} : _this$options$ghostSt;
        toggleClass(this.$el, ghostClass, true);
        css(this.$el, 'box-sizing', 'border-box');
        css(this.$el, 'margin', 0);
        css(this.$el, 'top', rect.top);
        css(this.$el, 'left', rect.left);
        css(this.$el, 'width', rect.width);
        css(this.$el, 'height', rect.height);
        css(this.$el, 'opacity', '0.8'); // css(this.$el, 'position', IOS ? 'absolute' : 'fixed')

        css(this.$el, 'position', 'fixed');
        css(this.$el, 'zIndex', '100000');
        css(this.$el, 'pointerEvents', 'none');
        this.setStyle(ghostStyle);
        setTransition(this.$el, 'none');
        setTransform(this.$el, 'translate3d(0px, 0px, 0px)');
        this.container.appendChild(this.$el);
        css(this.$el, 'transform-origin', this.distance.x / parseInt(this.$el.style.width) * 100 + '% ' + this.distance.y / parseInt(this.$el.style.height) * 100 + '%');
      }
    }, {
      key: "setStyle",
      value: function setStyle(style) {
        for (var key in style) {
          css(this.$el, key, style[key]);
        }
      }
    }, {
      key: "rect",
      value: function rect() {
        return getRect(this.$el);
      }
    }, {
      key: "move",
      value: function move(x, y) {
        var smooth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        if (!this.$el) return;
        setTransition(this.$el, smooth ? "".concat(this.options.ghostAnimation, "ms") : 'none');
        setTransform(this.$el, "translate3d(".concat(x, "px, ").concat(y, "px, 0)"));
      }
    }, {
      key: "destroy",
      value: function destroy(rect) {
        var _this = this;

        var left = parseInt(this.$el.style.left);
        var top = parseInt(this.$el.style.top);
        this.move(rect.left - left, rect.top - top, true);
        var ghostAnimation = this.options.ghostAnimation;
        ghostAnimation ? setTimeout(function () {
          return _this.clear();
        }, ghostAnimation) : this.clear();
      }
    }, {
      key: "clear",
      value: function clear() {
        this.$el && this.$el.remove();
        this.distance = {
          x: 0,
          y: 0
        };
        this.$el = null;
      }
    }]);

    return Ghost;
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
      captureAnimationState: function captureAnimationState() {
        var children = _toConsumableArray(Array.from(this.rootEl.children));

        var _getRange = getRange(children, this.dragEl, this.dropEl),
            start = _getRange.start,
            end = _getRange.end;

        animationState.length = 0; // 重置

        children.slice(start, end + 1).forEach(function (child) {
          animationState.push({
            target: child,
            rect: getRect(child)
          });
        });
      },
      animateRange: function animateRange() {
        var _this = this;

        animationState.forEach(function (state) {
          var target = state.target,
              rect = state.rect;

          _this.animate(target, rect, _this.options.animation);
        });
      },
      animate: function animate(el, preRect) {
        var animation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 150;
        var curRect = getRect(el);
        var left = preRect.left - curRect.left;
        var top = preRect.top - curRect.top;
        setTransition(el, 'none');
        setTransform(el, "translate3d(".concat(left, "px, ").concat(top, "px, 0)"));
        el.offsetLeft; // 触发重绘

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

  function DNDEvent() {
    return {
      _bindEventListener: function _bindEventListener() {
        var _this$options = this.options,
            supportPointer = _this$options.supportPointer,
            supportTouch = _this$options.supportTouch;

        if (supportPointer) {
          on(this.rootEl, 'pointerdown', this._onStart);
        } else if (supportTouch) {
          on(this.rootEl, 'touchstart', this._onStart);
        } else {
          on(this.rootEl, 'mousedown', this._onStart);
        }
      },
      _unbindEventListener: function _unbindEventListener() {
        off(this.rootEl, 'pointerdown', this._onStart);
        off(this.rootEl, 'touchstart', this._onStart);
        off(this.rootEl, 'mousedown', this._onStart);
      },
      _bindMoveEvents: function _bindMoveEvents(touch) {
        if (this.options.supportPointer) {
          on(this.ownerDocument, 'pointermove', this._onMove);
        } else if (touch) {
          on(this.ownerDocument, 'touchmove', this._onMove);
        } else {
          on(this.ownerDocument, 'mousemove', this._onMove);
        }
      },
      _bindUpEvents: function _bindUpEvents() {
        on(this.ownerDocument, 'pointerup', this._onDrop);
        on(this.ownerDocument, 'pointercancel', this._onDrop);
        on(this.ownerDocument, 'touchend', this._onDrop);
        on(this.ownerDocument, 'touchcancel', this._onDrop);
        on(this.ownerDocument, 'mouseup', this._onDrop);
      },
      _unbindMoveEvents: function _unbindMoveEvents() {
        off(this.ownerDocument, 'pointermove', this._onMove);
        off(this.ownerDocument, 'touchmove', this._onMove);
        off(this.ownerDocument, 'mousemove', this._onMove);
      },
      _unbindUpEvents: function _unbindUpEvents() {
        off(this.ownerDocument, 'pointerup', this._onDrop);
        off(this.ownerDocument, 'pointercancel', this._onDrop);
        off(this.ownerDocument, 'touchend', this._onDrop);
        off(this.ownerDocument, 'touchcancel', this._onDrop);
        off(this.ownerDocument, 'mouseup', this._onDrop);
      }
    };
  }

  var documentExists = typeof document !== 'undefined';
  var supportDraggable = documentExists && !ChromeForAndroid && !IOS && 'draggable' in document.createElement('div');
  /**
   * @class  Sortable
   * @param  {HTMLElement}  el group element
   * @param  {Object}       options
   */

  function Sortable(el, options) {
    if (!(el && el.nodeType && el.nodeType === 1)) {
      throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
    }

    this.rootEl = el; // root element

    this.scrollEl = getParentAutoScrollElement(el, true); // scroll element

    this.options = options = Object.assign({}, options);
    this.ownerDocument = el.ownerDocument;
    var defaults = {
      autoScroll: true,
      // 拖拽到容器边缘时自动滚动
      scrollStep: 3,
      // 每一帧滚动的距离
      scrollThreshold: 20,
      // 自动滚动的阈值
      delay: 0,
      // 定义鼠标选中列表单元可以开始拖动的延迟时间
      delayOnTouchOnly: false,
      // only delay if user is using touch
      disabled: false,
      // 定义是否此sortable对象是否可用，为true时sortable对象不能拖放排序等功能，为false时为可以进行排序，相当于一个开关
      animation: 150,
      // 定义排序动画的时间
      ghostAnimation: 0,
      // 拖拽元素销毁时动画效果
      ghostClass: '',
      // 拖拽元素Class类名
      ghostStyle: {},
      // 拖拽元素样式
      chosenClass: '',
      // 选中元素样式
      draggable: undefined,
      // String: css选择器, Function: (e) => return true
      dragging: undefined,
      // 设置拖拽元素，必须为函数且必须返回一个 HTMLElement: (e) => return e.target
      onDrag: undefined,
      // 拖拽开始时触发的回调函数: () => {}
      onMove: undefined,
      // 拖拽过程中的回调函数: (from, to) => {}
      onDrop: undefined,
      // 拖拽完成时的回调函数: (from, to, changed) => {}
      onChange: undefined,
      // 拖拽元素改变位置的时候: (from, to) => {}
      fallbackOnBody: false,
      forceFallback: false,
      // 忽略 HTML5拖拽行为，强制回调进行
      stopPropagation: false,
      // 阻止捕获和冒泡阶段中当前事件的进一步传播
      supportPointer: 'PointerEvent' in window && !Safari,
      supportTouch: 'ontouchstart' in window
    }; // Set default options

    for (var name in defaults) {
      !(name in this.options) && (this.options[name] = defaults[name]);
    }

    this.container = this.options.fallbackOnBody ? document.body : this.rootEl;
    this.nativeDraggable = this.options.forceFallback ? false : supportDraggable;
    this.move = {
      x: 0,
      y: 0
    };
    this.state = new State(); // 拖拽过程中状态记录

    this.differ = new Differ(); // 记录拖拽前后差异

    this.ghost = new Ghost(this); // 拖拽时蒙版元素

    this.dragEl = null; // 拖拽元素

    this.dropEl = null; // 释放元素

    this.dragStartTimer = null; // setTimeout timer

    Object.assign(this, Animation(), DNDEvent());
    this._onStart = this._onStart.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onDrop = this._onDrop.bind(this);

    this._bindEventListener();

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function (callback) {
        return setTimeout(callback, 17);
      };
    }
  }

  Sortable.prototype = {
    constructor: Sortable,

    /**
     * Destroy
     */
    destroy: function destroy() {
      this._unbindEventListener();

      this._clearState();
    },
    // -------------------------------- prepare start ----------------------------------
    _onStart: function _onStart(
    /** Event|TouchEvent */
    evt) {
      var _this2 = this;

      var _this$options = this.options,
          delay = _this$options.delay,
          disabled = _this$options.disabled,
          stopPropagation = _this$options.stopPropagation,
          delayOnTouchOnly = _this$options.delayOnTouchOnly;
      if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0 || disabled) return; // only left button and enabled

      var touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === 'touch' && evt;
      var e = touch || evt; // Safari ignores further event handling after mousedown

      if (!this.nativeDraggable && Safari && e.target && e.target.tagName.toUpperCase() === 'SELECT') return;
      if (e.target === this.rootEl) return true;
      if (stopPropagation) evt.stopPropagation();

      if (delay && (!delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
        clearTimeout(this.dragStartTimer);
        this.dragStartTimer = setTimeout(function () {
          return _this2._onDrag(e, touch);
        }, delay);
      } else {
        this._onDrag(e, touch);
      }
    },
    _onDrag: function _onDrag(
    /** Event|TouchEvent */
    e, touch) {
      var _this$options2 = this.options,
          draggable = _this$options2.draggable,
          dragging = _this$options2.dragging;

      if (typeof draggable === 'function') {
        if (!draggable(e)) return true;
      } else if (typeof draggable === 'string') {
        if (!matches(e.target, draggable)) return true;
      } else if (draggable !== undefined) {
        throw new Error("draggable expected \"function\" or \"string\" but received \"".concat(_typeof(draggable), "\""));
      }

      this._removeSelection(); // 获取拖拽元素                 


      if (dragging) {
        if (typeof dragging === 'function') this.dragEl = dragging(e);else throw new Error("dragging expected \"function\" or \"string\" but received \"".concat(_typeof(dragging), "\""));
      } else {
        this.dragEl = getElement(this.rootEl, e.target, true);
      } // 不存在拖拽元素时不允许拖拽


      if (!this.dragEl || this.dragEl.animated) return true; // 解决移动端无法拖拽问题

      css(this.dragEl, 'touch-action', 'none'); // 获取拖拽元素在列表中的位置

      var _getElement = getElement(this.rootEl, this.dragEl),
          rect = _getElement.rect,
          offset = _getElement.offset;

      this.move = {
        x: e.clientX,
        y: e.clientY
      };
      this.ghost.distance = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      this.differ.from = {
        node: this.dragEl,
        rect: rect,
        offset: offset
      };
      this.state.sortableDown = e;

      this._bindMoveEvents(touch);

      this._bindUpEvents(touch);
    },
    // -------------------------------- is started ----------------------------------
    _onStarted: function _onStarted(e,
    /** originalEvent */
    evt) {
      var onDrag = this.options.onDrag;
      var rect = this.differ.from.rect; // 将初始化放到move事件中，防止与click事件冲突

      if (!this.ghost.$el) {
        this.ghost.init(this.dragEl.cloneNode(true), rect); // onDrag callback

        if (onDrag && typeof onDrag === 'function') onDrag(this.dragEl, e, evt);
      }

      if (Safari) {
        css(document.body, 'user-select', 'none');
      }
    },
    // -------------------------------- on move ----------------------------------
    _onMove: function _onMove(
    /** Event|TouchEvent */
    evt) {
      var touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === 'touch' && evt;
      var e = touch || evt;
      var clientX = e.clientX,
          clientY = e.clientY;
      var target = touch ? document.elementFromPoint(clientX, clientY) : e.target;
      var distanceX = clientX - this.move.x;
      var distanceY = clientY - this.move.y;

      if (clientX !== void 0 && Math.abs(distanceX) <= 0 && clientY !== void 0 && Math.abs(distanceY) <= 0) {
        return;
      }

      var stopPropagation = this.options.stopPropagation;
      stopPropagation && evt.stopPropagation && evt.stopPropagation(); // 阻止事件冒泡

      evt.preventDefault !== void 0 && evt.cancelable && evt.preventDefault(); // prevent scrolling

      this._onStarted(e, evt);

      this.ghost.move(distanceX, distanceY); // 拖拽过程中触发的回调

      var onMove = this.options.onMove;
      if (onMove && typeof onMove === 'function') onMove(this.differ.from, this.ghost.$el, e, evt);
      toggleClass(this.dragEl, this.options.chosenClass, true);
      if (!this.state.sortableDown) return;
      if (clientX < 0 || clientY < 0) return;
      this.state.sortableMove = e; // 判断边界值

      var rc = getRect(this.rootEl);

      if (clientX < rc.left || clientX > rc.right || clientY < rc.top || clientY > rc.bottom) {
        return;
      } // check if element will exchange


      this._onChange(this, target, e, evt); // auto scroll


      this.options.autoScroll && this._autoScroll();
    },
    _onChange: throttle(function (_this, target, e, evt) {
      var _getElement2 = getElement(_this.rootEl, target),
          el = _getElement2.el,
          rect = _getElement2.rect,
          offset = _getElement2.offset;

      if (!el || el && el.animated) return;
      _this.dropEl = el;
      var clientX = e.clientX,
          clientY = e.clientY;
      var left = rect.left,
          right = rect.right,
          top = rect.top,
          bottom = rect.bottom;

      if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
        // 拖拽前后元素不一致时交换
        if (el !== _this.dragEl) {
          _this.differ.to = {
            node: _this.dropEl,
            rect: rect,
            offset: offset
          };

          _this.captureAnimationState();

          var onChange = _this.options.onChange;

          var _offset = getOffset(_this.dragEl); // 获取拖拽元素的 offset 值
          // 元素发生位置交换时触发的回调


          if (onChange && typeof onChange === 'function') onChange(_this.differ.from, _this.differ.to, e, evt); // 优先比较 top 值，top 值相同再比较 left

          if (_offset.top < offset.top || _offset.left < offset.left) {
            _this.rootEl.insertBefore(_this.dragEl, el.nextElementSibling);
          } else {
            _this.rootEl.insertBefore(_this.dragEl, el);
          }

          _this.animateRange();
        }
      }
    }, 5),
    // -------------------------------- on drop ----------------------------------
    _onDrop: function _onDrop(
    /** Event|TouchEvent */
    evt) {
      this._unbindMoveEvents();

      this._unbindUpEvents();

      clearTimeout(this.dragStartTimer);
      var _this$options3 = this.options,
          onDrop = _this$options3.onDrop,
          chosenClass = _this$options3.chosenClass,
          stopPropagation = _this$options3.stopPropagation;
      stopPropagation && evt.stopPropagation(); // 阻止事件冒泡

      evt.cancelable && evt.preventDefault();
      toggleClass(this.dragEl, chosenClass, false);
      css(this.dragEl, 'touch-action', '');

      if (this.state.sortableDown && this.state.sortableMove) {
        // 重新获取一次拖拽元素的 offset 和 rect 值作为拖拽完成后的值
        this.differ.to.offset = getOffset(this.dragEl);
        this.differ.to.rect = getRect(this.dragEl);
        var _this$differ = this.differ,
            from = _this$differ.from,
            to = _this$differ.to; // 通过 offset 比较是否进行了元素交换

        var changed = from.offset.top !== to.offset.top || from.offset.left !== to.offset.left; // onDrop callback

        if (onDrop && typeof onDrop === 'function') onDrop(changed, evt);
        this.ghost.destroy(to.rect);
      } // Safari


      if (Safari) css(document.body, 'user-select', '');
      this.differ.destroy();
      this.state = new State();
    },
    // -------------------------------- auto scroll ----------------------------------
    _autoScroll: function _autoScroll() {
      var _this3 = this;

      // check if is moving now
      if (!this.state.sortableMove) return;
      var _this$state$sortableM = this.state.sortableMove,
          clientX = _this$state$sortableM.clientX,
          clientY = _this$state$sortableM.clientY;
      if (clientX === void 0 || clientY === void 0) return;

      if (this.scrollEl === this.ownerDocument) ; else {
        var _this$scrollEl = this.scrollEl,
            scrollTop = _this$scrollEl.scrollTop,
            scrollLeft = _this$scrollEl.scrollLeft,
            scrollHeight = _this$scrollEl.scrollHeight,
            scrollWidth = _this$scrollEl.scrollWidth;

        var _getRect = getRect(this.scrollEl),
            top = _getRect.top,
            right = _getRect.right,
            bottom = _getRect.bottom,
            left = _getRect.left;

        var _this$options4 = this.options,
            scrollStep = _this$options4.scrollStep,
            scrollThreshold = _this$options4.scrollThreshold;

        if (scrollTop > 0 && clientY >= top && clientY <= top + scrollThreshold) {
          // to top
          requestAnimationFrame(function () {
            _this3.scrollEl.scrollTo(scrollLeft, scrollTop - scrollStep);

            _this3._autoScroll();
          });
        } else if (scrollLeft <= scrollWidth && clientX <= right && clientX >= right - scrollThreshold) {
          // to right
          requestAnimationFrame(function () {
            _this3.scrollEl.scrollTo(scrollLeft + scrollStep, scrollTop);

            _this3._autoScroll();
          });
        } else if (scrollTop <= scrollHeight && clientY <= bottom && clientY >= bottom - scrollThreshold) {
          // to bottom
          requestAnimationFrame(function () {
            _this3.scrollEl.scrollTo(scrollLeft, scrollTop + scrollStep);

            _this3._autoScroll();
          });
        } else if (scrollLeft > 0 && clientX >= left && clientX <= left + scrollThreshold) {
          // to left
          requestAnimationFrame(function () {
            _this3.scrollEl.scrollTo(scrollLeft - scrollStep, scrollTop);

            _this3._autoScroll();
          });
        }
      }
    },
    // -------------------------------- clear ----------------------------------
    _removeSelection: function _removeSelection() {
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
    _clearState: function _clearState() {
      this.dragEl = null;
      this.dropEl = null;
      this.state = new State();
      this.ghost.destroy();
      this.differ.destroy();
    }
  };

  return Sortable;

}));

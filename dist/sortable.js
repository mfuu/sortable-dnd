/*!
 * sortable-dnd v0.2.0
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

  function on(el, event, fn, sp) {
    if (window.addEventListener) {
      el.addEventListener(event, fn, sp || !IE11OrLess ? captureMode : false);
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

  function off(el, event, fn, sp) {
    if (window.removeEventListener) {
      el.removeEventListener(event, fn, sp || !IE11OrLess ? captureMode : false);
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
  function _nextTick(fn) {
    return setTimeout(fn, 0);
  }

  var CSS_TRANSITIONS = ['-webkit-transition', '-moz-transition', '-ms-transition', '-o-transition', 'transition'];
  var CSS_TRANSFORMS = ['-webkit-transform', '-moz-transform', '-ms-transform', '-o-transform', 'transform'];
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
        var children = _toConsumableArray(Array.from(this.$el.children));

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

          _this.animate(target, rect, _this.animation);
        });
      },
      animate: function animate(el, preRect) {
        var animation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 150;
        var curRect = getRect(el);
        var left = preRect.left - curRect.left;
        var top = preRect.top - curRect.top;
        CSS_TRANSITIONS.forEach(function (ts) {
          return css(el, ts, 'none');
        });
        CSS_TRANSFORMS.forEach(function (tf) {
          return css(el, tf, "".concat(tf.split('transform')[0], "translate3d(").concat(left, "px, ").concat(top, "px, 0)"));
        });
        el.offsetLeft; // 触发重绘

        CSS_TRANSITIONS.forEach(function (ts) {
          return css(el, ts, "".concat(ts.split('transition')[0], "transform ").concat(animation, "ms"));
        });
        CSS_TRANSFORMS.forEach(function (tf) {
          return css(el, tf, "".concat(tf.split('transform')[0], "translate3d(0px, 0px, 0px)"));
        });
        clearTimeout(el.animated);
        el.animated = setTimeout(function () {
          CSS_TRANSITIONS.forEach(function (ts) {
            return css(el, ts, '');
          });
          CSS_TRANSFORMS.forEach(function (tf) {
            return css(el, tf, '');
          });
          el.animated = null;
        }, animation);
      }
    };
  }

  function DNDEvent() {
    return {
      _bindEventListener: function _bindEventListener() {
        this._onStart = this._onStart.bind(this);
        this._onMove = this._onMove.bind(this);
        this._onDrop = this._onDrop.bind(this);
        var _this$options = this.options,
            supportPointer = _this$options.supportPointer,
            supportTouch = _this$options.supportTouch,
            supportPassive = _this$options.supportPassive;

        if (supportPointer) {
          on(this.$el, 'pointerdown', this._onStart, supportPassive);
        } else if (supportTouch) {
          on(this.$el, 'touchstart', this._onStart, supportPassive);
        } else {
          on(this.$el, 'mousedown', this._onStart, supportPassive);
        }

        if (this.nativeDraggable) {
          on(this.$el, 'dragover', this);
          on(this.$el, 'dragenter', this);
        }
      },
      _unbindEventListener: function _unbindEventListener() {
        var supportPassive = this.options.supportPassive;
        off(this.$el, 'pointerdown', this._onStart, supportPassive);
        off(this.$el, 'touchstart', this._onStart, supportPassive);
        off(this.$el, 'mousedown', this._onStart, supportPassive);

        if (this.nativeDraggable) {
          off(this.$el, 'dragover', this);
          off(this.$el, 'dragenter', this);
        }
      },
      _onMoveEvents: function _onMoveEvents(touch) {
        var _this$options2 = this.options,
            supportPointer = _this$options2.supportPointer,
            ownerDocument = _this$options2.ownerDocument,
            supportPassive = _this$options2.supportPassive;

        if (supportPointer) {
          on(ownerDocument, 'pointermove', this._onMove, supportPassive);
        } else if (touch) {
          on(ownerDocument, 'touchmove', this._onMove, supportPassive);
        } else {
          on(ownerDocument, 'mousemove', this._onMove, supportPassive);
        }
      },
      _onUpEvents: function _onUpEvents() {
        var _this$options3 = this.options,
            ownerDocument = _this$options3.ownerDocument,
            supportPassive = _this$options3.supportPassive;
        on(ownerDocument, 'pointerup', this._onDrop, supportPassive);
        on(ownerDocument, 'pointercancel', this._onDrop, supportPassive);
        on(ownerDocument, 'touchend', this._onDrop, supportPassive);
        on(ownerDocument, 'touchcancel', this._onDrop, supportPassive);
        on(ownerDocument, 'mouseup', this._onDrop, supportPassive);
      },
      _offMoveEvents: function _offMoveEvents() {
        var _this$options4 = this.options,
            ownerDocument = _this$options4.ownerDocument,
            supportPassive = _this$options4.supportPassive;
        off(ownerDocument, 'pointermove', this._onMove, supportPassive);
        off(ownerDocument, 'touchmove', this._onMove, supportPassive);
        off(ownerDocument, 'mousemove', this._onMove, supportPassive);
      },
      _offUpEvents: function _offUpEvents() {
        var _this$options5 = this.options,
            ownerDocument = _this$options5.ownerDocument,
            supportPassive = _this$options5.supportPassive;
        off(ownerDocument, 'pointerup', this._onDrop, supportPassive);
        off(ownerDocument, 'pointercancel', this._onDrop, supportPassive);
        off(ownerDocument, 'touchend', this._onDrop, supportPassive);
        off(ownerDocument, 'touchcancel', this._onDrop, supportPassive);
        off(ownerDocument, 'mouseup', this._onDrop, supportPassive);
      }
    };
  }

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
    function Ghost(options) {
      _classCallCheck(this, Ghost);

      this.options = options;
      this.x = 0;
      this.y = 0;
      this.exist = false;
    }

    _createClass(Ghost, [{
      key: "init",
      value: function init(el, rect) {
        if (!el) return;
        this.$el = el;
        var _this$options = this.options,
            ghostClass = _this$options.ghostClass,
            _this$options$ghostSt = _this$options.ghostStyle,
            ghostStyle = _this$options$ghostSt === void 0 ? {} : _this$options$ghostSt;
        var width = rect.width,
            height = rect.height;
        this.$el["class"] = ghostClass;
        this.$el.style.width = width + 'px';
        this.$el.style.height = height + 'px';
        this.$el.style.transform = '';
        this.$el.style.transition = '';
        this.$el.style.position = 'fixed';
        this.$el.style.left = 0;
        this.$el.style.top = 0;
        this.$el.style.zIndex = 100000;
        this.$el.style.opacity = 0.8;
        this.$el.style.pointerEvents = 'none';
        this.$el.style.cursor = 'move';
        this.setStyle(ghostStyle);
      }
    }, {
      key: "get",
      value: function get(key) {
        return this[key];
      }
    }, {
      key: "set",
      value: function set(key, value) {
        this[key] = value;
        this[key] = value;
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
        return this.$el.getBoundingClientRect();
      }
    }, {
      key: "move",
      value: function move(smooth) {
        var ghostAnimation = this.options.ghostAnimation;
        if (smooth) this.$el.style.transition = "all ".concat(ghostAnimation, "ms");else this.$el.style.transition = ''; // 将初始化放在 move 事件中，避免与鼠标点击事件冲突

        if (!this.exist) {
          document.body.appendChild(this.$el);
          this.exist = true;
        }

        this.$el.style.transform = "translate3d(".concat(this.x, "px, ").concat(this.y, "px, 0)");
        if (this.$el.style.cursor !== 'move') this.$el.style.cursor = 'move';
      }
    }, {
      key: "destroy",
      value: function destroy(rect) {
        var _this = this;

        if (rect) {
          this.x = rect.left;
          this.y = rect.top;
          this.move(true);
        }

        setTimeout(function () {
          if (_this.$el) _this.$el.remove();
          _this.$el = null;
          _this.x = 0;
          _this.y = 0;
          _this.exist = false;
        }, this.options.ghostAnimation);
      }
    }]);

    return Ghost;
  }(); // -------------------------------- Sortable ----------------------------------


  var documentExists = typeof document !== 'undefined';
  var supportDraggable = documentExists && !ChromeForAndroid && !IOS && 'draggable' in document.createElement('div');
  /**
   * @class  Sortable
   * @param  {HTMLElement}  el
   * @param  {Object}       options
   */

  function Sortable(el, options) {
    if (!(el && el.nodeType && el.nodeType === 1)) {
      throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
    }

    this.$el = el; // root element

    this.options = options = Object.assign({}, options);
    this.scrollEl = getParentAutoScrollElement(this.$el, true); // 获取页面滚动元素

    this.dragEl = null; // 拖拽元素

    this.dropEl = null; // 释放元素

    this.differ = null; // 记录拖拽前后差异

    this.ghost = null; // 拖拽时蒙版元素

    this.calcXY = {
      x: 0,
      y: 0
    }; // 记录拖拽移动时坐标

    var defaults = {
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
      forceFallback: false,
      // 忽略 HTML5拖拽行为，强制回调进行
      stopPropagation: false,
      // 阻止捕获和冒泡阶段中当前事件的进一步传播
      supportPassive: supportPassive(),
      supportPointer: 'PointerEvent' in window && !Safari,
      supportTouch: 'ontouchstart' in window,
      ownerDocument: this.$el.ownerDocument
    }; // Set default options

    for (var name in defaults) {
      !(name in this.options) && (this.options[name] = defaults[name]);
    }

    this.nativeDraggable = this.options.forceFallback ? false : supportDraggable;
    this.differ = new Differ();
    this.ghost = new Ghost(this.options);
    Object.assign(this, Animation(), DNDEvent());

    this._bindEventListener();

    this._handleDestroy();
  }

  Sortable.prototype = {
    constructor: Sortable,
    destroy: function destroy() {
      this._unbindEventListener();

      this._resetState();
    },
    // -------------------------------- drag and drop ----------------------------------
    _onStart: function _onStart(
    /** Event|TouchEvent */
    evt) {
      var _this$options2 = this.options,
          delay = _this$options2.delay,
          disabled = _this$options2.disabled,
          stopPropagation = _this$options2.stopPropagation,
          delayOnTouchOnly = _this$options2.delayOnTouchOnly;
      if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0 || disabled) return; // only left button and enabled

      var touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === 'touch' && evt;
      var e = touch || evt; // Safari ignores further event handling after mousedown

      if (!this.nativeDraggable && Safari && e.target && e.target.tagName.toUpperCase() === 'SELECT') return;
      if (e.target === this.$el) return true;
      if (evt.preventDefault !== void 0) evt.preventDefault();
      if (stopPropagation) evt.stopPropagation();

      if (delay && (!delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
        this.dragStartTimer = setTimeout(this._onDrag(e, touch), delay);
      } else {
        this._onDrag(e, touch);
      }
    },
    _onDrag: function _onDrag(
    /** Event|TouchEvent */
    e, touch) {
      var _this$options3 = this.options,
          draggable = _this$options3.draggable,
          dragging = _this$options3.dragging;

      if (typeof draggable === 'function') {
        if (!draggable(e)) return true;
      } else if (typeof draggable === 'string') {
        if (!matches(e.target, draggable)) return true;
      } else if (draggable !== undefined) {
        throw new Error("draggable expected \"function\" or \"string\" but received \"".concat(_typeof(draggable), "\""));
      }

      try {
        if (document.selection) {
          // Timeout neccessary for IE9
          _nextTick(function () {
            document.selection.empty();
          });
        } else {
          window.getSelection().removeAllRanges();
        }
      } catch (error) {
        throw new Error(error);
      } // 获取拖拽元素                 


      if (dragging) {
        if (typeof dragging === 'function') this.dragEl = dragging(e);else throw new Error("dragging expected \"function\" or \"string\" but received \"".concat(_typeof(dragging), "\""));
      } else {
        this.dragEl = getElement(this.$el, e.target, true);
      } // 不存在拖拽元素时不允许拖拽


      if (!this.dragEl || this.dragEl.animated) return true; // 获取拖拽元素在列表中的位置

      var _getElement = getElement(this.$el, this.dragEl),
          rect = _getElement.rect,
          offset = _getElement.offset;

      window.sortableDndOnDownState = true;
      this.ghost.set('x', rect.left);
      this.ghost.set('y', rect.top);
      this.differ.from = {
        node: this.dragEl,
        rect: rect,
        offset: offset
      };
      this.calcXY = {
        x: e.clientX,
        y: e.clientY
      };

      this._onMoveEvents(touch);

      this._onUpEvents(touch);
    },
    _onMove: function _onMove(
    /** Event|TouchEvent */
    evt) {
      if (evt.preventDefault !== void 0) evt.preventDefault(); // prevent scrolling

      var _this$options4 = this.options,
          chosenClass = _this$options4.chosenClass,
          stopPropagation = _this$options4.stopPropagation,
          onMove = _this$options4.onMove,
          onDrag = _this$options4.onDrag;
      if (stopPropagation) evt.stopPropagation();
      var touch = evt.touches && evt.touches[0];
      var e = touch || evt;
      var clientX = e.clientX,
          clientY = e.clientY;
      var target = touch ? document.elementFromPoint(clientX, clientY) : e.target; // 将初始化放到move事件中，防止与click事件冲突
      // 将拖拽元素克隆一份作为蒙版

      if (!this.ghost.$el) {
        this.ghost.init(this.dragEl.cloneNode(true), this.differ.from.rect);

        if (onDrag !== undefined) {
          if (typeof onDrag === 'function') onDrag(this.dragEl, e,
          /** originalEvent */
          evt);else throw new Error("onDrag expected \"function\" but received \"".concat(_typeof(onDrag), "\""));
        }
      } // 拖拽过程中触发的回调


      if (onMove !== undefined) {
        if (typeof onMove === 'function') onMove(this.differ.from, this.ghost.$el, e,
        /** originalEvent */
        evt);else throw new Error("onMove expected \"function\" but received \"".concat(_typeof(onMove), "\""));
      }

      toggleClass(this.dragEl, chosenClass, true);
      this.ghost.move();
      if (!window.sortableDndOnDownState) return;
      if (clientX < 0 || clientY < 0) return;
      window.sortableDndOnMoveState = true;
      this.ghost.set('x', this.ghost.x + clientX - this.calcXY.x);
      this.ghost.set('y', this.ghost.y + clientY - this.calcXY.y);
      this.calcXY = {
        x: clientX,
        y: clientY
      };
      this.ghost.move(); // 判断边界值

      var rc = getRect(this.$el);

      if (clientX < rc.left || clientX > rc.right || clientY < rc.top || clientY > rc.bottom) {
        this.ghost.setStyle({
          cursor: 'not-allowed'
        });
        return;
      }

      var _getElement2 = getElement(this.$el, target),
          index = _getElement2.index,
          el = _getElement2.el,
          rect = _getElement2.rect,
          offset = _getElement2.offset;

      var left = rect.left,
          right = rect.right,
          top = rect.top,
          bottom = rect.bottom;
      if (!el || index < 0 || top < 0) return; // 加上当前滚动距离

      var _this$scrollEl = this.scrollEl,
          scrollTop = _this$scrollEl.scrollTop,
          scrollLeft = _this$scrollEl.scrollLeft;
      var boundaryL = rc.left + scrollLeft;
      var boundaryT = rc.top + scrollTop; // 如果目标元素超出当前可视区，不允许拖动

      if (this.scrollEl !== this.$el && (rc.left < 0 || rc.top < 0)) {
        if (rc.top < 0 && top < boundaryT || rc.left < 0 && left < boundaryL) return;
      } else if (top < rc.top || left < rc.left) return;

      this.dropEl = el;

      if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
        // 拖拽前后元素不一致时交换
        if (el !== this.dragEl) {
          this.differ.to = {
            node: this.dropEl,
            rect: rect,
            offset: offset
          };
          if (el.animated) return;
          this.captureAnimationState();
          var onChange = this.options.onChange;

          var _offset = getOffset(this.dragEl); // 获取拖拽元素的 offset 值
          // 元素发生位置交换时触发的回调


          if (onChange !== undefined) {
            if (typeof onChange === 'function') onChange(this.differ.from, this.differ.to, e, evt);else throw new Error("onChange expected \"function\" but received \"".concat(_typeof(onChange), "\""));
          } // 优先比较 top 值，top 值相同再比较 left


          if (_offset.top < offset.top || _offset.left < offset.left) {
            this.$el.insertBefore(this.dragEl, el.nextElementSibling);
          } else {
            this.$el.insertBefore(this.dragEl, el);
          }

          this.animateRange();
        }
      }
    },
    _onDrop: function _onDrop(
    /** Event|TouchEvent */
    evt) {
      this._offMoveEvents();

      this._offUpEvents();

      clearTimeout(this.dragStartTimer);
      var _this$options5 = this.options,
          onDrop = _this$options5.onDrop,
          chosenClass = _this$options5.chosenClass,
          stopPropagation = _this$options5.stopPropagation;
      if (stopPropagation) evt.stopPropagation(); // 阻止事件冒泡

      toggleClass(this.dragEl, chosenClass, false);

      if (window.sortableDndOnDownState && window.sortableDndOnMoveState) {
        // 重新获取一次拖拽元素的 offset 和 rect 值作为拖拽完成后的值
        this.differ.to.offset = getOffset(this.dragEl);
        this.differ.to.rect = getRect(this.dragEl);
        var _this$differ = this.differ,
            from = _this$differ.from,
            to = _this$differ.to; // 通过 offset 比较是否进行了元素交换

        var changed = from.offset.top !== to.offset.top || from.offset.left !== to.offset.left; // 拖拽完成触发回调函数

        if (onDrop !== undefined) {
          if (typeof onDrop === 'function') onDrop(changed, evt);else throw new Error("onDrop expected \"function\" but received \"".concat(_typeof(onDrop), "\""));
        }

        this.ghost.destroy(getRect(this.dragEl));
      }

      this.differ.destroy();

      this._removeWindowState();
    },
    // -------------------------------- reset state ----------------------------------
    _resetState: function _resetState() {
      this.dragEl = null;
      this.dropEl = null;
      this.ghost.destroy();
      this.differ.destroy();
      this.calcXY = {
        x: 0,
        y: 0
      };

      this._removeWindowState();
    },
    _removeWindowState: function _removeWindowState() {
      window.sortableDndOnDownState = null;
      window.sortableDndOnMoveState = null;
      window.sortableDndAnimationEnd = null;
      delete window.sortableDndOnDownState;
      delete window.sortableDndOnMoveState;
      delete window.sortableDndAnimationEnd;
    },
    // -------------------------------- auto destroy ----------------------------------
    _handleDestroy: function _handleDestroy() {
      var _this2 = this;

      var observer = null;
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

      if (MutationObserver) {
        var ownerDocument = this.options.ownerDocument;
        if (!ownerDocument) return;
        observer = new MutationObserver(function () {
          if (!ownerDocument.body.contains(_this2.$el)) {
            observer.disconnect();
            observer = null;

            _this2._unbindEventListener();

            _this2._resetState();
          }
        });
        observer.observe(this.$el.parentNode, {
          childList: true,
          // 观察目标子节点的变化，是否有添加或者删除
          attributes: false,
          // 观察属性变动
          subtree: false // 观察后代节点，默认为 false

        });
      }

      window.onbeforeunload = function () {
        if (observer) observer.disconnect();
        observer = null;

        _this2._unbindEventListener();

        _this2._resetState();
      };
    }
  };

  return Sortable;

}));

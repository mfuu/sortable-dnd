/*!
 * sortable-dnd v0.0.9
 * open source under the MIT license
 * https://github.com/mfuu/sortable-dnd#readme
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Sortable = factory());
})(this, (function () { 'use strict';

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
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);

  var captureMode = {
    capture: false,
    passive: false
  };
  var R_SPACE = /\s+/g;
  var utils = {
    /**
     * add specified event listener
     * @param {HTMLElement} el 
     * @param {String} event 
     * @param {Function} fn 
     */
    on: function on(el, event, fn) {
      el.addEventListener(event, fn, !IE11OrLess && captureMode);
    },

    /**
     * remove specified event listener
     * @param {HTMLElement} el 
     * @param {String} event 
     * @param {Function} fn 
     */
    off: function off(el, event, fn) {
      el.removeEventListener(event, fn, !IE11OrLess && captureMode);
    },
    getWindowScrollingElement: function getWindowScrollingElement() {
      var scrollingElement = document.scrollingElement;

      if (scrollingElement) {
        return scrollingElement;
      } else {
        return document.documentElement;
      }
    },

    /**
     * get specified element's index in group
     * @param {HTMLElement} group 
     * @param {HTMLElement} el 
     * @returns {Number} index
     */
    index: function index(group, el) {
      if (!el || !el.parentNode) return -1;

      var children = _toConsumableArray(Array.from(group.children));

      return children.indexOf(el);
    },

    /**
     * Returns the "bounding client rect" of given element
     * @param {HTMLElement} el  The element whose boundingClientRect is wanted
     */
    getRect: function getRect(el) {
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

      if (el !== window && el.parentNode && el !== this.getWindowScrollingElement()) {
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
    },

    /**
     * get target Element in group
     * @param {HTMLElement} group 
     * @param {HTMLElement} el 
     */
    getElement: function getElement(group, el) {
      var result = {
        index: -1,
        el: null,
        rect: {}
      };

      var children = _toConsumableArray(Array.from(group.children)); // 如果能直接在子元素中找到，返回对应的index


      var index = children.indexOf(el);
      if (index > -1) Object.assign(result, {
        index: index,
        el: children[index],
        rect: this.getRect(children[index])
      }); // children 中无法直接找到对应的dom时，需要向下寻找

      for (var i = 0; i < children.length; i++) {
        if (this.isChildOf(el, children[i])) Object.assign(result, {
          index: i,
          el: children[i],
          rect: this.getRect(children[i])
        });
      }

      return result;
    },

    /**
     * Check if child element is contained in parent element
     * @param {HTMLElement} child 
     * @param {HTMLElement} parent 
     * @returns {Boolean} true | false
     */
    isChildOf: function isChildOf(child, parent) {
      var parentNode;

      if (child && parent) {
        parentNode = child.parentNode;

        while (parentNode) {
          if (parent === parentNode) return true;
          parentNode = parentNode.parentNode;
        }
      }

      return false;
    },

    /**
     * add or remove element's class
     * @param {HTMLElement} el element
     * @param {String} name class name
     * @param {Boolean} state true: add, false: remove
     */
    toggleClass: function toggleClass(el, name, state) {
      if (el && name) {
        if (el.classList) {
          el.classList[state ? 'add' : 'remove'](name);
        } else {
          var className = (' ' + el.className + ' ').replace(R_SPACE, ' ').replace(' ' + name + ' ', ' ');
          el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ');
        }
      }
    },

    /**
     * Check if a DOM element matches a given selector
     * @param {HTMLElement} el 
     * @param {String} selector 
     * @returns 
     */
    matches: function matches(el, selector) {
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
    },
    css: function css(el, prop, val) {
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
    },
    debounce: function debounce(fn, delay) {
      return function () {
        var _this = this;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        clearTimeout(fn.id);
        fn.id = setTimeout(function () {
          fn.call.apply(fn, [_this].concat(args));
        }, delay);
      };
    },
    _nextTick: function _nextTick(fn) {
      return setTimeout(fn, 0);
    }
  };

  function Animation() {
    var animationState = [];
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
            rect: utils.getRect(child)
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
        var curRect = utils.getRect(el);
        var left = preRect.left - curRect.left;
        var top = preRect.top - curRect.top;
        utils.css(el, 'transition', 'none');
        utils.css(el, 'transform', "translate3d(".concat(left, "px, ").concat(top, "px, 0)"));
        el.offsetLeft; // 触发重绘

        utils.css(el, 'transition', "all ".concat(animation, "ms"));
        utils.css(el, 'transform', 'translate3d(0px, 0px, 0px)');
        clearTimeout(el.animated);
        el.animated = setTimeout(function () {
          utils.css(el, 'transition', '');
          utils.css(el, 'transform', '');
          el.animated = null;
        }, animation);
      }
    };
  }

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

  /**
   * 拖拽前后差异初始化
   */

  var Diff = /*#__PURE__*/function () {
    function Diff() {
      _classCallCheck(this, Diff);

      this.old = {
        node: null,
        rect: {}
      };
      this["new"] = {
        node: null,
        rect: {}
      };
    }

    _createClass(Diff, [{
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
        this.old = {
          node: null,
          rect: {}
        };
        this["new"] = {
          node: null,
          rect: {}
        };
      }
    }]);

    return Diff;
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
        this.rect = rect;
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

        for (var key in ghostStyle) {
          utils.css(this.$el, key, ghostStyle[key]);
        }
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
      key: "move",
      value: function move() {
        // 将初始化放在 move 事件中，避免与鼠标点击事件冲突
        if (!this.exist) {
          document.body.appendChild(this.$el);
          this.exist = true;
        }

        this.$el.style.transform = "translate3d(".concat(this.x, "px, ").concat(this.y, "px, 0)");
      }
    }, {
      key: "destroy",
      value: function destroy() {
        if (this.$el) this.$el.remove();
        this.exist = false;
      }
    }]);

    return Ghost;
  }();

  var Sortable = /*#__PURE__*/function () {
    function Sortable(el, options) {
      _classCallCheck(this, Sortable);

      this.$el = el; // 列表容器元素

      this.options = options = Object.assign({}, options);
      this.dragEl = null; // 拖拽元素

      this.dropEl = null; // 释放元素

      this.diff = null; // 记录拖拽前后差异

      this.ghost = null; // 拖拽时蒙版元素

      this.calcXY = {
        x: 0,
        y: 0
      }; // 记录拖拽移动时坐标

      utils.debounce(this.init(), 50); // 避免重复执行多次
    }

    _createClass(Sortable, [{
      key: "init",
      value: function init() {
        if (!this.$el) {
          console.error('Sortable-dnd Error: container element is required');
          return;
        }

        var defaults = {
          animation: 150,
          // 动画延时
          ghostClass: '',
          ghostStyle: {},
          chosenClass: '',
          draggable: '',
          // String: class, Function: (e) => return true
          dragging: null,
          // 必须为函数且必须返回一个 HTMLElement (e) => return e.target
          dragEnd: null,
          // 拖拽完成时的回调函数，返回两个值(olddom, newdom) => {}
          supportPointer: 'PointerEvent' in window && !Safari,
          ownerDocument: this.$el.ownerDocument
        }; // Set default options

        for (var name in defaults) {
          !(name in this.options) && (this.options[name] = defaults[name]);
        }

        this.diff = new Diff();
        this.ghost = new Ghost(this.options);
        Object.assign(this, Animation());

        this._bindEventListener();
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this._unbindEventListener();

        this._resetState();
      }
    }, {
      key: "_bindEventListener",
      value: function _bindEventListener() {
        this._onStart = this._onStart.bind(this);
        this._onMove = this._onMove.bind(this);
        this._onDrop = this._onDrop.bind(this);
        var supportPointer = this.options.supportPointer;

        if (supportPointer) {
          utils.on(this.$el, 'pointerdown', this._onStart);
        } else {
          utils.on(this.$el, 'mousedown', this._onStart);
          utils.on(this.$el, 'touchstart', this._onStart);
        }
      }
    }, {
      key: "_unbindEventListener",
      value: function _unbindEventListener() {
        utils.off(this.$el, 'pointerdown', this._onStart);
        utils.off(this.$el, 'touchstart', this._onStart);
        utils.off(this.$el, 'mousedown', this._onStart);
      }
    }, {
      key: "_onStart",
      value: function _onStart(evt) {
        var _this$options2 = this.options,
            dragging = _this$options2.dragging,
            draggable = _this$options2.draggable;
        var touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === 'touch' && evt;
        var target = (touch || evt).target;

        if (typeof draggable === 'function') {
          if (!draggable(touch || evt)) return true;
        } else if (draggable) {
          if (!utils.matches(target, draggable)) return true;
        }

        if (/mousedown|pointerdown/.test(evt.type) && evt.button !== 0) return; // only left button and enabled

        if (target === this.$el) return true;

        try {
          if (document.selection) {
            // Timeout neccessary for IE9
            utils._nextTick(function () {
              document.selection.empty();
            });
          } else {
            window.getSelection().removeAllRanges();
          } // 获取拖拽元素


          var element = dragging && typeof dragging === 'function' ? dragging(touch || evt) : utils.getElement(this.$el, target).el; // 不存在拖拽元素时不允许拖拽

          if (!element) return true;
          if (element.animated) return;
          this.dragEl = element;
        } catch (err) {
          console.error("Sortable-dnd Error: ".concat(err));
          return true;
        }

        window.sortableDndOnDown = true; // 获取当前元素在列表中的位置

        var _utils$getElement = utils.getElement(this.$el, this.dragEl),
            index = _utils$getElement.index,
            el = _utils$getElement.el,
            rect = _utils$getElement.rect;

        if (!el || index < 0) return true; // 将拖拽元素克隆一份作为蒙版

        var ghostEl = this.dragEl.cloneNode(true);
        this.ghost.init(ghostEl, rect);
        this.ghost.set('x', rect.left);
        this.ghost.set('y', rect.top);
        this.diff.old.rect = rect;
        this.calcXY = {
          x: (touch || evt).clientX,
          y: (touch || evt).clientY
        };

        this._onMoveEvents(touch);

        this._onUpEvents(touch);
      }
    }, {
      key: "_onMove",
      value: function _onMove(evt) {
        evt.preventDefault();
        var touch = evt.touches && evt.touches[0];
        var e = touch || evt;
        var clientX = e.clientX,
            clientY = e.clientY;
        var target = touch ? document.elementFromPoint(clientX, clientY) : e.target;
        var chosenClass = this.options.chosenClass;
        utils.toggleClass(this.dragEl, chosenClass, true);
        this.ghost.move();
        if (!window.sortableDndOnDown) return;
        if (clientX < 0 || clientY < 0) return;
        document.body.style.cursor = 'grabbing';
        window.sortableDndOnMove = true;
        this.ghost.set('x', this.ghost.x + clientX - this.calcXY.x);
        this.ghost.set('y', this.ghost.y + clientY - this.calcXY.y);
        this.calcXY = {
          x: clientX,
          y: clientY
        };
        this.ghost.move();

        this._checkRange(e);

        var _utils$getElement2 = utils.getElement(this.$el, target),
            index = _utils$getElement2.index,
            el = _utils$getElement2.el,
            rect = _utils$getElement2.rect;

        var left = rect.left,
            right = rect.right,
            top = rect.top,
            bottom = rect.bottom;
        if (!el || index < 0 || top < 0) return;

        if (clientX > left && clientX < right && clientY > top && clientY < bottom) {
          this.dropEl = el; // 拖拽前后元素不一致时交换

          if (this.dropEl !== this.dragEl) {
            if (this.dropEl.animated) return;
            this.captureAnimationState();

            if (utils.index(this.$el, this.dragEl) < index) {
              this.$el.insertBefore(this.dragEl, this.dropEl.nextElementSibling);
            } else {
              this.$el.insertBefore(this.dragEl, this.dropEl);
            }

            this.animateRange();
            this.diff.old.node = this.dragEl;
            this.diff["new"].node = this.dropEl;
          }

          this.diff["new"].rect = utils.getRect(this.dropEl);
        }
      }
    }, {
      key: "_onDrop",
      value: function _onDrop() {
        this._offMoveEvents();

        this._offUpEvents();

        document.body.style.cursor = '';
        var _this$options3 = this.options,
            dragEnd = _this$options3.dragEnd,
            chosenClass = _this$options3.chosenClass;
        utils.toggleClass(this.dragEl, chosenClass, false);

        if (window.sortableDndOnDown && window.sortableDndOnMove) {
          // 拖拽完成触发回调函数
          if (dragEnd && typeof dragEnd === 'function') dragEnd(this.diff.old, this.diff["new"]);
        }

        this.diff.destroy();
        this.ghost.destroy();

        this._removeWindowState();
      }
    }, {
      key: "_checkRange",
      value: function _checkRange(e) {
        var _utils$getRect = utils.getRect(this.$el),
            top = _utils$getRect.top,
            left = _utils$getRect.left,
            right = _utils$getRect.right,
            bottom = _utils$getRect.bottom;

        if (e.clientX < left || e.clientX > right || e.clientY < top || e.clientY > bottom) {
          document.body.style.cursor = 'not-allowed';
          return;
        }
      }
    }, {
      key: "_resetState",
      value: function _resetState() {
        this.dragEl = null;
        this.dropEl = null;
        this.ghost.destroy();
        this.diff.destroy();

        this._removeWindowState();
      }
    }, {
      key: "_removeWindowState",
      value: function _removeWindowState() {
        window.sortableDndOnDown = null;
        window.sortableDndOnMove = null;
        delete window.sortableDndOnDown;
        delete window.sortableDndOnMove;
      }
    }, {
      key: "_onMoveEvents",
      value: function _onMoveEvents(touch) {
        var _this$options4 = this.options,
            supportPointer = _this$options4.supportPointer,
            ownerDocument = _this$options4.ownerDocument;

        if (supportPointer) {
          utils.on(ownerDocument, 'pointermove', this._onMove);
        } else if (touch) {
          utils.on(ownerDocument, 'touchmove', this._onMove);
        } else {
          utils.on(ownerDocument, 'mousemove', this._onMove);
        }
      }
    }, {
      key: "_onUpEvents",
      value: function _onUpEvents() {
        var ownerDocument = this.options.ownerDocument;
        utils.on(ownerDocument, 'pointerup', this._onDrop);
        utils.on(ownerDocument, 'touchend', this._onDrop);
        utils.on(ownerDocument, 'touchcancel', this._onDrop);
        utils.on(ownerDocument, 'mouseup', this._onDrop);
      }
    }, {
      key: "_offMoveEvents",
      value: function _offMoveEvents() {
        var ownerDocument = this.options.ownerDocument;
        utils.off(ownerDocument, 'pointermove', this._onMove);
        utils.off(ownerDocument, 'touchmove', this._onMove);
        utils.off(ownerDocument, 'mousemove', this._onMove);
      }
    }, {
      key: "_offUpEvents",
      value: function _offUpEvents() {
        var ownerDocument = this.options.ownerDocument;
        utils.off(ownerDocument, 'mouseup', this._onDrop);
        utils.off(ownerDocument, 'touchend', this._onDrop);
        utils.off(ownerDocument, 'touchcancel', this._onDrop);
        utils.off(ownerDocument, 'pointerup', this._onDrop);
      }
    }]);

    return Sortable;
  }();

  return Sortable;

}));

/*!
 * sortable-dnd v0.0.2
 * open source under the MIT license
 * https://github.com/mfuu/sortable-dnd#readme
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.sortable = factory());
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
  var utils = {
    on: function on(el, event, fn) {
      el.addEventListener(event, fn, !IE11OrLess && captureMode);
    },
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
    index: function index(group, el) {
      if (!el || !el.parentNode) return -1;

      var children = _toConsumableArray(Array.from(group.children));

      return children.indexOf(el);
    },
    getRect: function getRect(children, index) {
      if (!children.length) return {};
      if (index < 0) return {};
      return children[index].getBoundingClientRect();
    },
    getElement: function getElement(group, dragging) {
      var result = {
        index: -1,
        el: null,
        rect: {}
      };

      var children = _toConsumableArray(Array.from(group.children)); // 如果能直接在子元素中找到，返回对应的index


      var index = children.indexOf(dragging);
      if (index > -1) Object.assign(result, {
        index: index,
        el: children[index],
        rect: children[index].getBoundingClientRect()
      }); // children 中无法直接找到对应的dom时，需要向下寻找

      for (var i = 0; i < children.length; i++) {
        if (this.isChildOf(dragging, children[i])) Object.assign(result, {
          index: i,
          el: children[i],
          rect: children[i].getBoundingClientRect()
        });
      }

      return result;
    },
    // 判断子元素是否包含在父元素中
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
    animate: function animate(el, preRect) {
      var _this = this;

      var animation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 300;
      var curRect = el.getBoundingClientRect();
      var left = preRect.left - curRect.left;
      var top = preRect.top - curRect.top;
      this.css(el, 'transition', 'none');
      this.css(el, 'transform', "translate3d(".concat(left, "px, ").concat(top, "px, 0)"));
      el.offsetLeft; // 触发重绘

      this.css(el, 'transition', "all ".concat(animation, "ms"));
      this.css(el, 'transform', 'translate3d(0px, 0px, 0px)');
      clearTimeout(el.animated);
      el.animated = setTimeout(function () {
        _this.css(el, 'transition', '');

        _this.css(el, 'transform', '');

        el.animated = null;
      }, animation);
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
        var _this2 = this;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        clearTimeout(fn.id);
        fn.id = setTimeout(function () {
          fn.call.apply(fn, [_this2].concat(args));
        }, delay);
      };
    }
  };

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
      value: function init(el) {
        if (!el) {
          console.error('Ghost Element is required');
          return;
        }

        this.$el = el;
        var _this$options = this.options,
            ghostClass = _this$options.ghostClass,
            _this$options$ghostSt = _this$options.ghostStyle,
            ghostStyle = _this$options$ghostSt === void 0 ? {} : _this$options$ghostSt;
        this.$el["class"] = ghostClass; // this.$el.style.width = rect.width
        // this.$el.style.height = rect.height

        this.$el.style.transform = '';
        this.$el.style.transition = '';
        this.$el.style.position = 'fixed';
        this.$el.style.left = 0;
        this.$el.style.top = 0;
        this.$el.style.zIndex = 100000;
        this.$el.style.opacity = 0.8;
        this.$el.style.pointerEvents = 'none'; // utils.css(this.$el, 'width', rect.width)
        // utils.css(this.$el, 'height', rect.height)

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

  /**
   * @interface Options {
   * 
   * group: HTMLElement,
   * 
   * draggable?: Function, return element node selected when dragging, or null
   * 
   * dragEnd?: Function, The callback function when the drag is completed
   * 
   * ghostStyle?: Object,
   * 
   * ghostClass?: String,
   * 
   * }
   */

  var Sortable = /*#__PURE__*/function () {
    function Sortable(options) {
      _classCallCheck(this, Sortable);

      this.group = options.group; // 父级元素

      this.dragging = options.dragging; // 必须为函数且必须返回一个 HTMLElement (e) => return e.target

      this.dragEnd = options.dragEnd; // 拖拽完成时的回调函数，返回两个值(olddom, newdom) => {}

      this.ghostStyle = options.ghostStyle; // 克隆元素包含的属性

      this.ghostClass = options.ghostClass; // 克隆元素的类名

      this.animation = options.animation || 300; // 动画延迟

      this.rectList = []; // 用于保存拖拽项getBoundingClientRect()方法获得的数据

      this.isMousedown = false; // 记录鼠标按下

      this.isMousemove = false; // 记录鼠标移动

      this.dragEl = null; // 拖拽元素

      this.dropEl = null; // 释放元素

      this.diff = new Diff(); // 记录拖拽前后差异

      this.ghost = new Ghost({
        ghostClass: this.ghostClass,
        ghostStyle: this.ghostStyle
      });
      this.supportPointer = 'PointerEvent' in window && !Safari;
      this.calcXY = {
        x: 0,
        y: 0
      };
      utils.debounce(this.init(), 50); // 避免重复执行多次
    }

    _createClass(Sortable, [{
      key: "init",
      value: function init() {
        if (!this.group) {
          console.error('Error: group is required');
          return;
        }

        this._bindEventListener();
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this._unbindEventListener();

        this._resetState();
      }
    }, {
      key: "_onStart",
      value: function _onStart(e) {
        if (e.button !== 0) return true;
        if (e.target === this.group) return true;

        try {
          // 获取拖拽元素
          var element = this.dragging ? this.dragging(e) : e.target; // 不存在拖拽元素时不允许拖拽

          if (!element) return true;
          if (element.animated) return;
          this.dragEl = element;
        } catch (e) {
          //
          return true;
        }

        this.isMousedown = true; // 获取当前元素在列表中的位置

        var _utils$getElement = utils.getElement(this.group, this.dragEl),
            index = _utils$getElement.index,
            el = _utils$getElement.el,
            rect = _utils$getElement.rect;

        if (!el || index < 0) return true; // 将拖拽元素克隆一份作为蒙版

        var ghostEl = this.dragEl.cloneNode(true);
        var groupEl = this.group.cloneNode(false);
        groupEl.appendChild(ghostEl);
        this.ghost.init(groupEl);
        this.diff.old.rect = rect;
        this.ghost.set('x', rect.left);
        this.ghost.set('y', rect.top); // 记录拖拽移动时坐标

        this.calcXY = {
          x: e.clientX,
          y: e.clientY
        };

        this._onMoveEvents();

        this._onUpEvents();
      }
    }, {
      key: "_onMove",
      value: function _onMove(e) {
        this.ghost.move();
        e.preventDefault();
        if (!this.isMousedown) return;
        document.body.style.cursor = 'grabbing';
        this.isMousemove = true;
        this.ghost.set('x', this.ghost.x + e.clientX - this.calcXY.x);
        this.ghost.set('y', this.ghost.y + e.clientY - this.calcXY.y);
        this.calcXY = {
          x: e.clientX,
          y: e.clientY
        };
        this.ghost.move();

        this._checkRange(e);

        var _utils$getElement2 = utils.getElement(this.group, e.target),
            index = _utils$getElement2.index,
            el = _utils$getElement2.el,
            rect = _utils$getElement2.rect;

        if (!el || index < 0) return;
        var left = rect.left,
            right = rect.right,
            top = rect.top,
            bottom = rect.bottom;

        if (e.clientX > left && e.clientX < right && e.clientY > top && e.clientY < bottom) {
          this.dropEl = el; // 拖拽前后元素不一致时交换

          if (this.dropEl !== this.dragEl) {
            var dragRect = this.dragEl.getBoundingClientRect();
            var dropRect = this.dropEl.getBoundingClientRect(); // if (this.dragEl.animated) return

            if (this.dropEl.animated) return;

            if (utils.index(this.group, this.dragEl) < index) {
              this.group.insertBefore(this.dragEl, this.dropEl.nextElementSibling);
            } else {
              this.group.insertBefore(this.dragEl, this.dropEl);
            } // 设置动画


            utils.animate(this.dragEl, dragRect, this.animation);
            utils.animate(this.dropEl, dropRect, this.animation);
            this.diff.old.node = this.dragEl;
            this.diff["new"].node = this.dropEl;
          }

          this.diff["new"].rect = this.dropEl.getBoundingClientRect();
        }
      }
    }, {
      key: "_onDrop",
      value: function _onDrop() {
        this._offMoveEvents();

        this._offUpEvents();

        document.body.style.cursor = '';

        if (this.isMousedown && this.isMousemove) {
          // 拖拽完成触发回调函数
          if (this.dragEnd && typeof this.dragEnd === 'function') this.dragEnd(this.diff.old, this.diff["new"]);
        }

        this.isMousedown = false;
        this.isMousemove = false;
        this.diff.destroy();
        this.ghost.destroy();
      }
    }, {
      key: "_checkRange",
      value: function _checkRange(e) {
        var _this$group$getBoundi = this.group.getBoundingClientRect(),
            top = _this$group$getBoundi.top,
            left = _this$group$getBoundi.left,
            right = _this$group$getBoundi.right,
            bottom = _this$group$getBoundi.bottom;

        if (e.clientX < left || e.clientX > right || e.clientY < top || e.clientY > bottom) {
          document.body.style.cursor = 'not-allowed';
        }
      }
    }, {
      key: "_resetState",
      value: function _resetState() {
        this.isMousedown = false;
        this.isMousemove = false;
        this.rectList.length = 0;
        this.dragEl = null;
        this.dropEl = null;
        this.ghost.destroy();
        this.diff = new Diff();
      }
    }, {
      key: "_bindEventListener",
      value: function _bindEventListener() {
        this._onStart = this._onStart.bind(this);
        this._onMove = this._onMove.bind(this);
        this._onDrop = this._onDrop.bind(this);

        if (this.supportPointer) {
          utils.on(this.group, 'pointerdown', this._onStart);
        } else {
          utils.on(this.group, 'mousedown', this._onStart);
        }
      }
    }, {
      key: "_onMoveEvents",
      value: function _onMoveEvents() {
        if (this.supportPointer) {
          utils.on(document, 'pointermove', this._onMove);
        } else {
          utils.on(document, 'mousemove', this._onMove);
        }
      }
    }, {
      key: "_onUpEvents",
      value: function _onUpEvents() {
        if (this.supportPointer) {
          utils.on(document, 'pointerup', this._onDrop);
        } else {
          utils.on(document, 'mouseup', this._onDrop);
        }
      }
    }, {
      key: "_unbindEventListener",
      value: function _unbindEventListener() {
        utils.off(this.group, 'mousedown', this._onStart);
        utils.off(this.group, 'pointerdown', this._onStart);
      }
    }, {
      key: "_offMoveEvents",
      value: function _offMoveEvents() {
        utils.off(document, 'mousemove', this._onMove);
        utils.off(document, 'pointermove', this._onMove);
      }
    }, {
      key: "_offUpEvents",
      value: function _offUpEvents() {
        utils.off(document, 'mouseup', this._onDrop);
        utils.off(document, 'pointerup', this._onDrop);
      }
    }]);

    return Sortable;
  }();

  return Sortable;

}));

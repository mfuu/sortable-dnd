/*!
 * sortable-dnd v0.6.22
 * open source under the MIT license
 * https://github.com/mfuu/sortable-dnd#readme
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Sortable = factory());
})(this, (function () { 'use strict';

  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }

  var captureMode = {
    capture: false,
    passive: false
  };
  var R_SPACE = /\s+/g;
  function userAgent(pattern) {
    if (typeof window !== 'undefined' && window.navigator) {
      return !!( /*@__PURE__*/navigator.userAgent.match(pattern));
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
  (function () {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // Server environment
      return '';
    }

    // window.getComputedStyle() returns null inside an iframe with `display: none`
    // in this case return an array with a fake mozilla style in it.
    var styles = window.getComputedStyle(document.documentElement, '') || ['-moz-hidden-iframe'];
    var pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || styles.OLink === '' && ['', 'o'])[1];
    return pre ? "-".concat(pre, "-") : '';
  })();

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
   * get scrolling element
   */
  function getAutoScrollElement(el, includeSelf) {
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
        /* jshint boss:true */
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
  function containes(el, parent) {
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
      if (el.nodeName.toUpperCase() !== 'TEMPLATE' && (!selector || matches(el, selector)) && css(el, 'display') !== 'none') {
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
  function repaint(el) {
    return el.offsetWidth;
  }

  /**
   * Reports the position of its argument node relative to the node on which it is called.
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
      callback(_extends({}, evt));
    }
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
      var _this = this;
      this.nulling();
      this.autoScrollInterval = setInterval(function () {
        _this.autoScroll();
      });
    },
    onMove: function onMove(scrollEl, moveEvent, options) {
      this.options = options;
      this.scrollEl = scrollEl;
      this.moveEvent = moveEvent;
    },
    autoScroll: function autoScroll() {
      var event = this.moveEvent;
      var scrollEl = this.scrollEl;
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
      var _this$options = this.options,
        scrollThreshold = _this$options.scrollThreshold,
        scrollSpeed = _this$options.scrollSpeed;
      var scrollTop = scrollEl.scrollTop,
        scrollLeft = scrollEl.scrollLeft,
        scrollHeight = scrollEl.scrollHeight,
        scrollWidth = scrollEl.scrollWidth;

      // check direction
      var toTop = scrollTop > 0 && clientY >= top && clientY <= top + scrollThreshold,
        toLeft = scrollLeft > 0 && clientX >= left && clientX <= left + scrollThreshold,
        toRight = scrollLeft + width < scrollWidth && clientX <= right && clientX >= right - scrollThreshold,
        toBottom = scrollTop + height < scrollHeight && clientY <= bottom && clientY >= bottom - scrollThreshold;
      if (toLeft) {
        scrollEl.scrollLeft += Math.floor(Math.max(-1, (clientX - left) / scrollThreshold - 1) * scrollSpeed.x);
      }
      if (toRight) {
        scrollEl.scrollLeft += Math.ceil(Math.min(1, (clientX - right) / scrollThreshold + 1) * scrollSpeed.x);
      }
      if (toTop) {
        scrollEl.scrollTop += Math.floor(Math.max(-1, (clientY - top) / scrollThreshold - 1) * scrollSpeed.y);
      }
      if (toBottom) {
        scrollEl.scrollTop += Math.ceil(Math.min(1, (clientY - bottom) / scrollThreshold + 1) * scrollSpeed.y);
      }
    }
  };

  function Animation(options) {
    this.options = options;
    this.stack = [];
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
      for (var i = 0, len = children.length; i <= len; i++) {
        var el = children[i];
        if (!el || el === Sortable.ghost || css(el, 'display') === 'none') continue;
        var rect = getRect(el);
        if (rect.bottom < 0 || rect.right < 0) continue;

        // Animate only elements within the visible area
        if (rect.top - rect.height > maxHeight || rect.left - rect.width > maxWidth) break;
        animations.push({
          el: el,
          rect: rect
        });
      }
      this.stack.push(animations);
    },
    animate: function animate() {
      var animations = this.stack.pop();
      if (!animations || !this.options.animation) return;
      for (var i = 0, len = animations.length; i < len; i++) {
        var _animations$i = animations[i],
          el = _animations$i.el,
          rect = _animations$i.rect;
        this.execute(el, rect);
      }
    },
    execute: function execute(el, fromRect) {
      var toRect = getRect(el);
      if (toRect.top === fromRect.top && toRect.left === fromRect.left) return;
      var dx = fromRect.left - toRect.left;
      var dy = fromRect.top - toRect.top;
      css(el, 'transition', '');
      css(el, 'transform', "translate3d(".concat(dx, "px, ").concat(dy, "px, 0)"));
      this.repaintDummy = repaint(el);
      var _this$options = this.options,
        animation = _this$options.animation,
        easing = _this$options.easing;
      css(el, 'transition', "transform ".concat(animation, "ms ").concat(easing ? ' ' + easing : ''));
      css(el, 'transform', 'translate3d(0px, 0px, 0px)');
      typeof el.animated === 'number' && clearTimeout(el.animated);
      el.animated = setTimeout(function () {
        css(el, 'transition', '');
        css(el, 'transform', '');
        el.animated = null;
      }, animation);
    }
  };

  var dragElements, cloneElements, _useSelectHandle;
  function Multiple(options) {
    this.options = options || {};
    this.selects = [];
  }
  Multiple.prototype = {
    eventProperties: function eventProperties() {
      return {
        nodes: dragElements || [],
        clones: cloneElements || []
      };
    },
    isActive: function isActive() {
      return !!dragElements;
    },
    nulling: function nulling() {
      dragElements = cloneElements = _useSelectHandle = null;
    },
    select: function select(element) {
      toggleClass(element, this.options.selectedClass, true);
      this.selects.push(element);
      this.selects.sort(function (a, b) {
        return sort(a, b);
      });
    },
    deselect: function deselect(element) {
      var index = this.selects.indexOf(element);
      if (index > -1) {
        toggleClass(element, this.options.selectedClass, false);
        this.selects.splice(index, 1);
      }
    },
    useSelectHandle: function useSelectHandle(event, target) {
      var selectHandle = this.options.selectHandle;
      _useSelectHandle = typeof selectHandle === 'function' && selectHandle(event) || typeof selectHandle === 'string' && matches(target, selectHandle);
      return !!_useSelectHandle;
    },
    onChoose: function onChoose() {
      if (!this.options.multiple || this.selects.length === 0 || this.selects.indexOf(Sortable.dragged) < 0) {
        return;
      }
      this.selects.sort(function (a, b) {
        return sort(a, b);
      });
      dragElements = this.selects;
      this.toggleChosenClass(true);
    },
    onDrop: function onDrop(from, to, isClone) {
      if (!dragElements) return;
      var dragEl = Sortable.dragged,
        cloneEl = Sortable.clone,
        dragIndex = dragElements.indexOf(dragEl);
      if (from !== to && isClone) {
        css(cloneEl, 'display', 'none');
        this.toggleVisible(true);
        cloneElements = dragElements.map(function (el) {
          return el.cloneNode(true);
        });
        this.sortElements(cloneElements, dragIndex, cloneEl);
      } else {
        this.sortElements(dragElements, dragIndex, cloneEl);
      }

      // Recalculate selected elements
      if (from !== to) {
        to[expando].multiplayer.toggleSelected(cloneElements || dragElements, 'add');
        !isClone && from[expando].multiplayer.toggleSelected(dragElements, 'remove');
      }
    },
    onSelect: function onSelect(event, dragEl, startEl, sortable) {
      var _this$options = this.options,
        multiple = _this$options.multiple,
        selectHandle = _this$options.selectHandle;
      if (!(multiple && (selectHandle && _useSelectHandle || !selectHandle && !startEl))) {
        return;
      }
      var dragIndex = this.selects.indexOf(dragEl);
      toggleClass(dragEl, this.options.selectedClass, dragIndex < 0);
      var evt = {
        from: sortable.el,
        event: event,
        node: dragEl,
        index: index(dragEl)
      };
      if (dragIndex < 0) {
        this.selects.push(dragEl);
        dispatchEvent({
          sortable: sortable,
          name: 'onSelect',
          evt: evt
        });
      } else {
        this.selects.splice(dragIndex, 1);
        dispatchEvent({
          sortable: sortable,
          name: 'onDeselect',
          evt: evt
        });
      }
      this.selects.sort(function (a, b) {
        return sort(a, b);
      });
    },
    toggleChosenClass: function toggleChosenClass(state) {
      if (!dragElements) return;
      for (var i = 0, len = dragElements.length; i < len; i++) {
        toggleClass(dragElements[i], this.options.chosenClass, state);
      }
    },
    toggleVisible: function toggleVisible(visible) {
      if (!dragElements) return;
      for (var i = 0, len = dragElements.length; i < len; i++) {
        if (dragElements[i] == Sortable.dragged) continue;
        css(dragElements[i], 'display', visible ? '' : 'none');
      }
    },
    toggleSelected: function toggleSelected(elements, status) {
      var _this = this;
      if (status === 'add') {
        elements.forEach(function (el) {
          return _this.selects.push(el);
        });
      } else {
        this.selects = this.selects.filter(function (el) {
          return elements.indexOf(el) < 0;
        });
      }
    },
    sortElements: function sortElements(elements, index, target) {
      for (var i = 0, len = elements.length; i < len; i++) {
        css(elements[i], 'display', '');
        if (i < index) {
          target.parentNode.insertBefore(elements[i], target);
        } else {
          var dropEl = i > 0 ? elements[i - 1] : target;
          target.parentNode.insertBefore(elements[i], dropEl.nextSibling);
        }
      }
    }
  };

  var sortables = [];
  var to, from, dragEl, dropEl, nextEl, cloneEl, ghostEl, startEl, targetEl, parentEl, pullMode, oldIndex, newIndex, startIndex, dragEvent, moveEvent, lastDropEl, cloneEvent, cloneTarget, listenerNode, lastHoverArea, dragStartTimer;
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
  function _positionChanged(evt) {
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
      sortable: true,
      disabled: false,
      multiple: false,
      lockAxis: '',
      direction: '',
      animation: 150,
      easing: '',
      draggable: '>*',
      selectHandle: null,
      customGhost: null,
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
      placeholderClass: '',
      swapOnDrop: true,
      removeCloneOnDrop: true,
      fallbackOnBody: false,
      supportTouch: 'ontouchstart' in window,
      emptyInsertThreshold: -1
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
    on(el, this.options.supportTouch ? 'touchstart' : 'mousedown', this._onDrag);
    this.autoScroller = new AutoScroll(this.options);
    this.multiplayer = new Multiple(this.options);
    this.animator = new Animation(this.options);
    sortables.push(el);
  }
  Sortable.prototype = {
    constructor: Sortable,
    _onDrag: function _onDrag(event) {
      var _this = this;
      // Don't trigger start event when an element is been dragged
      if (dragEl || this.options.disabled || !this.options.group.pull) return;

      // only left button and enabled
      if (/mousedown|pointerdown/.test(event.type) && event.button !== 0) return;
      var touch = event.touches && event.touches[0],
        target = (touch || event).target;

      // Safari ignores further event handling after mousedown
      if (Safari && target && target.tagName.toUpperCase() === 'SELECT') return;
      var element = closest(target, this.options.draggable, this.el);

      // No dragging is allowed when there is no dragging element
      if (!element || element.animated) return;
      dragEvent = {
        event: event,
        clientX: (touch || event).clientX,
        clientY: (touch || event).clientY
      };
      dragEl = element;
      listenerNode = touch ? dragEl : document;
      on(listenerNode, 'mouseup', this._onDrop);
      on(listenerNode, 'touchend', this._onDrop);
      on(listenerNode, 'touchcancel', this._onDrop);

      // use multi-select-handle
      if (this.multiplayer.useSelectHandle(event, target)) return;
      var handle = this.options.handle;
      if (typeof handle === 'function' && !handle(event)) return;
      if (typeof handle === 'string' && !matches(target, handle)) return;
      var _this$options = this.options,
        delay = _this$options.delay,
        delayOnTouchOnly = _this$options.delayOnTouchOnly;
      // Delay is impossible for native DnD in Edge or IE
      if (delay && (!delayOnTouchOnly || touch) && !(Edge || IE11OrLess)) {
        on(this.el.ownerDocument, 'touchmove', this._delayMoveHandler);
        on(this.el.ownerDocument, 'mousemove', this._delayMoveHandler);
        on(this.el.ownerDocument, 'mouseup', this._cancelStart);
        on(this.el.ownerDocument, 'touchend', this._cancelStart);
        on(this.el.ownerDocument, 'touchcancel', this._cancelStart);
        dragStartTimer = setTimeout(function () {
          return _this._onStart(touch, event);
        }, delay);
      } else {
        this._onStart(touch, event);
      }

      // Do not allow text to be selected when draggable
      on(document, 'selectstart', preventDefault);
      Safari && css(document.body, 'user-select', 'none');
    },
    _delayMoveHandler: function _delayMoveHandler(event) {
      var evt = event.touches ? event.touches[0] : event;
      if (Math.max(Math.abs(evt.clientX - dragEvent.clientX), Math.abs(evt.clientY - dragEvent.clientY)) >= Math.floor(this.options.touchStartThreshold / (window.devicePixelRatio || 1))) {
        this._cancelStart();
      }
    },
    _cancelStart: function _cancelStart() {
      clearTimeout(dragStartTimer);
      off(this.el.ownerDocument, 'touchmove', this._delayMoveHandler);
      off(this.el.ownerDocument, 'mousemove', this._delayMoveHandler);
      off(this.el.ownerDocument, 'mouseup', this._cancelStart);
      off(this.el.ownerDocument, 'touchend', this._cancelStart);
      off(this.el.ownerDocument, 'touchcancel', this._cancelStart);
      off(document, 'selectstart', preventDefault);
      Safari && css(document.body, 'user-select', '');
    },
    _onStart: function _onStart(touch, event) {
      preventDefault(event);
      var i = index(dragEl);
      to = this.el;
      from = this.el;
      targetEl = dragEl;
      oldIndex = i;
      newIndex = i;
      startIndex = i;
      cloneEvent = {
        to: this.el,
        target: dragEl,
        newIndex: i,
        relative: 0
      };
      cloneTarget = dragEl;
      startEl = this.el;
      cloneEl = dragEl.cloneNode(true);
      parentEl = dragEl.parentNode;
      pullMode = this.options.group.pull;
      Sortable.clone = cloneEl;
      Sortable.active = this;
      Sortable.dragged = dragEl;
      this.multiplayer.onChoose();
      toggleClass(dragEl, this.options.chosenClass, true);
      dispatchEvent({
        sortable: this,
        name: 'onChoose',
        evt: this._getEventProperties(event)
      });
      on(listenerNode, touch ? 'touchmove' : 'mousemove', this._nearestSortable);

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
      this.animator.collect(parentEl);
      toggleClass(cloneEl, this.options.chosenClass, true);
      toggleClass(cloneEl, this.options.placeholderClass, true);
      this._appendGhost();
      this.multiplayer.toggleVisible(false);
      css(dragEl, 'display', 'none');
      dragEl.parentNode.insertBefore(cloneEl, dragEl);
      dispatchEvent({
        sortable: this,
        name: 'onDrag',
        evt: this._getEventProperties(dragEvent.event)
      });
      this.animator.animate();
      this.autoScroller.onStarted();
    },
    _getGhostElement: function _getGhostElement() {
      var customGhost = this.options.customGhost;
      if (typeof customGhost === 'function') {
        var selects = this.multiplayer.selects;
        return customGhost(this.multiplayer.isActive() ? selects : [dragEl]);
      }
      return dragEl;
    },
    _appendGhost: function _appendGhost() {
      if (ghostEl) return;
      var container = this.options.fallbackOnBody ? document.body : this.el;
      var element = this._getGhostElement();
      ghostEl = element.cloneNode(true);
      toggleClass(ghostEl, this.options.ghostClass, true);
      var rect = getRect(dragEl);
      var style = _extends({
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        zIndex: '100000',
        opacity: '0.8',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transform: '',
        transition: '',
        pointerEvents: 'none'
      }, this.options.ghostStyle);
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
      if (!dragEl || !_positionChanged(evt)) return;

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
      var options = nearest ? nearest[expando].options : null;
      var scrollEl = null;
      if ((!nearest || options.autoScroll) && dragEvent && moveEvent) {
        scrollEl = getAutoScrollElement(target, true);
      }
      this.autoScroller.onMove(scrollEl, moveEvent, options || this.options);
    },
    _allowPut: function _allowPut() {
      if (startEl === this.el) {
        return true;
      }
      if (!this.options.group.put) {
        return false;
      }
      var _this$options$group = this.options.group,
        name = _this$options$group.name,
        put = _this$options$group.put;
      var fromGroup = startEl[expando].options.group;
      return put.join && put.indexOf(fromGroup.name) > -1 || fromGroup.name && name && fromGroup.name === name;
    },
    _getDirection: function _getDirection() {
      var _this$options2 = this.options,
        draggable = _this$options2.draggable,
        direction = _this$options2.direction;
      return direction ? typeof direction === 'function' ? direction.call(moveEvent.event, cloneEl, this) : direction : detectDirection(parentEl, draggable);
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
      if (dropEl === parentEl || containes(parentEl, dropEl)) {
        // The dragged element is the first child of its parent
        if (cloneEl === childf && mouseAxis < childfRect[front]) {
          nextEl = dropEl;
          return true;
        }
        // Dragged element is the last child of its parent
        if (cloneEl === childl && mouseAxis > childlRect[behind]) {
          nextEl = dropEl.nextSibling;
          return true;
        }
        return false;
      }
      var order = sort(cloneEl, dropEl);
      nextEl = order < 0 ? dropEl.nextSibling : dropEl;
      if (lastDropEl !== dropEl) {
        lastHoverArea = hoverArea;
        return true;
      }
      if (lastHoverArea !== hoverArea) {
        lastHoverArea = hoverArea;
        return hoverArea < 0 ? order > 0 : order < 0;
      }
      return false;
    },
    _onMove: function _onMove(event, target) {
      if (this.options.disabled || !this._allowPut()) return;
      dropEl = closest(target, this.options.draggable, this.el);
      dispatchEvent({
        sortable: this,
        name: 'onMove',
        evt: this._getEventProperties(event, {
          target: dropEl
        })
      });

      // dragEl is allowed to return to the original list in `sortable: false`
      if (!this.options.sortable && this.el === startEl) {
        if (from !== startEl) {
          dropEl = lastDropEl = dragEl;
          lastHoverArea = 0;
          this._onInsert(event);
        }
        return;
      }

      // insert to last
      if (this.el !== from && (target === this.el || !lastChild(this.el))) {
        dropEl = lastDropEl = null;
        this._onInsert(event);
        return;
      }
      if (!dropEl || dropEl.animated || containes(dropEl, cloneEl) || !this._allowSwap()) return;
      if (dropEl === cloneEl || nextEl === cloneEl) {
        lastDropEl = dropEl;
        return;
      }
      if (this.el !== from) {
        this._onInsert(event);
      } else if (dropEl !== dragEl) {
        this._onChange(event);
      }
      lastDropEl = dropEl;
    },
    _onInsert: function _onInsert(event) {
      var target = dropEl || cloneEl,
        cloneTo = pullMode === 'clone' && this.el !== startEl && from === startEl,
        cloneBack = pullMode === 'clone' && this.el === startEl && from !== startEl,
        dropExist = containes(dropEl, document),
        dragRemoved = dropEl === dragEl && !dropExist,
        fromSortable = from[expando],
        startSortable = startEl[expando];
      to = this.el;
      oldIndex = index(cloneEl);
      targetEl = target;
      parentEl = dropExist ? dropEl.parentNode : this.el;
      fromSortable.animator.collect(cloneEl.parentNode);
      this.animator.collect(parentEl);

      // show dragEl before clone to another list
      if (cloneTo) {
        cloneEvent.target = cloneTarget;
        cloneEvent.newIndex = oldIndex;
        cloneEvent.relative = cloneTarget === dragEl ? 0 : sort(cloneEl, cloneTarget);
        css(dragEl, 'display', '');
        startSortable.multiplayer.toggleVisible(true);
        if (!startSortable.options.group.revertDrag) {
          cloneEl.parentNode.insertBefore(dragEl, cloneEl);
        }
      }

      // hide dragEl when returning to the original list
      if (cloneBack) {
        oldIndex = index(dragEl);
        css(dragEl, 'display', 'none');
        this.multiplayer.toggleVisible(false);
      }
      css(cloneEl, 'display', dragRemoved ? 'none' : '');
      if (dropEl && dropExist) {
        parentEl.insertBefore(cloneEl, lastHoverArea < 0 ? dropEl : dropEl.nextSibling);
      } else {
        parentEl.appendChild(cloneEl);
      }
      newIndex = dragRemoved ? startIndex : index(cloneEl);
      if (cloneTo && startSortable.options.group.revertDrag) {
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
      if (!cloneTo) {
        dispatchEvent({
          sortable: fromSortable,
          name: 'onRemove',
          evt: this._getEventProperties(event, {
            newIndex: -1
          })
        });
      }
      if (cloneBack && target !== dragEl) {
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
      if (!cloneBack) {
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
      from = this.el;
    },
    _onChange: function _onChange(event) {
      this.animator.collect(parentEl);
      oldIndex = index(cloneEl);
      parentEl = dropEl.parentNode;
      targetEl = dropEl;
      if (this.el === startEl) {
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
      from = this.el;
    },
    _onDrop: function _onDrop(event) {
      this._cancelStart();
      off(listenerNode, 'touchmove', this._nearestSortable);
      off(listenerNode, 'mousemove', this._nearestSortable);
      off(listenerNode, 'mouseup', this._onDrop);
      off(listenerNode, 'touchend', this._onDrop);
      off(listenerNode, 'touchcancel', this._onDrop);
      if (startEl) {
        from = startEl;
        oldIndex = startIndex;
        if (targetEl === cloneEl) {
          targetEl = dragEl;
        }
        this.animator.collect(parentEl);
        this.multiplayer.toggleChosenClass(false);
        toggleClass(dragEl, this.options.chosenClass, false);
        dispatchEvent({
          sortable: this,
          name: 'onUnchoose',
          evt: this._getEventProperties(event)
        });
        moveEvent && this._onEnd(event);
        !moveEvent && this.animator.animate();
      }

      // check whether the event is a click event
      var evt = event.changedTouches ? event.changedTouches[0] : event;
      !_positionChanged(evt) && this.multiplayer.onSelect(event, dragEl, startEl, this);
      if (ghostEl && ghostEl.parentNode) {
        ghostEl.parentNode.removeChild(ghostEl);
      }
      this._nulling();
    },
    _onEnd: function _onEnd(event) {
      toggleClass(cloneEl, this.options.chosenClass, false);
      toggleClass(cloneEl, this.options.placeholderClass, false);
      var isClone = pullMode === 'clone';
      this.multiplayer.onDrop(from, to, isClone);
      var evt = this._getEventProperties(event);

      // swap real drag element to the current drop position
      var _this$options3 = this.options,
        swapOnDrop = _this$options3.swapOnDrop,
        removeCloneOnDrop = _this$options3.removeCloneOnDrop;
      if ((!isClone || from === to) && (typeof swapOnDrop === 'function' ? swapOnDrop(evt) : swapOnDrop)) {
        parentEl.insertBefore(dragEl, cloneEl);
      }
      if ((!isClone || from === to || this.multiplayer.isActive()) && (typeof removeCloneOnDrop === 'function' ? removeCloneOnDrop(evt) : removeCloneOnDrop)) {
        cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
      }
      css(dragEl, 'display', '');
      this.animator.animate();
      if (from !== to) {
        dispatchEvent({
          sortable: from[expando],
          name: 'onDrop',
          evt: _extends({}, evt, isClone ? cloneEvent : {
            newIndex: -1
          })
        });
      }
      dispatchEvent({
        sortable: to[expando],
        name: 'onDrop',
        evt: _extends({}, evt, from === to ? {} : {
          oldIndex: -1
        })
      });
    },
    _getEventProperties: function _getEventProperties(originalEvent) {
      var extra = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var evt = {};
      evt.event = originalEvent;
      evt.to = to;
      evt.from = from;
      evt.node = dragEl;
      evt.clone = cloneEl;
      evt.target = targetEl;
      evt.oldIndex = oldIndex;
      evt.newIndex = newIndex;
      evt.pullMode = pullMode;
      _extends(evt, this.multiplayer.eventProperties(), extra);
      evt.relative = targetEl === dragEl ? 0 : sort(cloneEl, targetEl);
      return evt;
    },
    _nulling: function _nulling() {
      to = from = dragEl = dropEl = nextEl = cloneEl = ghostEl = startEl = targetEl = parentEl = pullMode = oldIndex = newIndex = startIndex = dragEvent = moveEvent = lastDropEl = cloneEvent = cloneTarget = listenerNode = lastHoverArea = dragStartTimer = Sortable.clone = Sortable.ghost = Sortable.active = Sortable.dragged = null;
      this.multiplayer.nulling();
      this.autoScroller.nulling();
    },
    destroy: function destroy() {
      this._cancelStart();
      this._nulling();
      off(this.el, 'touchstart', this._onDrag);
      off(this.el, 'mousedown', this._onDrag);
      var index = sortables.indexOf(this.el);
      index > -1 && sortables.splice(index, 1);
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
      return this.multiplayer.selects;
    }
  };
  Sortable.utils = {
    on: on,
    off: off,
    css: css,
    index: index,
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
